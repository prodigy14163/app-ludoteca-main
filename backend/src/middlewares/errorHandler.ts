/**
 * MIDDLEWARES DE ERROR Y LOGGING
 */

import { Request, Response, NextFunction } from "express";

// Log de cada petición entrante
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}

// Rutas no encontradas (404)
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
}

// Manejo global de errores — siempre al final de app.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`❌ [Error] ${req.method} ${req.path}:`, error.message);

  const statusCode = error instanceof AppError ? error.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? "Error interno del servidor" : error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

// Error personalizado con código HTTP
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
