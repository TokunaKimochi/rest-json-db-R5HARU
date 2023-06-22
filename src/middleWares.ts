import { Request, Response, NextFunction } from 'express';
import ErrorResponse from 'interfaces/ErrorResponse';

class HttpException extends Error {
  statusCode?: number;

  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode || 500;
    this.message = message;
  }
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err: HttpException, _: Request, res: Response<ErrorResponse>): void {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: err.stack,
  });
}
