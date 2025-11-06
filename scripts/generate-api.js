#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const projectType = args.find(arg => arg.startsWith('--project='))?.split('=')[1];

// 读取swagger.json
const swaggerPath = path.join(__dirname, '../swagger.json');
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
    return inline ? refName : `Types.${refName}`;
  }
  
  if (schema.type === 'array' && schema.items) {
    const itemType = getTypeFromSchema(schema.items, enumTypes, inline);
    return `${itemType}[]`;
  }
  
  if (schema.enum) {
    // 如果有枚举类型映射，使用枚举类型
    if (enumTypes) {
      const enumKey = schema.enum.join('_');
      for (const [key, enumType] of enumTypes) {
        if (key === enumKey) {
          return inline ? enumType.name : `Types.${enumType.name}`;
        }
      }
    }
    // 否则使用联合类型
    return schema.enum.map(e => `'${e}'`).join(' | ');
  }
  
  if (schema.format === 'date-time') {
    return 'string'; // 或者 Date
  }
  if (schema.format === 'binary') {
    return 'File';
  }
  
  return typeMapping[schema.type] || 'any';
}

// 从schema获取验证装饰器
function getValidatorFromSchema(schema) {
  if (schema.$ref) {
    return 'ValidateNested';
  }
  
  if (schema.type === 'array') {
    return 'IsArray';
  }
  
  if (schema.enum) {
    return 'IsEnum';
  }
  
  return validatorMapping[schema.type] || 'IsString';
}

// 生成验证装饰器调用
function generateValidatorCall(schema, enumTypes = null, inline = false) {
  if (schema.$ref) {
    return '@ValidateNested()';
  }
  
  if (schema.type === 'array') {
    return '@IsArray()';
  }
  
  if (schema.enum) {
    // 如果有枚举类型映射，使用枚举类型
    if (enumTypes) {
      const enumKey = schema.enum.join('_');
      for (const [key, enumType] of enumTypes) {
        if (key === enumKey) {
          return inline ? `@IsEnum(${enumType.name})` : `@IsEnum(Types.${enumType.name})`;
        }
      }
    }
    // 否则使用数组形式
    const enumValues = schema.enum.map(e => `'${e}'`).join(', ');
    return `@IsEnum([${enumValues}])`;
  }
  
  const validator = validatorMapping[schema.type] || 'IsString';
  return `@${validator}()`;
}

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 生成函数名 - 根据method和路径最后一个单词组合，避免数字后缀
function getFunctionName(path, method, operation) {
  if (operation.operationId) {
    return operation.operationId;
  }
  
  const methodPrefix = method.toLowerCase();
  const pathParts = path.split('/').filter(p => p && p !== 'api').filter(name => name[0] !== '{');
  const single = pathParts.length === 1
  if (pathParts[0] && !single && pathParts[0].endsWith('s')) {
    pathParts[0] = pathParts[0].slice(0, -1);
  }
  
  // 处理复数形式
  let resource = camelCase(pathParts.join('-'));
  if (resource.endsWith('s') && !single && methodPrefix !== 'get') {
    resource = resource.slice(0, -1);
  }
  const operateSuffix = !usedFunctionNames.has(resource) ? '' : methodPrefix === 'get' ? 'Detail' : methodPrefix === 'post' ? 'Create' : methodPrefix === 'put' ? 'Update' : methodPrefix === 'delete' ? 'Delete' : '';
  // 根据路径和操作生成更具体的函数名
  let functionName = camelCase(`${operateSuffix && resource.endsWith('s') ? resource.slice(0, -1) : resource}${operateSuffix}`);
  
  return functionName;
}

// 生成参数类型名
function getParamTypeName(functionName, paramType) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1);
  return `${baseName}${paramType}`;
}

// 生成返回类型名
function getResponseTypeName(functionName) {
  const baseName = functionName.charAt(0).toUpperCase() + functionName.slice(1).replace('-', '');
  return `${baseName}Response`;
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
      hasBody = false
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
    url = `"${url}"`
  }
  
  // 构建请求选项
  func += '  return await apiRequest(' + url + ', {\n';
  func += `    method: '${method.toUpperCase()}',\n`;
  
  if (hasBody) {
    const hasFormData = operation.requestBody.content['multipart/form-data'];
    if (hasFormData) {
      func += '    body: jsonToFormData(data),\n';
      func += '    headers: { "Content-Type": null },\n';
    } else {
      func += '    body: JSON.stringify(data),\n';
    }
  }
  func += '    noAuthorize: noAuthorize,\n';
  
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      func += '    params: queryParams,\n';
    }
  }
  
  func += '  });\n';
  func += '}\n\n';
  
  return func;
}

// 生成React Query Hook
function generateHook(path, method, operation, customFunctionName = null) {
  const functionName = customFunctionName || getFunctionName(path, method, operation);
  const hookName = `use${functionName.charAt(0).toUpperCase() + functionName.slice(1)}`;
  const isGet = method.toLowerCase() === 'get';
  const isMutation = !isGet;
  
  if (isMutation) {
    return generateMutationHook(hookName, functionName, operation, path, method);
  } else {
    return generateQueryHook(hookName, functionName, operation, path, method);
  }
}

// 生成Query Hook
function generateQueryHook(hookName, functionName, operation, path, method) {
  const cacheKey = getCacheKey(operation);
  const params = getPathParams(path);
  const isGet = method.toLowerCase() === 'get';
  
  let hook = `/**
 * ${operation.summary || operation.operationId || hookName} Hook
 */
export function ${hookName}(\n`;
  
  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }
  
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      paramList.push(`  queryParams?: ${queryParamsType}`);
    }
  }
  
  paramList.push(`  options?: UseQueryOptions<HTTPResponse<${upperFirst(functionName)}Response>, Error>`);
  
  hook += paramList.join(',\n');
  hook += '\n) {\n';
  
  hook += `  return useQuery({\n`;
  
  // 构建queryKey
  let queryKeyParts = [cacheKey];
  if (params.length > 0) {
    queryKeyParts.push(...params.map(name => `pathParams.${name}`));
  }
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      queryKeyParts.push(...queryParams.map(item => `queryParams?.${item.name}`));
    }
  }
  hook += `    queryKey: [${queryKeyParts.join(', ')}],\n`;
  
  // 构建queryFn
  let queryFnParams = [];
  if (params.length > 0) {
    queryFnParams.push('pathParams');
  }
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      queryFnParams.push('queryParams');
    }
  }
  hook += `    queryFn: () => ${functionName}(${queryFnParams.join(', ')}),\n`;
  hook += `    ...options,\n`;
  hook += `  });\n`;
  
  hook += '}\n\n';
  
  return hook;
}

// 生成Mutation Hook
function generateMutationHook(hookName, functionName, operation, path, method) {
  const cachePatterns = getCacheInvalidationPatterns(operation);
  const params = getPathParams(path);
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  
  let hook = `/**
 * ${operation.summary || operation.operationId || hookName} Hook
 */
export function ${hookName}(\n`;
  
  // 构建参数类型
  const paramList = [];
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    paramList.push(`  pathParams: ${pathParamsType}`);
  }
  
  const requestBodyType = hasBody ? getRequestBodyType(operation, functionName) : 'any';
  
  paramList.push(`  options?: UseMutationOptions<HTTPResponse<${upperFirst(functionName)}Response>, Error, ${requestBodyType}>`);
  
  hook += paramList.join(',\n');
  hook += '\n) {\n';
  hook += '  const queryClient = useQueryClient();\n\n';
  hook += '  return useMutation({\n';
  
  // 构建mutationFn
  let mutationFnParams = [];
  let mutationFnCallParams = [];
  if (params.length > 0) {
    mutationFnCallParams.push('pathParams');
  }
  if (hasBody) {
    const requestBodyType = getRequestBodyType(operation, functionName);
    if (requestBodyType) {
      mutationFnParams.push('data');
      mutationFnCallParams.push('data');
    }
  }
  hook += `    mutationFn: (${mutationFnParams.join(', ')}) => ${functionName}(${mutationFnCallParams.join(', ')}),\n`;
  
  if (cachePatterns.length > 0) {
    hook += '    onSuccess: () => {\n';
    hook += '      // 清除相关缓存\n';
    cachePatterns.forEach(pattern => {
      hook += `      queryClient.invalidateQueries({ queryKey: [${pattern}] });\n`;
    });
    hook += '    },\n';
  }
  
  hook += '    onError: (error: any) => {\n';
  hook += '      console.error(\'Mutation failed:\', error);\n';
  hook += '    },\n';
  hook += '    ...options,\n';
  hook += '  });\n';
  
  hook += '}\n\n';
  
  return hook;
}

// 辅助函数
function getPathParams(path) {
  const matches = path.match(/\{([^}]+)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)) : [];
}

function getRequestBodyType(operation, functionName) {
  if (!operation.requestBody || !operation.requestBody.content) {
    return null;
  }
  
  const content = operation.requestBody.content['application/json'] || operation.requestBody.content['multipart/form-data'];
  if (!content || !content.schema) {
    return null;
  }
  
  // 如果是内联schema，生成DTO类型
  if (content.schema.type === 'object' && content.schema.properties) {
    return getParamTypeName(functionName, 'DTO');
  }
  
  return getTypeFromSchema(content.schema);
}

function getResponseType(operation, functionName) {
  const response = operation.responses['200'];
  if (!response || !response.content) {
    return 'any';
  }
  
  const content = response.content['application/json'];
  if (!content || !content.schema) {
    return 'any';
  }
  
  // 处理swagger.json中的复杂响应结构
  if (content.schema.type === 'object' && content.schema.properties) {
    // 查找data部分的类型定义
    const dataSchema = content.schema.properties.data;
    
    if (dataSchema) {
      if (dataSchema.type === 'object' && dataSchema.properties) {
        return getResponseTypeName(functionName);
      }
      return getTypeFromSchema(dataSchema);
    }
  }
  
  // 如果是ApiResponse引用
  if (content.schema.$ref && content.schema.$ref.endsWith('Response')) {
    return getResponseTypeName(functionName); //'any'; // ApiResponse的data部分是any类型
  }
  
  return getTypeFromSchema(content.schema);
}

function getCacheKey(operation) {
  const tags = operation.tags || ['default'];
  const summary = operation.summary || operation.operationId || 'unknown';
  return `'${tags[0].toLowerCase()}', '${summary.toLowerCase().replace(/\s+/g, '_')}'`;
}

function getCacheInvalidationPatterns(operation) {
  const tags = operation.tags || ['default'];
  return tags.map(tag => `'${tag.toLowerCase()}'`);
}

// 生成参数类型定义
function generateParamTypes(path, method, operation, functionName, enumTypes = null) {
  const types = [];
  const params = getPathParams(path);
  const hasBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
  const isGet = method.toLowerCase() === 'get';
  
  // 生成PathParams类型
  if (params.length > 0) {
    const pathParamsType = getParamTypeName(functionName, 'PathParams');
    let typeDef = `export class ${pathParamsType} {\n`;
    params.forEach(param => {
      typeDef += `  @IsString()\n`;
      typeDef += `  ${param}: string;\n\n`;
    });
    typeDef += '}\n\n';
    types.push(typeDef);
  }
  
  // 生成QueryParams类型
  if (isGet && operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryParamsType = getParamTypeName(functionName, 'QueryParams');
      let typeDef = `export class ${queryParamsType} {\n`;
      queryParams.forEach(param => {
        const isOptional = !param.required;
        const type = getTypeFromSchema(param.schema, enumTypes);
        const validatorCall = generateValidatorCall(param.schema, enumTypes);
        
        typeDef += `  ${validatorCall}\n`;
        if (isOptional) {
          typeDef += `  @IsOptional()\n`;
        }
        typeDef += `  ${param.name}${isOptional ? '?' : ''}: ${type};\n\n`;
      });
      typeDef += '}\n\n';
      types.push(typeDef);
    }
  }
  
  // 生成DTO类型
  if (hasBody && operation.requestBody && operation.requestBody.content) {
    const content = operation.requestBody.content['application/json'] || operation.requestBody.content['multipart/form-data'];
    if (content && content.schema && content.schema.type === 'object' && content.schema.properties) {
      const dtoType = getParamTypeName(functionName, 'DTO');
      types.push(generateTypeDefinition(content.schema, dtoType, enumTypes));
    }
  }
  
  // 生成Response类型
  const response = operation.responses['200'];
  const responseType = getResponseTypeName(functionName);
  if (response && response.content) {
    const content = response.content['application/json'];
    if (content && content.schema && content.schema.type === 'object' && content.schema.properties) {
      const dataSchema = content.schema.properties.data;
      if (dataSchema && dataSchema.type === 'object' && dataSchema.properties) {
        types.push(generateTypeDefinition(dataSchema, responseType, enumTypes));
      } else {
        types.push(`export type ${responseType} = any;\n\n`);
      }
    } else if (content && content.schema.$ref && content.schema.$ref.endsWith('Response')) {
      types.push(`export type ${responseType} = Types.${content.schema.$ref.split('/').pop()};\n\n`);
    }
  }
  
  return types.join('');
}

const enumTypes = new Map();
// 提取枚举类型
function extractEnumTypes(schemas) {
  
  for (const [name, schema] of Object.entries(schemas)) {
    // if (name === 'ApiResponse' || name === 'ErrorResponse') continue;
    
    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        if (propSchema.enum) {
          const enumKey = propSchema.enum.join('_');
          const enumName = `${name}${propName.charAt(0).toUpperCase() + propName.slice(1)}`;
          
          if (!enumTypes.has(enumKey)) {
            enumTypes.set(enumKey, {
              name: enumName,
              values: propSchema.enum
            });
          }
        }
      }
    }
  }
  
  return enumTypes;
}

// 生成枚举类型定义
function generateEnumTypes(enumTypes) {
  let enumContent = '';
  
  for (const [key, enumType] of enumTypes) {
    enumContent += `export enum ${enumType.name} {\n`;
    enumType.values.forEach(value => {
      const enumKey = value.toUpperCase().replace(/-/g, '_');
      enumContent += `  ${enumKey} = '${value}',\n`;
    });
    enumContent += '}\n\n';
  }
  
  return enumContent;
}


// 用于跟踪已生成的函数名，避免重复
const usedFunctionNames = new Set();
// 确定需要过滤的 tags
const allowedTags = tagMappings[projectType] || [];

// 主生成函数
function generateApiFiles() {
  console.log('开始生成API代码...');
  
  // 提取枚举类型
  const enumTypes = extractEnumTypes(swagger.components.schemas);
  
  // 生成所有类型定义到types.ts
  const typesFile = path.join(outputDir, 'types.ts');
  let typesContent = `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n`;
  typesContent += `import { Type } from 'class-transformer';\n\n`;
  
  // 生成枚举类型
  typesContent += generateEnumTypes(enumTypes);
  
  // 生成schemas中的类型
  for (const [name, schema] of Object.entries(swagger.components.schemas)) {
    // if (!name.endsWith('Response') || (name === 'ApiResponse' || name === 'ErrorResponse')) {
    typesContent += generateTypeDefinition(schema, name, enumTypes, true);
    typesContent += '\n';
    // }
  }
  
  fs.writeFileSync(typesFile, typesContent);
  console.log(`生成类型定义: ${typesFile}`);
  
  console.log(`开始生成API代码 (项目: ${projectType}, 标签过滤: ${allowedTags.join(', ')})...`);
  // 按标签分组生成API文件
  const tagGroups = {};
  
  for (const [path, methods] of Object.entries(swagger.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const [tag, project] = operation.tags;
      // 过滤：只包含指定项目的 tags
      if(project !== upperFirst(projectType) && !allowedTags?.includes(tag)) {
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
    content += `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`;
    
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
    
      content = content.replace(
        `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`,
        `import { IsString, IsNumber, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, ValidateNested } from 'class-validator';\n\n`
      );
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
