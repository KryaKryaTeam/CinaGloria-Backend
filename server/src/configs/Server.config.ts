import { registerAs } from '@nestjs/config';

export default registerAs('server', () => ({
  baseUrl: process.env.BASE_URL || 'http://localhost:4000/',
  version: process.env.VERSION,
  port: process.env.PORT || 4000,
  isPreview: process.env.IS_PREVIEW == 'TRUE' || false,
  mode: process.env.NODE_ENV || 'production',
  avalibleTestEndpoints:
    process.env.AVALIBLE_TESTABLE_ENDPOINTS == 'TRUE' || false,
  setup: {
    email: process.env.SETUP_ADMIN_EMAIL || 'admin@localhost',
    password: process.env.SETUP_ADMIN_PASSWORD || 'admin',
  },
}));
