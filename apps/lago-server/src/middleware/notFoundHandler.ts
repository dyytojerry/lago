import { Request, Response } from 'express';
import { createErrorResponse } from '../lib/response';

export const notFoundHandler = (
  req: Request,
  res: Response,
  // next: NextFunction
) => {
  return createErrorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
