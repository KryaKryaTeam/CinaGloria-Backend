import { registerAs } from '@nestjs/config';

export default registerAs('server', () => ({
  baseUrl: process.env.BASE_URL || 'http://localhost:4000/',
  version: process.env.VERSION,
  port: process.env.PORT || 4000,
  isPreview: process.env.IS_PREVIEW || false,
  mode: process.env.NODE_ENV || 'production',
}));
