import { RoleEnum } from 'src/types/RoleEnum';
import { AuthProviderEntity } from './AuthProvider.entity';
import { DomainError, DomainErrors } from 'src/error/DomainError';
import { AuthorizationProviderTypes } from 'src/types/AuthorizationProvidersTypes';
import { randomUUID } from 'crypto';
import { Username } from '../objects/Username.object';
import { AvatarURL } from '../objects/AvatarURL.object';

interface IUserAdditionalData {
  telegram?: string;
  discord?: string;
  firstName?: string;
  lastName?: string;
  surName?: string;
  age?: number;
}

interface IUserEntityConstructorProps {
  id: string;
  username: Username;
  email: string;
  avatarUrl: AvatarURL;
  additionalData?: IUserAdditionalData;
  role: string;
  authorizationProvider: AuthProviderEntity[];
}

export class UserEntity {
  public readonly id: string;
  public readonly email: string;
  private _username: Username;
  private _avatarUrl: AvatarURL;
  private _additionalData: IUserAdditionalData = {};
  private _role: RoleEnum;
  private _authorizationProviders: AuthProviderEntity[];

  constructor(partial: IUserEntityConstructorProps) {
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
      role: RoleEnum.USER,
      authorizationProvider: [],
      avatarUrl,
      username: username,
    });

    return ent;
  }

  async linkProvider(
    provider: AuthProviderEntity,
    checkProviderUnique: (providerId: string) => Promise<boolean>,
  ) {
    if (this._authorizationProviders.find((ent) => ent.isType(provider.type)))
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
    if (!this._additionalData.discord && !this._additionalData.telegram)
      return false;

    if (!this._additionalData.age) return false;

    if (
      !this._additionalData.firstName ||
      !this._additionalData.lastName ||
      !this._additionalData.surName
    )
      return false;

    return true;
  }

  public get additionalData() {
    return this._additionalData;
  }

  public get authorizationProviders() {
    return this._authorizationProviders;
  }

  public isAuthorizationDataCorrect(data: string) {
    return (
      this.authorizationProviders.findIndex((provider) =>
        provider.isDataEqual(data),
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
