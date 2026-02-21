import { registerAs } from '@nestjs/config';

interface JWTConfig {
  secret_key: string;
}

export default registerAs(
  'jwt',
  (): JWTConfig => ({
    secret_key: process.env.REFRESH_TOKEN_SECRET ?? '123456789',
  }),
);
