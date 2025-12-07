import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from './jwt.util';

type RequestWithUser = Request & { user?: JwtPayload };

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();

    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }

    return req.user;
  },
);
