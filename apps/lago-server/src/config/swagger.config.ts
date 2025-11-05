import swaggerJsdoc from 'swagger-jsdoc';
import { getSwaggerComponents } from './swagger';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lago API',
      version: '1.0.0',
      description: 'Lago 社区二手租售平台 API 文档',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: '开发环境',
      },
    ],
    components: getSwaggerComponents(),
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'], // 扫描路由和控制器文件中的 Swagger 注释
};

export const swaggerSpec = swaggerJsdoc(options);

