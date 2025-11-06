import { Decimal } from '@prisma/client/runtime/library';

/**
 * 数据类型转换工具
 * 解决Prisma Decimal类型在JSON序列化时变为字符串的问题
 */

/**
 * 转换Prisma Decimal为数字
 */
export function decimalToNumber(decimal: Decimal | null | undefined): number | null {
  if (decimal === null || decimal === undefined) {
    return null;
  }
  return parseFloat(decimal.toString());
}

/**
 * 转换Prisma Decimal数组为数字数组
 */
export function decimalsToNumbers(decimals: (Decimal | null)[]): (number | null)[] {
  return decimals.map(decimal => decimalToNumber(decimal));
}

/**
 * 转换包含Decimal字段的对象
 */
export function transformDecimalFields<T extends Record<string, any>>(
  obj: T,
  decimalFields: (keyof T)[]
): T {
  const transformed = { ...obj };
  
  decimalFields.forEach(field => {
    if (transformed[field] !== undefined) {
      transformed[field] = decimalToNumber(transformed[field] as any) as T[keyof T];
    }
  });
  
  return transformed;
}

/**
 * 转换包含Decimal字段的对象数组
 */
export function transformDecimalFieldsArray<T extends Record<string, any>>(
  array: T[],
  decimalFields: (keyof T)[]
): T[] {
  return array.map(obj => transformDecimalFields(obj, decimalFields));
}

/**
 * 专门用于PiggyBank的转换
 */
export function transformPiggyBank(piggyBank: any) {
  return transformDecimalFields(piggyBank, ['currentAmount', 'targetAmount']);
}

/**
 * 专门用于Transaction的转换
 */
export function transformTransaction(transaction: any) {
  return transformDecimalFields(transaction, ['amount']);
}

/**
 * 检查是否是Prisma Decimal对象
 */
function isPrismaDecimal(value: any): boolean {
  return value && 
         typeof value === 'object' && 
         value.constructor && 
         (value.constructor.name === 'Decimal' || 
          value.constructor.name === 'i' || // Prisma内部Decimal类名
          (value.s !== undefined && value.e !== undefined && value.d !== undefined)); // Decimal对象结构
}

/**
 * 检查是否是Date对象
 */
function isDate(value: any): boolean {
  return value instanceof Date;
}

/**
 * 转换Date对象为ISO字符串
 */
function dateToString(date: Date): string {
  return date.toISOString();
}

/**
 * 通用的数据响应转换器
 * 自动检测并转换Decimal字段和Date对象
 * - Decimal对象 -> number
 * - Date对象 -> ISO字符串
 */
export function transformResponseData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // 如果是数组，递归处理每个元素
  if (Array.isArray(data)) {
    return data.map(item => transformResponseData(item));
  }

  // 如果不是对象，直接返回
  if (typeof data !== 'object') {
    return data;
  }

  // 检查是否是Prisma Decimal对象
  if (isPrismaDecimal(data)) {
    return decimalToNumber(data);
  }

  // 检查是否是Date对象
  if (isDate(data)) {
    return dateToString(data);
  }

  // 创建新对象避免修改原对象
  const transformed = { ...data };

  // 常见的Decimal字段名
  const commonDecimalFields = [
    'amount',
    'currentAmount', 
    'targetAmount',
    'totalAmount',
    'balance',
    'price',
    'cost',
    'value',
    'total'
  ];

  // 转换Decimal和Date字段
  Object.keys(transformed).forEach(key => {
    const value = transformed[key];
    
    // 如果是Prisma Decimal对象，直接转换
    if (isPrismaDecimal(value)) {
      transformed[key] = decimalToNumber(value);
    }
    // 如果是Date对象，转换为ISO字符串
    else if (isDate(value)) {
      transformed[key] = dateToString(value);
    }
    // 如果是嵌套对象，递归处理
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      transformed[key] = transformResponseData(value);
    }
    // 如果是数组，递归处理
    else if (Array.isArray(value)) {
      transformed[key] = transformResponseData(value);
    }
    // 如果字段名包含常见的金额字段，尝试转换字符串
    else if (commonDecimalFields.includes(key) && typeof value === 'string') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        transformed[key] = numValue;
      }
    }
  });

  return transformed;
}

/**
 * 增强的createSuccessResponse，自动转换Decimal类型
 */
export function createSuccessResponseWithTransform(res: any, data: any, status: number = 200) {
  const transformedData = transformResponseData(data);
  return res.status(status).json({
    success: true,
    data: transformedData
  });
}
