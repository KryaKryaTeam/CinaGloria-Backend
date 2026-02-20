import { registerAs } from '@nestjs/config';

export default registerAs('username', () => ({
  animals: process.env.USERNAME_PART1?.split(','),
  adjectives: process.env.USERNAME_PART2?.split(','),
}));
