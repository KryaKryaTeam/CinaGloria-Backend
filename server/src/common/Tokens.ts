export enum BaseTokens {
  EventDispatcher = 'EVENT_DISPATCHER',
  EventHandler = 'EVENT_HANDLER',
  DBContext = 'DB_CONTEXT',
}

export enum MapperTokens {
  AuthorizationProviderMapper = 'AUTHORIZATION_PROVIDER_MAPPER',
  UserMapper = 'USER_MAPPER',
}

export enum ReposTokens {
  UserRepository = 'USER_REPOSITORY',
  AuthorizationProviderRepository = 'AUTHORIZATION_PROVIDER_REPOSITORY',
}

export enum CommandTokens {
  LoginCommand = 'LOGIN_COMMAND',
}

export enum ServiceTokens {
  AuthorizationProviderService = 'AUTHORIZATION_PROVIDER_SERVICE',
  JWTService = 'JWT_SERVICE',
}
