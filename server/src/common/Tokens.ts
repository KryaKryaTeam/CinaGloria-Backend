export enum BaseTokens {
  EventDispatcher = 'EVENT_DISPATCHER',
  EventHandler = 'EVENT_HANDLER',
  DBContext = 'DB_CONTEXT',
}

export enum MapperTokens {
  AuthorizationProviderMapper = 'AUTHORIZATION_PROVIDER_MAPPER',
  UserMapper = 'USER_MAPPER',
  NotificationMapper = 'NOTIFICATION_MAPPER',
  FileMapper = 'FILE_MAPPER',
}

export enum ReposTokens {
  UserRepository = 'USER_REPOSITORY',
  AuthorizationProviderRepository = 'AUTHORIZATION_PROVIDER_REPOSITORY',
  NotificationRepository = 'NOTIFICATION_REPOSITORY',
  FileRepository = 'FILE_REPOSITORY',
}

export enum CommandTokens {
  LoginCommand = 'LOGIN_COMMAND',
  RegistarationCommand = 'REGISTRATION_COMMAND',
  ValidateRegistrationCommand = 'VALIDATE_REGISTRATION_COMMAND',
  CheckCommand = 'CHECK_COMMAND',
  GenerateTicketCommand = 'GENERATE_TICKET_COMMAND',
  RefreshCommand = 'REFRESH_COMMAND',
  GetPublicProfileQuery = 'GET_PUBLIC_PROFILE_QUERY',
  GetPrivateProfileQuery = 'GET_PUBLIC_PRIVATE_QUERY',
  UpdateUserAdditionalDataCommand = 'UPDATE_USER_ADDITIONAL_DATA_COMMAND',
  UpdateUsernameCommand = 'UPDATE_USERNAME_COMMAND',
  UpdateAvatarCommand = 'UPDATE_AVATAR_COMMAND',
  GetCSRFToken = 'GET_CSRF_TOKEN',
  GetNotificationsQuery = 'GET_NOTIFICATION_QUERY',
  MakeNotificationReaded = 'MAKE_NOTIFICATION_REDED',
}

export enum ServiceTokens {
  AuthorizationProviderService = 'AUTHORIZATION_PROVIDER_SERVICE',
  JWTService = 'JWT_SERVICE',
  HashService = 'HASH_SERVICE',
  NotificationService = 'NOTIFICATION_SERVICE',
  WsTicketService = 'WS_TICKET_SERVICE',
  LoadFileService = 'LOAD_FILE_SERVICE',
}

export enum MetadataTokens {
  USER_KEY = 'USER_METADATA',
}
