import { RoleEnum } from 'src/types/RoleEnum';
import {
  AuthProviderEntity,
  IAuthProviderConstructorProps,
} from './AuthProvider.entity';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { randomUUID } from 'crypto';
import { Username } from '../objects/Username.object';
import { IHashService } from 'src/authorization/application/bounds/IHashService';
import { Entity } from 'src/common/domain/Entity';
import { Age } from '../objects/Age.object';
import { UserCreated } from '../events/UserCreated.event';
import { IEventJSON } from 'src/common/domain/Event';
import { getEventClass } from 'src/common/domain/EventRegister';
import { InternalFile } from 'src/files/domain/objects/InternalFile.object';
import { RelationSlots } from 'src/types/RelationSlots';
import { ApiError, DomainErrors, UserErrors } from 'src/error/ApiError';

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
  _avatarUrl: InternalFile<'user:avatar'>;
  _additionalData?: IUserAdditionalData;
  _role: string;
  _authorizationProviders: AuthProviderEntity[];
}

export interface IUserForAdminList {
  id: string;
  email: string;
  avatarUrl: InternalFile<'user:avatar'>;
  role: RoleEnum;
}

export interface IPublicProfile {
  id: string;
  username: string;
  avatarURL: InternalFile<'user:avatar'>;
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

export interface IUserEntityJSON {
  id: string;
  email: string;
  username: string;
  avatarURL: string;
  role: RoleEnum;
  contact: {
    telegram: string;
    discord: string;
  };
  birthDay: string;
  firstName: string;
  lastName: string;
  surName: string;
  authorizationProvider: IAuthProviderConstructorProps[];
  events: IEventJSON<unknown>[];
}

export class UserEntity extends Entity {
  public readonly id: string;
  public readonly email: string;
  private _username: Username;
  private _avatarUrl: InternalFile<typeof RelationSlots.user.avatar>;
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
    avatarUrl: InternalFile<typeof RelationSlots.user.avatar>,
  ) {
    const id = randomUUID();

    const ent = new UserEntity({
      email,
      id: id,
      _role: RoleEnum.USER,
      _authorizationProviders: [],
      _avatarUrl: avatarUrl,
      _username: username,
    });

    ent.addEvent(
      new UserCreated(
        new UserEntity({
          email,
          id: id,
          _role: RoleEnum.USER,
          _authorizationProviders: [],
          _avatarUrl: avatarUrl,
          _username: username,
        }),
      ),
    );

    return ent;
  }

  static load(plain: IUserEntityJSON): UserEntity {
    const ent = new UserEntity({
      id: plain.id,
      email: plain.email,
      _username: Username.create(plain.username),
      _avatarUrl: InternalFile.define<typeof RelationSlots.user.avatar>(
        plain.avatarURL,
        'user:avatar',
        'user:avatar',
      ),
      _role: plain.role,
      _authorizationProviders: plain.authorizationProvider.map(
        (el) => new AuthProviderEntity(el),
      ),
      _additionalData: {
        birthDay: plain.birthDay ? new Date(plain.birthDay) : undefined,
        discord: plain.contact?.discord,
        telegram: plain.contact?.telegram,
        firstName: plain.firstName,
        lastName: plain.lastName,
        surName: plain.surName,
      },
    });

    if (plain.events && Array.isArray(plain.events)) {
      plain.events.forEach((eventJson) => {
        const EventClass = getEventClass(eventJson.eventType);
        if (EventClass) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const eventInstance = Object.create(EventClass.prototype);
          Object.assign(eventInstance, eventJson.payload);
          ent.addEvent(eventInstance);
        }
      });
    }

    return ent;
  }

  static createFake(): UserEntity {
    const fakeData: IUserEntityJSON = {
      id: randomUUID(),
      email: 'fakeuser@example.com',
      username: 'fakeUsername',
      avatarURL: 'fake-avatar-url',
      contact: {
        telegram: '@fakeTelegram',
        discord: 'fakeDiscord#1234',
      },
      firstName: 'John',
      lastName: 'Doe',
      surName: 'Smith',
      birthDay: new Date('1990-01-01').toISOString(),
      role: RoleEnum.USER,
      authorizationProvider: [],
      events: [],
    };

    return UserEntity.load(fakeData);
  }

  toJSON(): IUserEntityJSON {
    return {
      id: this.id,
      email: this.email,
      username: this._username.value,
      avatarURL: this._avatarUrl.value,
      role: this._role,
      contact: {
        telegram: this._additionalData.telegram || '',
        discord: this._additionalData.discord || '',
      },
      birthDay: this._additionalData.birthDay?.toISOString() || '',
      firstName: this._additionalData.firstName || '',
      lastName: this._additionalData.lastName || '',
      surName: this._additionalData.surName || '',
      authorizationProvider: this._authorizationProviders.map((p) =>
        p.toJSON(),
      ),
      events: this.events.map((ev) => ({
        eventType: ev.constructor.name,
        payload: ev,
      })),
    };
  }

  async linkProvider(
    provider: AuthProviderEntity,
    checkProviderUnique: (providerId: string) => Promise<boolean>,
  ) {
    if (this._authorizationProviders?.find((ent) => ent.isType(provider.type)))
      ApiError.throw(UserErrors.PROVIDERS_DUPLICATION);

    if (!provider.isType(AuthorizationProviderTypes.LOCAL))
      if (!(await checkProviderUnique(provider.getProviderId())))
        ApiError.throw(DomainErrors.DUPLICATION);

    this._authorizationProviders.push(provider);
  }

  hasRole(role: RoleEnum) {
    return role == this._role;
  }

  setRoleTo(requester: UserEntity, role: RoleEnum) {
    if (!requester.hasRole(RoleEnum.ADMIN))
      ApiError.throw(UserErrors.USER_ROLE_CANT_BE_CHANGED);

    if (this.hasRole(role)) ApiError.throw(DomainErrors.NO_CHANGE);

    this._role = role;
  }

  async changeUsername(
    username: string,
    checkUnique: (username: string) => Promise<boolean>,
  ) {
    if (username.length < 8 || username.length > 50)
      ApiError.throw(UserErrors.USERNAME_LENGTH_RESTRICTION);

    if (username.startsWith('_'))
      ApiError.throw(UserErrors.USERNAME_NOT_STARTS_WITH_);

    if (!(await checkUnique(username)))
      ApiError.throw(DomainErrors.DUPLICATION);

    this._username = Username.create(username);
  }
  changePassword(password: string) {
    if (
      !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    )
      ApiError.throw(UserErrors.PASSWORD_IS_INCORRECT);

    const providerForChange = this._authorizationProviders.find((e) =>
      e.isType(AuthorizationProviderTypes.LOCAL),
    );

    if (!providerForChange)
      ApiError.throw(UserErrors.CHANGE_PASSWORD_FOR_NOT_LOCAL_PROVIDER);

    //here should be hash service

    providerForChange.setPasswordHash(password);
  }
  changeAvatarURL(avatar_url: InternalFile<typeof RelationSlots.user.avatar>) {
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
      ApiError.throw(DomainErrors.IMMUTABLE_VALUE);

    if (data.telegram && data.telegram[0] != '@')
      ApiError.throw(UserErrors.INCORRECT_CONTACT_DATA);

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
      avatarURL: InternalFile.define<typeof RelationSlots.user.avatar>(
        this.avatarURL.value,
        'user:avatar',
        'user:avatar',
      ),
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
        birthDay: this._additionalData.birthDay
          ? new Date(this._additionalData.birthDay)
          : undefined,
      },
      fullName: {
        value: this.fullName,
        firstName: this._additionalData.firstName,
        lastName: this._additionalData.lastName,
        surName: this._additionalData.surName,
      },
    };
  }

  get forAdminList(): IUserForAdminList {
    return {
      id: this.id,
      avatarUrl: this.avatarURL,
      email: this.email,
      role: this.role,
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

  __forceSetRole(role: RoleEnum) {
    this._role = role;
  }
}
