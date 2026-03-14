import { registerAs } from '@nestjs/config';
import path from 'path';

export default registerAs('storage', () => ({
  loadController: process.env.STORAGE_CONTROLLER || 'ls',
  s3: {
    id: process.env.S3_ID,
    accessKey: process.env.S3_ACCESS_KEY,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
  },
  ls: {
    basePath: process.env.BASE_PATH || path.join(process.cwd(), 'uploads'),
  },
}));
