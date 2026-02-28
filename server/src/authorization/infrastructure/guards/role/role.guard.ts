import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Observable } from 'rxjs';
import { RoleEnum } from 'src/types/RoleEnum';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: ExpressRequest = context.switchToHttp().getRequest();
    const roles = this.reflector.getAllAndOverride<string>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!req['user_role']) return false;
    return roles.includes(req['user_role'] as RoleEnum);
  }
}
