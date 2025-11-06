#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const projectType = args.find(arg => arg.startsWith('--project='))?.split('=')[1];

// 读取swagger.json
const swaggerPath = path.join(__dirname, '../apps/lago-server/swagger.json');
if (!fs.existsSync(swaggerPath)) {
  console.error('错误: 找不到 swagger.json 文件，请先运行服务器生成 swagger.json');
  process.exit(1);
}
const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// 根据项目类型确定输出目录
const outputDirs = {
  app: path.join(__dirname, '../apps/lago-app/src/lib/apis'),
  operation: path.join(__dirname, '../apps/lago-operation/src/lib/apis'),
};

const outputDir = outputDirs[projectType];
if (!outputDir) {
  console.error(`错误: 不支持的项目类型: ${projectType}，支持的类型: app, operation`);
  process.exit(1);
}

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 定义 tag 过滤规则
const tagMappings = {
  app: ['Auth'],
  operation: ['AdminUsers', 'AdminProducts', 'AdminOrders', 'AdminDashboard', 'AdminAuth'],
};

// 类型映射
const typeMapping = {
  'string': 'string',
  'integer': 'number',
  'number': 'number',
  'boolean': 'boolean',
  'array': 'any[]',
  'object': 'any'
};

// 验证装饰器映射
const validatorMapping = {
  'string': 'IsString',
  'integer': 'IsNumber',
  'number': 'IsNumber',
  'boolean': 'IsBoolean',
  'array': 'IsArray',
  'object': 'IsObject'
};

// 生成类型定义
function generateTypeDefinition(schema, name, enumTypes = null, inline = false) {
  if (!schema || !schema.properties) {
    return '';
  }

  let typeDef = `export class ${name} {\n`;
  
  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const isOptional = !schema.required || !schema.required.includes(propName);
    const type = getTypeFromSchema(propSchema, enumTypes, inline);
    const validatorCall = generateValidatorCall(propSchema, enumTypes, inline);
    
    typeDef += `  ${validatorCall}\n`;
    if (isOptional) {
      typeDef += `  @IsOptional()\n`;
    }
    typeDef += `  ${propName}${isOptional ? '?' : ''}: ${type};\n\n`;
  }
  
  typeDef += '}\n';
  return typeDef;
}

// 从schema获取类型
function getTypeFromSchema(schema, enumTypes = null, inline = false) {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }
  
  if (schema.type === 'array') {
    const itemsType = schema.items ? getTypeFromSchema(schema.items, enumTypes, inline) : 'any';
    return `${itemsType}[]`;
  }
  
  if (schema.enum) {
    if (enumTypes && enumTypes[schema.enum[0]]) {
      return enumTypes[schema.enum[0]];
    }
    return 'string';
  }
  
  return typeMapping[schema.type] || 'any';
}

// 生成验证装饰器调用
function generateValidatorCall(schema, enumTypes = null, inline = false) {
  if (schema.$ref) {
    return '@ValidateNested()\n  @Type(() => Types.' + schema.$ref.split('/').pop() + ')';
  }
  
  if (schema.type === 'array') {
    return '@IsArray()\n  @ValidateNested({ each: true })\n  @Type(() => ' + (schema.items && schema.items.$ref ? 'Types.' + schema.items.$ref.split('/').pop() : 'Object') + ')';
  }
  
  if (schema.enum) {
    return `@IsEnum(${enumTypes && enumTypes[schema.enum[0]] ? enumTypes[schema.enum[0]] : 'String'})`;
  }
  
  const validator = validatorMapping[schema.type] || 'IsString';
  return `@${validator}()`;
}

// 提取枚举类型
function extractEnumTypes(schemas) {
  const enumTypes = {};
  
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.enum) {
      enumTypes[name] = name;
    }
    
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.enum) {
          const enumName = `${name}${propName.charAt(0).toUpperCase() + propName.slice(1)}Enum`;
          enumTypes[enumName] = enumName;
        }
      }
    }
  }
  
  return enumTypes;
}

// 生成参数类型
function generateParamTypes(path, method, operation, functionName, enumTypes) {
  let types = '';
  
  // 路径参数
  const pathParams = getPathParams(path);
  if (pathParams.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    types += `export class ${pathParamsType} {\n`;
    pathParams.forEach(param => {
      types += `  @IsString()\n  ${param}!: string;\n\n`;
    });
    types += '}\n\n';
  }
  
  // 查询参数
  if (operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      types += `export class ${queryParamsType} {\n`;
      queryParams.forEach(param => {
        const isOptional = !param.required;
        const type = getTypeFromSchema(param.schema || { type: param.type || 'string' }, enumTypes);
        const validatorCall = generateValidatorCall(param.schema || { type: param.type || 'string' }, enumTypes);
        types += `  ${validatorCall}\n`;
        if (isOptional) {
          types += `  @IsOptional()\n`;
        }
        types += `  ${param.name}${isOptional ? '?' : ''}: ${type};\n\n`;
      });
      types += '}\n\n';
    }
  }
  
  return types;
}

// 获取路径参数
function getPathParams(path) {
  const matches = path.match(/\{([^}]+)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)) : [];
}

// 获取参数类型名
function getParamTypeName(functionName, suffix) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1);
  return `${baseName}${suffix}`;
}

// 获取请求体类型
function getRequestBodyType(operation, functionName) {
  if (!operation.requestBody || !operation.requestBody.content) {
    return null;
  }
  
  const jsonContent = operation.requestBody.content['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return null;
  }
  
  if (jsonContent.schema.$ref) {
    return 'Types.' + jsonContent.schema.$ref.split('/').pop();
  }
  
  const requestBodyType = getParamTypeName(functionName, 'RequestBody');
  return requestBodyType;
}

// 获取响应类型
function getResponseType(operation, functionName) {
  const responses = operation.responses || {};
  const successResponse = responses['200'] || responses['201'] || responses['204'];
  
  if (!successResponse || !successResponse.content) {
    return 'any';
  }
  
  const jsonContent = successResponse.content['application/json'];
  if (!jsonContent || !jsonContent.schema) {
    return 'any';
  }
  
  if (jsonContent.schema.$ref) {
    return 'Types.' + jsonContent.schema.$ref.split('/').pop();
  }
  
  return getResponseTypeName(functionName);
}

// 获取响应类型名
function getResponseTypeName(functionName) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1).replace('-', '');
  return `Types.${baseName}Response`;
}

// 生成函数名
function getFunctionName(path, method, operation) {
  if (operation.operationId) {
    return operation.operationId;
  }
  
  const pathParts = path.split('/').filter(p => p && !p.startsWith('{'));
  const methodPrefix = method.toLowerCase();
  const pathName = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  
  return methodPrefix + pathName;
}

// 生成API函数
function generateApiFunction(path, method, operation, customFunctionName = null) {
  const functionName = customFunctionName || getFunctionName(path, method, operation);
  const params = getPathParams(path);
  let hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  const isGet = method.toLowerCase() === 'get';
  
  let func = `/**
 * ${operation.summary || operation.operationId || functionName}
 */
export async function ${functionName}(\n`;
  
  // 参数
  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }
  
  if (hasBody) {
    const requestBodyType = getRequestBodyType(operation, functionName);
    if (requestBodyType) {
      paramList.push(`  data: ${requestBodyType}`);
    } else {
      hasBody = false;
    }
  }
  
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      paramList.push(`  queryParams?: ${queryParamsType}`);
    }
  }
  
  paramList.push('  noAuthorize?: boolean');
  
  func += paramList.join(',\n');
  
  // 返回类型
  const responseType = getResponseType(operation, functionName);
  func += `\n): Promise<HTTPResponse<${responseType}>> {\n`;
  
  // 构建URL
  let url = path;
  if (params.length > 0) {
    url = path.replace(/\{([^}]+)\}/g, (match, param) => `\${pathParams.${param}}`);
    url = `\`${url}\``;
  } else {
    url = `"${url}"`;
  }
  
  // 构建请求选项
  func += '  return await apiRequest(' + url + ', {\n';
  func += `    method: '${method.toUpperCase()}',\n`;
  
  if (hasBody) {
    const hasFormData = operation.requestBody?.content?.['multipart/form-data'];
    if (hasFormData) {
      func += '    body: jsonToFormData(data),\n';
    } else {
      func += '    body: JSON.stringify(data),\n';
      func += "    headers: { 'Content-Type': 'application/json' },\n";
    }
  }
  
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      func += '    params: queryParams,\n';
    }
  }
  
  func += '    noAuthorize,\n';
  func += '  });\n';
  func += '}\n\n';
  
  return func;
}

// 生成 React Query Hook
function generateHook(path, method, operation, functionName) {
  const isMutation = ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase());
  
  if (isMutation) {
    return `/**
 * ${operation.summary || functionName} - Mutation Hook
 */
export function use${functionName.charAt(0).toUpperCase() + functionName.slice(1)}(
  options?: UseMutationOptions<HTTPResponse<${getResponseType(operation, functionName)}>, Error, any>
) {
  return useMutation({
    mutationFn: (vars: any) => ${functionName}(...vars),
    ...options,
  });
}\n\n`;
  } else {
    return `/**
 * ${operation.summary || functionName} - Query Hook
 */
export function use${functionName.charAt(0).toUpperCase() + functionName.slice(1)}(
  vars: any,
  options?: UseQueryOptions<HTTPResponse<${getResponseType(operation, functionName)}>, Error>
) {
  return useQuery({
    queryKey: ['${functionName}', vars],
    queryFn: () => ${functionName}(...vars),
    ...options,
  });
}\n\n`;
  }
}

// 生成枚举类型
function generateEnumTypes(enumTypes) {
  let enumContent = '';
  
  for (const [name, enumName] of Object.entries(enumTypes)) {
    enumContent += `export enum ${enumName} {\n`;
    // 这里需要从 schema 中获取枚举值，简化处理
    enumContent += `  // TODO: 添加枚举值\n`;
    enumContent += '}\n\n';
  }
  
  return enumContent;
}

// 用于跟踪已生成的函数名，避免重复
const usedFunctionNames = new Set();

// 主生成函数
function generateApiFiles() {
  console.log(`开始生成API代码 (项目: ${projectType}, 标签过滤: ${tagFilter || 'all'})...`);
  
  // 确定需要过滤的 tags
  const allowedTags = tagMappings[projectType] || [];
  
  // 提取枚举类型
  const enumTypes = extractEnumTypes(swagger.components?.schemas || {});
  
  // 生成所有类型定义到types.ts
  const typesFile = path.join(outputDir, 'types.ts');
  let typesContent = `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n`;
  typesContent += `import { Type } from 'class-transformer';\n\n`;
  
  // 生成枚举类型
  typesContent += generateEnumTypes(enumTypes);
  
  // 生成schemas中的类型
  if (swagger.components?.schemas) {
    for (const [name, schema] of Object.entries(swagger.components.schemas)) {
      typesContent += generateTypeDefinition(schema, name, enumTypes, true);
      typesContent += '\n';
    }
  }
  
  fs.writeFileSync(typesFile, typesContent);
  console.log(`生成类型定义: ${typesFile}`);
  
  // 按标签分组生成API文件
  const tagGroups = {};
  
  for (const [path, methods] of Object.entries(swagger.paths || {})) {
    for (const [method, operation] of Object.entries(methods)) {
      const tags = operation.tags || ['default'];
      const [tag, project] = tags[0];

      // 过滤：只包含指定项目的 tags
      if(project !== projectType && !allowedTags?.includes(tag)) {
        continue;  // 跳过不符合的接口
      }
      
      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }
      
      tagGroups[tag].push({ path, method, operation });
    }
  }
  
  if (Object.keys(tagGroups).length === 0) {
    console.warn(`警告: 没有找到匹配的接口 (项目: ${projectType}, 标签: ${allowedTags.join(', ')})`);
    return;
  }
  
  // 为每个标签生成API文件
  for (const [tag, apis] of Object.entries(tagGroups)) {
    const fileName = `${tag.toLowerCase()}.ts`;
    const filePath = path.join(outputDir, fileName);
    
    let content = `import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';\n`;
    content += `import { apiRequest, HTTPResponse, jsonToFormData } from '@lago/common';\n`;
    content += `import * as Types from './types';\n`;
    content += `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n`;
    content += `import { Type } from 'class-transformer';\n\n`;
    
    // 收集使用的类型
    const usedEnumTypes = new Set();
    const usedEntityTypes = new Set();
    
    // 生成参数和响应类型定义
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;
      
      // 确保函数名唯一
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);
      
      const paramTypes = generateParamTypes(path, method, operation, functionName, enumTypes);
      content += paramTypes;
    }
    
    // 重置用于API函数
    usedFunctionNames.clear();
    
    // 生成API函数
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;
      
      // 确保函数名唯一
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);
      
      content += generateApiFunction(path, method, operation, functionName);
    }
    
    // 重置用于hooks
    usedFunctionNames.clear();
    
    // 生成Hooks
    for (const { path, method, operation } of apis) {
      let functionName = getFunctionName(path, method, operation);
      let counter = 1;
      const originalName = functionName;
      
      // 确保函数名唯一
      while (usedFunctionNames.has(functionName)) {
        functionName = `${originalName}${counter}`;
        counter++;
      }
      usedFunctionNames.add(functionName);
      
      content += generateHook(path, method, operation, functionName);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`生成API文件: ${filePath}`);
  }
  
  // 生成索引文件
  const indexFile = path.join(outputDir, 'index.ts');
  let indexContent = `// 自动生成的API代码\n`;
  indexContent += `export * from './types';\n`;
  
  for (const tag of Object.keys(tagGroups)) {
    indexContent += `export * from './${tag.toLowerCase()}';\n`;
  }
  
  fs.writeFileSync(indexFile, indexContent);
  console.log(`生成索引文件: ${indexFile}`);
  
  console.log('API代码生成完成！');
}

// 运行生成器
generateApiFiles();
