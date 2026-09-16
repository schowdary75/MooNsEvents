import type { NextFunction, Request, Response } from 'express';
import { isCorsOriginAllowed } from '../utils/corsOrigin.js';
import { AppError } from '../errors/AppError.js';

export function originGuard(request: Request, _response: Response, next: NextFunction) {
  const origin = request.header('origin');
  if (origin && !isCorsOriginAllowed(origin))
    return next(new AppError(403, 'Origin is not allowed', 'ORIGIN_REJECTED'));
  next();
}
