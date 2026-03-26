export interface IRoundRepository {
  save(ent: RoundEntity): Promise<void>;
  findById(id: string): Promise<RoundEntity | null>;
}
