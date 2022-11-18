import { CSSColorRules, CSSRules, CSSTimeRules } from "./constants";


export interface IStyleServiceConfigProvider {
  readonly barWidth: number;
  readonly compareColorA: string;
  readonly compareColorB: string;
  readonly swapColorA: string;
  readonly swapColorB: string;
  readonly readColor: string;
  readonly writeColor: string;
  readonly transitionTime: number;
}

export interface IStyleService {
  updateCssColorRule(rule: keyof typeof CSSColorRules & keyof IStyleServiceConfigProvider): void;
  updateCssTimeRule(rule: keyof typeof CSSTimeRules & keyof IStyleServiceConfigProvider): void;
  updateCssBarWidthRule(rule: 'barWidth' & keyof IStyleServiceConfigProvider): void
}

export default function useStyleService(configProvider: IStyleServiceConfigProvider) {
  return new StyleService(configProvider)
}

class StyleService implements IStyleService {
  private _configProvider: IStyleServiceConfigProvider;

  constructor(configProvider: IStyleServiceConfigProvider) {
    this._configProvider = configProvider;
    const a = [1, 3, 4]
    var b = [1, 2, 3]
  }

  private setRootStyle = (rule: keyof typeof CSSRules, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty('--' + CSSRules[rule], value)

  public updateCssBarWidthRule = (rule: 'barWidth' & keyof IStyleServiceConfigProvider): void => {
    const value = this._configProvider[rule] * 100 + '%';
    this.setRootStyle(rule, value)
  }

  public updateCssTimeRule = (rule: keyof typeof CSSTimeRules & keyof IStyleServiceConfigProvider): void => {
    const value = this._configProvider[rule] + 's';
    this.setRootStyle(rule, value)
  }

  public updateCssColorRule = (rule: keyof typeof CSSColorRules & keyof IStyleServiceConfigProvider): void => {
    const value = this._configProvider[rule];
    this.setRootStyle(rule, value)
  }
}