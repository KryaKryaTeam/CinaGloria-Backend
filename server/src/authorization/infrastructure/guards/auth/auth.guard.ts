import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
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
    if (!authorizatioHeader)
      throw new UnauthorizedException('Authorization heder is undefined!');

    const parts = authorizatioHeader.split(' ');
    if (parts[0] != 'Bearer')
      throw new UnauthorizedException(
        'Unexcpected type of token! Try add Bearer to JWT',
      );
    if (!this.jwtService.checkAccess(parts[1]))
      throw new UnauthorizedException('Authorization token is unverified!');

    const decoded = this.jwtService.decode(parts[1]);

    request['user_id'] = decoded.sub;
    request['user_role'] = decoded.role;

    return true;
  }
}
