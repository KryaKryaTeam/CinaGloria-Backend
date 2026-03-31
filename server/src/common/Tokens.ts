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
  FileRelationMapper = 'FILE_RELATION_MAPPER',
  CompetitionMapper = 'COMPETITION_MAPPER',
  RoundMapper = 'ROUND_MAPPER',
  TaskMapper = 'TASK_MAPPER',
}

export enum ReposTokens {
  UserRepository = 'USER_REPOSITORY',
  AuthorizationProviderRepository = 'AUTHORIZATION_PROVIDER_REPOSITORY',
  NotificationRepository = 'NOTIFICATION_REPOSITORY',
  FileRepository = 'FILE_REPOSITORY',
  FileRelationRepository = 'FILE_RELATION_REPOSITORY',
  CompetitionRepository = 'COMPETITION_REPOSITORY',
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
  GetCSRFToken = 'GET_CSRF_TOKEN_QUERY',
  GetNotificationsQuery = 'GET_NOTIFICATION_QUERY',
  MakeNotificationReaded = 'MAKE_NOTIFICATION_READED_COMMAND',
  UploadFileCommand = 'UPLOAD_FILE_COMMAND',
  GetLinkQuery = 'GET_LINK_QUERY',
  CreateCompetitionCommand = 'CREATE_COMPETITION_COMMAND',
  UpdateCompetitionCommand = 'UPDATE_COMPETITION_COMMAND',
  DeleteCompetitionCommand = 'DELETE_COMPETITION_COMMAND',
  PublishCompetitionCommand = 'PUBLISH_COMPETITION_COMMAND',
  ScheduleCompetitionPublishCommand = 'SCHEDULE_COMPETITION_PUBLISH_COMMAND',
  DeclineScheduledPublishCommand = 'DECLINE_SCHEDULED_PUBLISH_COMMAND',
  GetPublicCompetitionQuery = 'GET_PUBLIC_COMPETITION_QUERY',
  GetCompetitionPageQuery = 'GET_COMPETITION_PAGE_QUERY',
  GetPublicCompetitionsPageQuery = 'GET_PUBLIC_COMPETITIONS_PAGE_QUERY',
  SendTestNotificationCommand = 'SEND_TEST_NOTIFICATION_COMMAND',
  CreateSuperUserCommand = 'CREATE_SUPER_USER_COMMAND',
  SetRoleToAUserCommand = 'SET_ROLE_TO_A_USER_COMMAND',
  DeleteGarbageCommand = 'DELETE_GARBAGE_COMMAND',
}

export enum ServiceTokens {
  AuthorizationProviderService = 'AUTHORIZATION_PROVIDER_SERVICE',
  JWTService = 'JWT_SERVICE',
  HashService = 'HASH_SERVICE',
  NotificationService = 'NOTIFICATION_SERVICE',
  WsTicketService = 'WS_TICKET_SERVICE',
  LoadFileService = 'LOAD_FILE_SERVICE',
  FileLinkerService = 'FILE_LINKER_SERVICE',
}

export enum MetadataTokens {
  USER_KEY = 'USER_METADATA',
}
