import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request as ExpressRequest } from 'express';
import { ServiceTokens } from 'src/common/Tokens';
import type { IJWTTokenService } from 'src/authorization/application/bounds/IJWTTokenService';
import { Reflector } from '@nestjs/core';

export const Secure = Reflector.createDecorator();

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(ServiceTokens.JWTService)
  private readonly jwtService: IJWTTokenService;

  @Inject()
  private readonly reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: ExpressRequest = context.switchToHttp().getRequest();

    const isSecure = this.reflector.getAllAndOverride(Secure, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isSecure) return true;

    const authorizatioHeader = request.headers.authorization;
    if (!authorizatioHeader) return false;

    const parts = authorizatioHeader.split(' ');
    if (parts[0] != 'Bearer') return false;

    if (!this.jwtService.checkAccess(parts[1])) return false;

    const decoded = this.jwtService.decode(parts[1]);

    request['user_id'] = decoded.sub;
    request['user_role'] = decoded.role;

    return true;
  }
}
