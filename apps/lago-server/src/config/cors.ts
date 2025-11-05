import cors from 'cors';

// 允许的源列表
const getAllowedOrigins = (): string[] => {
  const origins = [
    // 放开所有跨域
    '*',
    process.env.FRONTEND_URL,
  ];

  // 过滤掉undefined值
  return origins.filter(Boolean) as string[];
};

// CORS配置选项
export const corsOptions: cors.CorsOptions = {
  // origin: function (origin: string | undefined, callback: Function) {
  //   const allowedOrigins = getAllowedOrigins();
    
  //   // 允许没有origin的请求（如移动应用、Postman等）
  //   if (!origin) {
  //     console.log('[CORS] Allowing request without origin');
  //     return callback(null, true);
  //   }
    
  //   // 检查origin是否在允许列表中
  //   if (allowedOrigins.includes(origin)) {
  //     console.log(`[CORS] Allowing origin: ${origin}`);
  //     return callback(null, true);
  //   }
    
  //   // 开发环境允许所有localhost请求
  //   if (process.env.NODE_ENV === 'development') {
  //     if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
  //       console.log(`[CORS] Development mode - allowing localhost origin: ${origin}`);
  //       return callback(null, true);
  //     }
  //   }
    
  //   // 生产环境严格检查
  //   if (process.env.NODE_ENV === 'production') {
  //     console.warn(`[CORS] Production mode - blocking origin: ${origin}`);
  //     return callback(new Error('Not allowed by CORS'), false);
  //   }
    
  //   // 其他情况允许通过（开发环境）
  //   console.log(`[CORS] Development mode - allowing origin: ${origin}`);
  //   return callback(null, true);
  // },
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-API-Key'
  ],
  exposedHeaders: ['Authorization', 'X-Total-Count'],
  optionsSuccessStatus: 200, // 支持旧版浏览器
  preflightContinue: false,
  maxAge: 86400 // 预检请求缓存24小时
};

// 创建CORS中间件
export const corsMiddleware = cors(corsOptions);

// 预检请求处理中间件
export const corsPreflightMiddleware = cors(corsOptions);

// CORS调试中间件
export const corsDebugMiddleware = (req: any, _res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CORS Debug] ${req.method} ${req.url}`);
    console.log(`[CORS Debug] Origin: ${req.headers.origin || 'No origin'}`);
    console.log(`[CORS Debug] Referer: ${req.headers.referer || 'No referer'}`);
    console.log(`[CORS Debug] User-Agent: ${req.headers['user-agent'] || 'No user-agent'}`);
    console.log(`[CORS Debug] Allowed Origins: ${getAllowedOrigins().join(', ')}`);
  }
  next();
};
