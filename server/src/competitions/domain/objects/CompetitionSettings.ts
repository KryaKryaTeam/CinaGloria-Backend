import { ApiError, CompetitionErrors } from 'src/error/ApiError';

interface ISETTINGS_SCHEMA {
  showRoundsOneByOne: boolean;
  maxTeamMembers: number;
  minTeamMembers: number;
  maxTeams: number;
  countOfWinners: number;
  maxScoreValue: number;
}

const SETTINGS_SCHEMA: ISETTINGS_SCHEMA = {
  showRoundsOneByOne: false,
  maxTeamMembers: 10,
  minTeamMembers: 1,
  maxTeams: 100,
  countOfWinners: 1,
  maxScoreValue: 10,
} as const;

type SettingKey = keyof typeof SETTINGS_SCHEMA;
type SettingValue<K extends SettingKey> = ISETTINGS_SCHEMA[K];

export class CompetitionSettings {
  private readonly _values: Map<SettingKey, unknown>;

  private constructor(values: Map<SettingKey, unknown>) {
    this._values = values;
  }

  public static createDefaults(): CompetitionSettings {
    return new CompetitionSettings(
      new Map(
        Object.entries(SETTINGS_SCHEMA) as Iterable<
          readonly [keyof ISETTINGS_SCHEMA, unknown]
        >,
      ),
    );
  }

  public static fromPlain(plain: Record<string, unknown>): CompetitionSettings {
    const values = new Map<SettingKey, unknown>();

    (Object.keys(SETTINGS_SCHEMA) as SettingKey[]).forEach((key) => {
      const providedValue = plain[key];
      const schema = SETTINGS_SCHEMA[key];

      if (providedValue === undefined) {
        values.set(key, schema);
        return;
      }

      if (typeof providedValue !== typeof schema) {
        ApiError.throw(CompetitionErrors.SETTING_TYPE_NOT_VALID, key);
      }

      values.set(key, providedValue);
    });

    return new CompetitionSettings(values);
  }

  public get<K extends SettingKey>(key: K): SettingValue<K> {
    return this._values.get(key) as SettingValue<K>;
  }

  public set<K extends SettingKey>(key: K, value: SettingValue<K>): void {
    const schema = SETTINGS_SCHEMA[key];
    if (typeof value !== typeof schema) {
      ApiError.throw(CompetitionErrors.SETTING_TYPE_NOT_VALID, key);
    }
    this._values.set(key, value);
  }

  public toJSON(): Record<string, unknown> {
    return Object.fromEntries(this._values);
  }
}
