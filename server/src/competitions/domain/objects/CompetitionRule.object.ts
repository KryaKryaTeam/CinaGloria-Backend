import { DomainError, DomainErrors } from 'src/error/DomainError';
import { Icons } from 'src/types/Icons';

interface ICompetitionRule {
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
    if (name.trim().length == 0 || description.trim().length == 0)
      throw new DomainError(DomainErrors.UNEXPECTED_VALUE);
    return new CompetitionRule({ name, description, icon });
  }

  get value(): ICompetitionRule {
    return {
      name: this._name,
      description: this._description,
      icon: this._icon,
    };
  }

  get toJSON() {
    return this.value;
  }
}
