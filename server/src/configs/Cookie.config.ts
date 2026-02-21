import { registerAs } from '@nestjs/config';
import { CookieOptions } from 'express';

export default registerAs(
  'cookie',
  (): CookieOptions => ({
    httpOnly: true,
    secure:
      process.env.NODE_ENV == 'PRODUCTION' || process.env.IS_PREVIEW == 'TRUE',
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    sameSite:
      process.env.IS_PREVIEW == 'TRUE'
        ? 'none'
        : process.env.NODE_ENV == 'PRODUCTION'
          ? 'strict'
          : 'lax',
    path: '/',
  }),
);
