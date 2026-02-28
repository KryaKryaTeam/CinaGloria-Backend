import { RoleEnum } from 'src/types/RoleEnum';
import { AuthProviderEntity } from './AuthProvider.entity';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { randomUUID } from 'crypto';
import { Username } from '../objects/Username.object';
import { AvatarURL } from '../objects/AvatarURL.object';
import { IHashService } from 'src/authorization/application/bounds/IHashService';
import { Entity } from 'src/common/domain/Entity';
import { SendNotificationEvent } from 'src/notification/domain/events/SendNotificationEvent';
import { Notification } from 'src/notification/domain/entities/Notification';
import { Age } from '../objects/Age.object';

export interface IUserAdditionalData {
  telegram?: string;
  discord?: string;
  firstName?: string;
  lastName?: string;
  surName?: string;
  birthDay?: Date;
}

interface IUserEntityConstructorProps {
  id: string;
  email: string;
  _username: Username;
  _avatarUrl: AvatarURL;
  _additionalData?: IUserAdditionalData;
  _role: string;
  _authorizationProviders: AuthProviderEntity[];
}

export interface IPublicProfile {
  id: string;
  username: string;
  avatarURL: string;
  role: RoleEnum;
  contacts: {
    telegram?: string;
    discord?: string;
  };
}

export interface IPrivateProfile extends IPublicProfile {
  email: string;
  authorizationProviders: string[];
  age?: {
    value?: number | null;
    birthDay?: Date;
  };
  fullName?: {
    value: string;
    firstName?: string;
    lastName?: string;
    surName?: string;
  };
}

export class UserEntity extends Entity {
  public readonly id: string;
  public readonly email: string;
  private _username: Username;
  private _avatarUrl: AvatarURL;
  private _additionalData: IUserAdditionalData = {};
  private _role: RoleEnum;
  private _authorizationProviders: AuthProviderEntity[] = [];

  constructor(partial: IUserEntityConstructorProps) {
    super();
    Object.assign(this, partial);
  }

  public static create(
    email: string,
    username: Username,
    avatarUrl: AvatarURL,
  ) {
    const ent = new UserEntity({
      email,
      id: randomUUID(),
      _role: RoleEnum.USER,
      _authorizationProviders: [],
      _avatarUrl: avatarUrl,
      _username: username,
    });

    ent.addEvent(
      new SendNotificationEvent(
        Notification.create({
          title: 'Welcome to CinaGloria',
          content: '###Hello!',
          from: 'System',
          targets: ['ws'],
          to: ent,
        }),
      ),
    );

    return ent;
  }

  async linkProvider(
    provider: AuthProviderEntity,
    checkProviderUnique: (providerId: string) => Promise<boolean>,
  ) {
    if (this._authorizationProviders?.find((ent) => ent.isType(provider.type)))
      throw new DomainError('This user already has provider with this type!');

    if (!provider.isType(AuthorizationProviderTypes.LOCAL))
      if (!(await checkProviderUnique(provider.getProviderId())))
        throw new DomainError(DomainErrors.DUPLICATION);

    this._authorizationProviders.push(provider);
  }

  hasRole(role: RoleEnum) {
    return role == this._role;
  }

  setRoleTo(requester: UserEntity, role: RoleEnum) {
    if (!requester.hasRole(RoleEnum.ADMIN))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (this.hasRole(role)) throw new DomainError(DomainErrors.NO_CHANGE);

    this._role = role;
  }

  async changeUsername(
    username: string,
    checkUnique: (username: string) => Promise<boolean>,
  ) {
    if (username.length < 8 || username.length > 50)
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (username.startsWith('_'))
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    if (!(await checkUnique(username)))
      throw new DomainError(DomainErrors.DUPLICATION);

    this._username = Username.create(username);
  }
  changePassword(password: string) {
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
    )
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    const providerForChange = this._authorizationProviders.find((e) =>
      e.isType(AuthorizationProviderTypes.LOCAL),
    );

    if (!providerForChange)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);

    //here should be hash service

    providerForChange.setPasswordHash(password);
  }
  changeAvatarURL(avatar_url: AvatarURL) {
    this._avatarUrl = avatar_url;
  }

  public get username() {
    return this._username;
  }

  public get avatarURL() {
    return this._avatarUrl;
  }

  public get role() {
    return this._role;
  }

  public get isProfileFull() {
    if (!this._additionalData.discord || !this._additionalData.telegram)
      return false;

    if (!this._additionalData.birthDay) return false;

    if (!this._additionalData.firstName || !this._additionalData.lastName)
      return false;

    return true;
  }

  public get additionalData() {
    return this._additionalData;
  }

  public set additionalData(data: IUserAdditionalData) {
    if (data.birthDay) Age.fromDate(data.birthDay);

    if (this._additionalData.birthDay != null && data.birthDay)
      throw new DomainError(DomainErrors.IMMUTABLE_VALUE);

    if (data.telegram && data.telegram[0] != '@')
      throw new DomainError(DomainErrors.RESTRICTED_CHANGE);

    this._additionalData.birthDay =
      data.birthDay ?? this._additionalData.birthDay;
    this._additionalData.discord = data.discord ?? this._additionalData.discord;
    this._additionalData.firstName =
      data.firstName ?? this._additionalData.firstName;
    this._additionalData.lastName =
      data.lastName ?? this._additionalData.lastName;
    this._additionalData.surName = data.surName ?? this._additionalData.surName;
    this._additionalData.telegram =
      data.telegram ?? this._additionalData.telegram;
  }

  public get authorizationProviders() {
    return this._authorizationProviders;
  }

  public get publicProfile(): IPublicProfile {
    return {
      id: this.id,
      username: this._username.value,
      avatarURL: this.avatarURL.value,
      role: this.role,
      contacts: {
        discord: this._additionalData.discord,
        telegram: this._additionalData.telegram,
      },
    };
  }

  public get privateProfile(): IPrivateProfile {
    return {
      ...this.publicProfile,
      authorizationProviders: this._authorizationProviders.map((el) => el.type),
      email: this.email,
      age: {
        value: this.age,
        birthDay: this._additionalData.birthDay,
      },
      fullName: {
        value: this.fullName,
        firstName: this._additionalData.firstName,
        lastName: this._additionalData.lastName,
        surName: this._additionalData.surName,
      },
    };
  }

  private get age() {
    if (!this._additionalData.birthDay) return null;

    return Age.fromDate(this._additionalData.birthDay).value;
  }

  public get fullName() {
    const { firstName, lastName, surName } = this._additionalData;

    return [firstName, lastName, surName].filter(Boolean).join(' ');
  }

  public isAuthorizationDataCorrect(data: string, hashService: IHashService) {
    return (
      this.authorizationProviders.findIndex((provider) =>
        provider.isDataEqual(data, hashService),
      ) !== -1
    );
  }

  public hasAuthorizationProvider(type: AuthorizationProviderTypes) {
    return (
      this.authorizationProviders.findIndex((provider) =>
        provider.isType(type),
      ) !== -1
    );
  }
}
