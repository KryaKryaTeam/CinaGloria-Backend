import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  domain: process.env.MAIL_DOMAIN,
  apiKey: process.env.MAIL_API_KEY,
  templateCode: process.env.MAIL_CODE_TEMPLATE,
  templateContent: process.env.MAIL_CONTENT_TEMPLATE,
}));
