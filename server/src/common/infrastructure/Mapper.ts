export abstract class Mapper<T, K> {
  public abstract toEntity(schema: T): K;
  public abstract toSchema(entity: K): T;
}
