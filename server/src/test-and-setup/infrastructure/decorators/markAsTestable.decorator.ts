import {
  CanActivate,
  ExecutionContext,
  Inject,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ApiError, TestErrors } from 'src/error/ApiError';

const TESTABLE_KEY = 'mark_as_testable';
export const MarkAsTestable = () => SetMetadata(TESTABLE_KEY, true);

export class MarkAsTestableGuard implements CanActivate {
  constructor(
    @Inject() private readonly reflector: Reflector,
    @Inject() private readonly configService: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const testable = this.reflector.getAllAndOverride<boolean>(TESTABLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!testable) return true;

    const avalibleTestable = this.configService.getOrThrow<boolean>(
      'server.avalibleTestEndpoints',
    );

    if (!avalibleTestable) ApiError.throw(TestErrors.TEST_ENDPOINTS_UNAVALIBLE);
    return true;
  }
}
