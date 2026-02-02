
import { Request, Response, NextFunction } from 'express';

// Fix: Use any for res to avoid 'property status does not exist' errors
export const errorMiddleware = (err: any, req: Request, res: any, next: NextFunction) => {
  console.error(`[Error] ${err.stack}`);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
