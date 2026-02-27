import { registerAs } from '@nestjs/config';

export default registerAs('ws', () => ({
  port: process.env.WEBSOCKET_PORT ?? 4001,
  secret: process.env.WEBSOCKET_SECRET,
}));
