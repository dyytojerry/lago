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
      communityIds: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: '小区ID列表',
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
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'JWT Token',
          },
          refreshToken: {
            type: 'string',
            description: 'JWT Refresh Token',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
        },
        required: ['accessToken', 'refreshToken', 'user'],
      },
    },
    required: ['success', 'data'],
  },

  OperationLoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
      },
      data: {
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
    },
    required: ['success', 'data'],
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

  UniversalLoginRequest: {
    type: 'object',
    properties: {
      identifier: {
        type: 'string',
        description: '登录标识（手机号/邮箱/微信ID）',
      },
      nickname: {
        type: 'string',
        description: '昵称（可选，用于昵称登录）',
      },
      password: {
        type: 'string',
        description: '密码（可选，微信登录时不需要）',
      },
      wechatOpenid: {
        type: 'string',
        description: '微信OpenID（可选，用于微信登录）',
      },
    },
    required: ['identifier 或 wechatOpenid'],
  },

  // ==================== 通用响应 ====================

  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: '请求是否成功',
        example: false,
      },
      error: {
        type: 'string',
        description: '错误信息',
      },
    },
    required: ['success', 'error'],
  },

  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: '请求是否成功',
        example: true,
      },
      data: {
        type: 'object',
        nullable: true,
        description: '业务数据载体',
        additionalProperties: true,
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

  // ==================== 上传相关 ====================

  UploadSingleResponse: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      objectKey: { type: 'string' },
      name: { type: 'string' },
      mimeType: { type: 'string' },
      size: { type: 'integer' },
      kind: { type: 'string', enum: ['image', 'video', 'file'] },
    },
    required: ['url', 'objectKey', 'name', 'mimeType', 'size', 'kind'],
  },

  MultipartInitResponse: {
    type: 'object',
    properties: {
      uploadId: { type: 'string' },
      objectKey: { type: 'string' },
    },
    required: ['uploadId', 'objectKey'],
  },

  MultipartPartResponse: {
    type: 'object',
    properties: {
      partNumber: { type: 'integer' },
      etag: { type: 'string' },
    },
    required: ['partNumber', 'etag'],
  },

  MultipartCompleteRequest: {
    type: 'object',
    properties: {
      uploadId: { type: 'string' },
      objectKey: { type: 'string' },
      parts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            partNumber: { type: 'integer' },
            etag: { type: 'string' },
          },
          required: ['partNumber', 'etag'],
        },
      },
    },
    required: ['uploadId', 'objectKey', 'parts'],
  },

  MultipartAbortRequest: {
    type: 'object',
    properties: {
      uploadId: { type: 'string' },
      objectKey: { type: 'string' },
    },
    required: ['uploadId', 'objectKey'],
  },

  // ==================== 入驻相关 ====================

  OnboardingApplication: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      type: {
        type: 'string',
        enum: [
          'personal_seller',
          'small_business_seller',
          'personal_service_provider',
          'enterprise_service_provider',
        ],
      },
      serviceCategory: {
        type: 'string',
        nullable: true,
        description: '服务商类型',
      },
      status: {
        type: 'string',
        enum: ['pending', 'processing', 'approved', 'rejected'],
      },
      fullName: { type: 'string', nullable: true },
      idNumber: { type: 'string', nullable: true },
      businessName: { type: 'string', nullable: true },
      businessLicenseNumber: { type: 'string', nullable: true },
      contactPhone: { type: 'string', nullable: true },
      contactEmail: { type: 'string', nullable: true },
      address: { type: 'string', nullable: true },
      description: { type: 'string', nullable: true },
      experienceYears: { type: 'integer', nullable: true },
      documents: { type: 'object', nullable: true, additionalProperties: true },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
      submittedAt: { type: 'string', format: 'date-time' },
      reviewedAt: { type: 'string', format: 'date-time', nullable: true },
      rejectReason: { type: 'string', nullable: true },
      user: {
        $ref: '#/components/schemas/User',
      },
      reviewer: {
        $ref: '#/components/schemas/OperationStaff',
        nullable: true,
      },
    },
    required: ['id', 'userId', 'type', 'status', 'submittedAt'],
  },

  OnboardingApplicationListResponse: {
    type: 'object',
    properties: {
      applications: {
        type: 'array',
        items: { $ref: '#/components/schemas/OnboardingApplication' },
      },
      pagination: { $ref: '#/components/schemas/Pagination' },
    },
    required: ['applications', 'pagination'],
  },

  OnboardingApplicationDetailResponse: {
    type: 'object',
    properties: {
      application: { $ref: '#/components/schemas/OnboardingApplication' },
    },
    required: ['application'],
  },

  OnboardingApplicationCreateRequest: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: [
          'personal_seller',
          'small_business_seller',
          'personal_service_provider',
          'enterprise_service_provider',
        ],
      },
      serviceCategory: {
        type: 'string',
        nullable: true,
        enum: [
          'recycling',
          'appliance_repair',
          'appliance_install',
          'appliance_cleaning',
          'furniture_repair',
          'carpentry',
          'masonry',
          'tiling',
          'painting',
          'plumbing',
          'electrician',
          'hvac_install',
          'locksmith',
          'pest_control',
          'cleaning',
          'moving_service',
          'landscaping',
          'decoration_design',
          'renovation_general',
          'other',
        ],
      },
      fullName: { type: 'string', nullable: true },
      idNumber: { type: 'string', nullable: true },
      businessName: { type: 'string', nullable: true },
      businessLicenseNumber: { type: 'string', nullable: true },
      contactPhone: { type: 'string', nullable: true },
      contactEmail: { type: 'string', nullable: true },
      address: { type: 'string', nullable: true },
      description: { type: 'string', nullable: true },
      experienceYears: { type: 'integer', nullable: true },
      documents: { type: 'object', nullable: true, additionalProperties: true },
      metadata: { type: 'object', nullable: true, additionalProperties: true },
    },
    required: ['type'],
  },

  OnboardingReviewRequest: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        nullable: true,
        description: '拒绝原因（可选）',
      },
    },
  },

  // ==================== 聊天相关 ====================

  ChatMessage: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '消息ID',
      },
      chatRoomId: {
        type: 'string',
        description: '所属聊天室ID',
      },
      senderId: {
        type: 'string',
        description: '发送者用户ID',
      },
      receiverId: {
        type: 'string',
        nullable: true,
        description: '接收者用户ID',
      },
      type: {
        type: 'string',
        enum: ['text', 'image', 'system', 'product_card'],
        description: '消息类型',
      },
      content: {
        type: 'string',
        description: '消息内容',
      },
      fileUrl: {
        type: 'string',
        nullable: true,
        description: '附件URL（图片等）',
      },
      productId: {
        type: 'string',
        nullable: true,
        description: '关联商品ID',
      },
      isRead: {
        type: 'boolean',
        description: '是否已读',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '创建时间',
      },
      readAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '读取时间',
      },
      sender: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string' },
          nickname: { type: 'string' },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
    },
    required: ['id', 'chatRoomId', 'senderId', 'type', 'content', 'isRead', 'createdAt'],
  },

  ChatRoom: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '聊天室ID',
      },
      productId: {
        type: 'string',
        nullable: true,
        description: '关联商品ID',
      },
      type: {
        type: 'string',
        enum: ['private', 'group'],
        description: '聊天室类型',
      },
      isActive: {
        type: 'boolean',
        description: '是否有效',
      },
      product: {
        $ref: '#/components/schemas/Product',
        nullable: true,
      },
      members: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            user: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                nickname: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
              },
            },
          },
        },
      },
      messages: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ChatMessage',
        },
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
    required: ['id', 'type', 'isActive', 'createdAt', 'updatedAt'],
  },

  Community: {
    type: 'object',
    properties: {
      id: { type: 'string', description: '小区ID' },
      name: { type: 'string', description: '小区名称' },
      location: { type: 'string', description: '地理位置（lat,lng）' },
      address: { type: 'string', nullable: true, description: '详细地址' },
      verificationStatus: {
        type: 'string',
        enum: ['pending', 'approved', 'rejected'],
        description: '认证状态',
      },
      images: {
        type: 'array',
        items: { type: 'string' },
        description: '小区图片',
      },
      description: { type: 'string', nullable: true, description: '小区介绍' },
      distance: { type: 'integer', nullable: true, description: '距离（米）—仅附近搜索时出现' },
      _count: {
        type: 'object',
        nullable: true,
        properties: {
          members: { type: 'integer' },
          products: { type: 'integer' },
        },
      },
      province: {
        type: 'object',
        nullable: true,
        properties: { name: { type: 'string' } },
      },
      city: {
        type: 'object',
        nullable: true,
        properties: { name: { type: 'string' } },
      },
      district: {
        type: 'object',
        nullable: true,
        properties: { name: { type: 'string' } },
      },
    },
    required: ['id', 'name', 'location', 'verificationStatus'],
  },

  Province: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['id', 'code', 'name'],
  },

  City: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      provinceId: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['id', 'provinceId', 'code', 'name'],
  },

  District: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      cityId: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['id', 'cityId', 'code', 'name'],
  },

  // ==================== 用户相关 ====================

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

