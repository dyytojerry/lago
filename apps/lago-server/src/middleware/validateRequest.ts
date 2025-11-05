import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 构建验证对象，包含body, query, params等
    const requestData: any = {};
    
    // 检查schema是否有body字段
    const schemaKeys = Object.keys(schema.describe()['keys'] || {});
    
    if (schemaKeys.includes('body')) {
      requestData.body = req.body;
    }
    if (schemaKeys.includes('query')) {
      requestData.query = req.query;
    }
    if (schemaKeys.includes('params')) {
      requestData.params = req.params;
    }
    
    // 如果schema没有这些字段，则直接验证body（向后兼容）
    const dataToValidate = Object.keys(requestData).length > 0 ? requestData : req.body;
    
    const { error, value } = schema.validate(dataToValidate, { 
      allowUnknown: true, // 允许未知字段
      stripUnknown: true  // 移除未知字段
    });
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // 将验证后的值赋回请求对象
    if (value.body !== undefined) {
      req.body = value.body;
    }
    if (value.query !== undefined) {
      req.query = value.query;
    }
    if (value.params !== undefined) {
      req.params = value.params;
    }
    
    return next();
  };
}
