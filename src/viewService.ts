import { CSSColorRules, CSSRules, CSSTimeRules, DOMSelectors } from "./constants";


export interface IViewServiceConfigProvider {
  readonly barWidth: number;
  readonly compareColorA: string;
  readonly compareColorB: string;
  readonly swapColorA: string;
  readonly swapColorB: string;
  readonly readColor: string;
  readonly writeColor: string;
  readonly transitionTime: number;
}

export interface IViewService {
  updateCssColorRule(rule: keyof typeof CSSColorRules & keyof IViewServiceConfigProvider): void;
  updateCssTimeRule(rule: keyof typeof CSSTimeRules & keyof IViewServiceConfigProvider): void;
  updateCssBarWidthRule(rule: 'barWidth' & keyof IViewServiceConfigProvider): void
  readonly controlsContainer: HTMLElement;
}

export default function useViewService(configProvider: IViewServiceConfigProvider) {
  return new ViewService(configProvider)
}

class ViewService implements IViewService {
  private _configProvider: IViewServiceConfigProvider;

  constructor(configProvider: IViewServiceConfigProvider) {
    this._configProvider = configProvider;
  }

  public get controlsContainer(): HTMLElement {
    return document.getElementById(DOMSelectors.controlsContainer) as HTMLElement;
  }

  private setRootStyle = (rule: keyof typeof CSSRules, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty('--' + CSSRules[rule], value)

  public updateCssBarWidthRule = (rule: 'barWidth' & keyof IViewServiceConfigProvider): void => {
    const value = this._configProvider[rule] * 100 + '%';
    this.setRootStyle(rule, value)
  }

  public updateCssTimeRule = (rule: keyof typeof CSSTimeRules & keyof IViewServiceConfigProvider): void => {
    const value = this._configProvider[rule] + 's';
    this.setRootStyle(rule, value)
  }

  public updateCssColorRule = (rule: keyof typeof CSSColorRules & keyof IViewServiceConfigProvider): void => {
    const value = this._configProvider[rule];
    this.setRootStyle(rule, value)
  }
}