export enum BaseTokens {
  EventDispatcher = 'EVENT_DISPATCHER',
  EventHandler = 'EVENT_HANDLER',
  DBContext = 'DB_CONTEXT',
}

export enum MapperTokens {
  AuthorizationProviderMapper = 'AUTHORIZATION_PROVIDER_MAPPER',
  UserMapper = 'USER_MAPPER',
  NotificationMapper = 'NOTIFICATION_MAPPER',
}

export enum ReposTokens {
  UserRepository = 'USER_REPOSITORY',
  AuthorizationProviderRepository = 'AUTHORIZATION_PROVIDER_REPOSITORY',
  NotificationRepository = 'NOTIFICATION_REPOSITORY',
}

export enum CommandTokens {
  LoginCommand = 'LOGIN_COMMAND',
  CheckCommand = 'CHECK_COMMAND',
  GenerateTicketCommand = 'GENERATE_T',
}

export enum ServiceTokens {
  AuthorizationProviderService = 'AUTHORIZATION_PROVIDER_SERVICE',
  JWTService = 'JWT_SERVICE',
  HashService = 'HASH_SERVICE',
  NotificationService = 'NOTIFICATION_SERVICE',
  WsTicketService = 'WS_TICKET_SERVICE',
}

export enum MetadataTokens {
  USER_KEY = 'USER_METADATA',
}
