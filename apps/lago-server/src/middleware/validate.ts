import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.map((error: ValidationError) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      return res.status(400).json({ error: messages.join('; ') });
    }

    req.body = dto;
    next();
  };
}

