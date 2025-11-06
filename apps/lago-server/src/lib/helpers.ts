/**
 * 通用工具函数
 */

/**
 * 将空字符串转换为 null，用于可选字段
 * @param value 输入值
 * @returns 转换后的值
 */
export function emptyStringToNull(value: string | undefined | null): string | null {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}

/**
 * 清理请求体中的空字符串字段
 * @param body 请求体对象
 * @param fields 需要清理的字段列表
 * @returns 清理后的对象
 */
export function cleanEmptyStrings(body: any, fields: string[]): any {
  const cleaned = { ...body };
  
  fields.forEach(field => {
    if (cleaned[field] === '') {
      cleaned[field] = null;
    }
  });
  
  return cleaned;
}

/**
 * 验证必填字段
 * @param body 请求体
 * @param requiredFields 必填字段列表
 * @returns 验证结果
 */
export function validateRequiredFields(body: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}