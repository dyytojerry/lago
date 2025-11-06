import { Response } from 'express'
import { transformResponseData } from './data-transformer'

export function createErrorResponse(res: Response, message: string, status: number = 400) {
  return res.status(status).json({ 
    success: false,
    error: message 
  })
}

export function createSuccessResponse(res: Response, data: any, status: number = 200) {
  // 自动转换Prisma Decimal类型为数字
  const transformedData = transformResponseData(data)
  
  return res.status(status).json({
    success: true,
    data: transformedData
  })
}

// 如果需要跳过自动转换，可以使用这个函数
export function createRawSuccessResponse(res: Response, data: any, status: number = 200) {
  return res.status(status).json({
    success: true,
    data
  })
}
