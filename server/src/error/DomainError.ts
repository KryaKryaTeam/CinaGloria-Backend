export enum DomainErrors {
  RESTRICTED_CHANGE = 'This change is restricted by domain logic',
  RESTRICTED_QUERY = 'This query is restricted by domain logic',
  IMMUTABLE_VALUE = 'This value is immutable',
  UNEXPECTED_VALUE = 'This value is unexpected',
  NO_CHANGE = "Data is equal, entity didn't changed",
  DUPLICATION = 'Data is duplicated',
}

export class DomainError extends Error {
  constructor(
    message: string | DomainErrors,
    public readonly cause: string = 'UNDEFINED',
    public readonly code: string = 'DOMAIN_VIOLATION',
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
