import { registerAs } from '@nestjs/config';

export default registerAs('github', () => ({
  clientId: process.env.GITHUB_CLIENT_ID,
  secret: process.env.GITHUB_SECRET,
}));
