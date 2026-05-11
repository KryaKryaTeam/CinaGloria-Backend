export interface IHashService {
  hash(data: string): string;
  compare(data: string, hashedData: string): boolean;
}
