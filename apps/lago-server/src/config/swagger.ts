/**
 * Swagger Schema 定义
 * 
 * 用于定义 Swagger 接口的对象结构，可以在路由定义中通过 $ref 引用
 * 这样可以减少重复代码，保持 API 文档的一致性
 */

export const swaggerSchemas = {
  // ==================== 认证相关 ====================

  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '用户ID',
      },
      nickname: {
        type: 'string',
        nullable: true,
        description: '昵称',
      },
      avatarUrl: {
        type: 'string',
        nullable: true,
        description: '头像URL',
      },
      role: {
        type: 'string',
        enum: ['user', 'merchant', 'property', 'admin'],
        description: '用户角色',
      },
      phone: {
        type: 'string',
        nullable: true,
        description: '手机号',
      },
      isVerified: {
        type: 'boolean',
        description: '是否实名认证',
      },
      creditScore: {
        type: 'integer',
        description: '信用积分',
      },
    },
    required: ['id', 'role', 'isVerified', 'creditScore'],
  },

  OperationStaff: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '运营人员ID',
      },
      username: {
        type: 'string',
        description: '用户名',
      },
      email: {
        type: 'string',
        description: '邮箱',
      },
      role: {
        type: 'string',
        enum: ['super_admin', 'audit_staff', 'service_staff', 'operation_staff', 'finance_staff'],
        description: '运营角色',
      },
      realName: {
        type: 'string',
        nullable: true,
        description: '真实姓名',
      },
      phone: {
        type: 'string',
        nullable: true,
        description: '手机号',
      },
    },
    required: ['id', 'username', 'email', 'role'],
  },

  LoginResponse: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'JWT Token',
      },
      user: {
        $ref: '#/components/schemas/User',
      },
    },
    required: ['token', 'user'],
  },

  OperationLoginResponse: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'JWT Token',
      },
      staff: {
        $ref: '#/components/schemas/OperationStaff',
      },
    },
    required: ['token', 'staff'],
  },

  WechatLoginRequest: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: '微信登录code',
      },
    },
    required: ['code'],
  },

  PhoneLoginRequest: {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        description: '手机号',
      },
      password: {
        type: 'string',
        description: '密码',
      },
    },
    required: ['phone', 'password'],
  },

  PhoneRegisterRequest: {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        description: '手机号',
      },
      password: {
        type: 'string',
        description: '密码',
        minLength: 6,
      },
      verifyCode: {
        type: 'string',
        nullable: true,
        description: '验证码（可选）',
      },
    },
    required: ['phone', 'password'],
  },

  OperationLoginRequest: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        description: '用户名或邮箱',
      },
      password: {
        type: 'string',
        description: '密码',
      },
      verifyCode: {
        type: 'string',
        nullable: true,
        description: '验证码（可选）',
      },
    },
    required: ['username', 'password'],
  },

  // ==================== 通用响应 ====================

  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: '错误信息',
      },
    },
    required: ['error'],
  },

  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: '是否成功',
      },
      message: {
        type: 'string',
        nullable: true,
        description: '提示信息',
      },
    },
    required: ['success'],
  },
};

// 导出为 Swagger 格式的 components/schemas
export function getSwaggerComponents() {
  return {
    schemas: swaggerSchemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token 认证，格式：Bearer {token}',
      },
    },
  };
}

