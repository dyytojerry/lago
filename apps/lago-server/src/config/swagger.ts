/**
 * Swagger Schema 定义
 * 
 * 用于定义 Swagger 接口的对象结构，可以在路由定义中通过 $ref 引用
 * 这样可以减少重复代码，保持 API 文档的一致性
 */

export const swaggerSchemas = {


  // ==================== 通用 ====================

  Pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: '当前页码',
      },
      limit: {
        type: 'integer',
        description: '每页数量',
      },
      total: {
        type: 'integer',
        description: '总记录数',
      },
      totalPages: {
        type: 'integer',
        description: '总页数',
      },
    },
    required: ['page', 'limit', 'total', 'totalPages'],
  },
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

  // ==================== 商品相关 ====================

  Product: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '商品ID',
      },
      title: {
        type: 'string',
        description: '商品标题',
      },
      description: {
        type: 'string',
        nullable: true,
        description: '商品描述',
      },
      category: {
        type: 'string',
        enum: ['toys', 'gaming'],
        description: '商品分类',
      },
      type: {
        type: 'string',
        enum: ['rent', 'sell', 'both'],
        description: '交易类型',
      },
      price: {
        type: 'string',
        format: 'decimal',
        description: '价格',
      },
      deposit: {
        type: 'string',
        format: 'decimal',
        nullable: true,
        description: '押金（租赁）',
      },
      status: {
        type: 'string',
        enum: ['pending', 'active', 'sold', 'rented', 'offline'],
        description: '商品状态',
      },
      images: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: '商品图片',
      },
      location: {
        type: 'string',
        nullable: true,
        description: '地理位置',
      },
      isVerified: {
        type: 'boolean',
        description: '是否认证商品',
      },
      viewCount: {
        type: 'integer',
        description: '浏览次数',
      },
      likeCount: {
        type: 'integer',
        description: '收藏次数',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '创建时间',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: '更新时间',
      },
    },
    required: ['id', 'title', 'category', 'type', 'price', 'status', 'images'],
  },

  ProductListResponse: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Product',
        },
      },
      pagination: {
        $ref: '#/components/schemas/Pagination',
      },
    },
    required: ['products', 'pagination'],
  },

  ProductDetailResponse: {
    type: 'object',
    properties: {
      product: {
        $ref: '#/components/schemas/Product',
      },
    },
    required: ['product'],
  },

  ProductApproveRequest: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['approve', 'reject'],
        description: '审核操作',
      },
      reason: {
        type: 'string',
        nullable: true,
        description: '拒绝原因（可选）',
      },
    },
    required: ['action'],
  },

  ProductBatchApproveRequest: {
    type: 'object',
    properties: {
      ids: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: '商品ID数组',
      },
      action: {
        type: 'string',
        enum: ['approve', 'reject'],
        description: '审核操作',
      },
      reason: {
        type: 'string',
        nullable: true,
        description: '拒绝原因（可选）',
      },
    },
    required: ['ids', 'action'],
  },

  // ==================== 订单相关 ====================

  Order: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '订单ID',
      },
      type: {
        type: 'string',
        enum: ['rent', 'sell'],
        description: '订单类型',
      },
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded'],
        description: '订单状态',
      },
      amount: {
        type: 'string',
        format: 'decimal',
        description: '订单金额',
      },
      deposit: {
        type: 'string',
        format: 'decimal',
        nullable: true,
        description: '押金（租赁）',
      },
      startDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '租赁开始日期',
      },
      endDate: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '租赁结束日期',
      },
      deliveryType: {
        type: 'string',
        enum: ['self_pickup', 'delivery', 'cabinet'],
        description: '配送方式',
      },
      deliveryAddress: {
        type: 'string',
        nullable: true,
        description: '配送地址',
      },
      remark: {
        type: 'string',
        nullable: true,
        description: '备注',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '创建时间',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: '更新时间',
      },
    },
    required: ['id', 'type', 'status', 'amount', 'deliveryType'],
  },

  OrderListResponse: {
    type: 'object',
    properties: {
      orders: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Order',
        },
      },
      pagination: {
        $ref: '#/components/schemas/Pagination',
      },
    },
    required: ['orders', 'pagination'],
  },

  OrderDetailResponse: {
    type: 'object',
    properties: {
      order: {
        allOf: [
          { $ref: '#/components/schemas/Order' },
          {
            type: 'object',
            properties: {
              product: {
                $ref: '#/components/schemas/Product',
              },
              buyer: {
                $ref: '#/components/schemas/User',
              },
              seller: {
                $ref: '#/components/schemas/User',
              },
              depositRecord: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  amount: { type: 'string', format: 'decimal' },
                  refundStatus: {
                    type: 'string',
                    enum: ['pending', 'refunded', 'forfeited'],
                  },
                  refundedAt: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        ],
      },
    },
    required: ['order'],
  },

  OrderStatusUpdateRequest: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded'],
        description: '订单状态',
      },
      remark: {
        type: 'string',
        nullable: true,
        description: '备注（可选）',
      },
    },
    required: ['status'],
  },

  // ==================== 用户相关 ====================

  UserListResponse: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User',
        },
      },
      pagination: {
        $ref: '#/components/schemas/Pagination',
      },
    },
    required: ['users', 'pagination'],
  },

  UserDetailResponse: {
    type: 'object',
    properties: {
      user: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              wechatOpenid: {
                type: 'string',
                nullable: true,
                description: '微信OpenID',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: '更新时间',
              },
            },
          },
        ],
      },
      products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' },
            price: { type: 'string', format: 'decimal' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      orders: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Order',
        },
      },
    },
    required: ['user'],
  },

  UserStatusUpdateRequest: {
    type: 'object',
    properties: {
      isActive: {
        type: 'boolean',
        nullable: true,
        description: '是否激活',
      },
      creditScore: {
        type: 'integer',
        nullable: true,
        minimum: 0,
        maximum: 1000,
        description: '信用积分',
      },
    },
  },

  // ==================== 仪表盘相关 ====================

  DashboardStats: {
    type: 'object',
    properties: {
      gmv: {
        type: 'object',
        properties: {
          today: { type: 'number', description: '今日GMV' },
          week: { type: 'number', description: '本周GMV' },
          month: { type: 'number', description: '本月GMV' },
          total: { type: 'number', description: '累计GMV' },
        },
        required: ['today', 'week', 'month', 'total'],
      },
      users: {
        type: 'object',
        properties: {
          newToday: { type: 'integer', description: '今日新增用户' },
          newWeek: { type: 'integer', description: '本周新增用户' },
          activeToday: { type: 'integer', description: '今日活跃用户' },
          total: { type: 'integer', description: '总用户数' },
          active: { type: 'integer', description: '活跃用户数' },
        },
        required: ['newToday', 'newWeek', 'activeToday', 'total', 'active'],
      },
      communities: {
        type: 'object',
        properties: {
          active: { type: 'integer', description: '活跃小区数' },
          new: { type: 'integer', description: '新增小区数' },
        },
        required: ['active', 'new'],
      },
      orders: {
        type: 'object',
        properties: {
          today: { type: 'integer', description: '今日订单数' },
          pending: { type: 'integer', description: '待处理订单数' },
        },
        required: ['today', 'pending'],
      },
      pending: {
        type: 'object',
        properties: {
          products: { type: 'integer', description: '待审核商品数' },
          approvals: { type: 'integer', description: '待审核入驻数' },
          complaints: { type: 'integer', description: '待处理投诉数' },
        },
        required: ['products', 'approvals', 'complaints'],
      },
    },
    required: ['gmv', 'users', 'communities', 'orders', 'pending'],
  },

  DashboardTrends: {
    type: 'object',
    properties: {
      gmv: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            value: { type: 'number' },
          },
        },
      },
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            value: { type: 'integer' },
          },
        },
      },
    },
    required: ['gmv', 'users'],
  },

  PendingItems: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Product',
        },
      },
      approvals: {
        type: 'array',
        items: {
          type: 'object',
        },
        description: '待审核入驻申请（待实现）',
      },
      complaints: {
        type: 'array',
        items: {
          type: 'object',
        },
        description: '待处理投诉（待实现）',
      },
    },
    required: ['products', 'approvals', 'complaints'],
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

