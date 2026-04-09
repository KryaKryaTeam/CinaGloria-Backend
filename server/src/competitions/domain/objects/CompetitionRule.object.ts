import { ApiError, CompetitionErrors } from 'src/error/ApiError';
import { Icons } from 'src/types/Icons';

export interface ICompetitionRule {
  name: string;
  description: string;
  icon: Icons;
}

export class CompetitionRule {
  private readonly _name: string;
  private readonly _description: string;
  private readonly _icon: Icons;

  private constructor(values: ICompetitionRule) {
    this._name = values.name;
    this._description = values.description;
    this._icon = values.icon;
  }

  public static define(name: string, description: string, icon: Icons) {
    if (name.trim().length == 0 || name.trim().length > 255)
      ApiError.throw(CompetitionErrors.RULE_NAME_INVALID);
    if (description.trim().length == 0 || description.trim().length > 1000)
      ApiError.throw(CompetitionErrors.RULE_DESCRIPTION_INVALID);

    if (!icon) ApiError.throw(CompetitionErrors.RULE_ICON_INVALID);

    return new CompetitionRule({ name, description, icon });
  }

  get value(): ICompetitionRule {
    return {
      name: this._name,
      description: this._description,
      icon: this._icon,
    };
  }

  toJSON() {
    return this.value;
  }
}
