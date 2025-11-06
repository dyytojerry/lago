import * as Joi from 'joi';

// 通用登录Schema
export const universalLoginSchema = Joi.object({
  body: Joi.object({
    identifier: Joi.string().optional().messages({
      'string.empty': '登录标识不能为空',
    }),
    password: Joi.string().optional().messages({
      'string.empty': '密码不能为空',
    }),
    wechatOpenid: Joi.string().optional().messages({
      'string.empty': '微信OpenID不能为空',
    }),
  }).or('identifier', 'wechatOpenid').messages({
    'object.missing': '请提供登录标识（identifier或wechatOpenid）',
  }),
});

// 小程序端微信登录
export const wechatLoginSchema = Joi.object({
  body: Joi.object({
    code: Joi.string().required().messages({
      'string.empty': '微信登录code不能为空',
      'any.required': '微信登录code是必需的',
    }),
  }),
});

// 小程序端手机号登录
export const phoneLoginSchema = Joi.object({
  body: Joi.object({
    phone: Joi.string().required().messages({
      'string.empty': '手机号不能为空',
      'any.required': '手机号是必需的',
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必需的',
    }),
  }),
});

// 小程序端手机号注册
export const phoneRegisterSchema = Joi.object({
  body: Joi.object({
    phone: Joi.string().required().messages({
      'string.empty': '手机号不能为空',
      'any.required': '手机号是必需的',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': '密码长度至少6位',
      'string.empty': '密码不能为空',
      'any.required': '密码是必需的',
    }),
    verifyCode: Joi.string().optional(),
  }),
});

// 运营系统登录
export const operationLoginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': '用户名不能为空',
      'any.required': '用户名是必需的',
    }),
    password: Joi.string().required().messages({
      'string.empty': '密码不能为空',
      'any.required': '密码是必需的',
    }),
    verifyCode: Joi.string().optional(),
  }),
});
