export interface ITicketService {
  generate(userId: string): string;
  validate(token: string): string;
}
