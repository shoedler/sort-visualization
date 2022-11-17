const CSSColorRules = {
  compareColorA: "bar-compare-a",
  compareColorB: "bar-compare-b",
  swapColorA: "bar-swap-a",
  swapColorB: "bar-swap-b",
  readColor: "bar-read",
  writeColor: "bar-write",
}

const CSSTimeRules = {
  transitionTime: "transition-time",
}

const CSSRules = {
  barWidth: "bar-width",
  ...CSSTimeRules,
  ...CSSColorRules
}

const Selectors = {
  arrayContainer: "array-container",
  controlsContainer: "controls-container",
}

export interface IObservableArrayVisualizerConfigProvider {
  readonly barWidth: number;
  readonly compareColorA: string;
  readonly compareColorB: string;
  readonly swapColorA: string;
  readonly swapColorB: string;
  readonly readColor: string;
  readonly writeColor: string;
  readonly transitionTime: number;
}

export interface IObservableArrayVisualizer {

  setStyle(index: number, type: keyof typeof CSSColorRules): void;
  clearStyles(): void;
  setValue(index: number, value: number): void;
  getValue(index: number): number;
  getLength(): number;
  
  rebuildArray(sourceArray: number[]): void;
  updateCssColorRule(rule: keyof typeof CSSColorRules & keyof IObservableArrayVisualizerConfigProvider): void;
  updateCssTimeRule(rule: keyof typeof CSSTimeRules & keyof IObservableArrayVisualizerConfigProvider): void;
  updateCssBarWidthRule(rule: 'barWidth' & keyof IObservableArrayVisualizerConfigProvider): void
  readonly controlsContainer: HTMLElement;
}

export default function useObservableArrayVisualizer(configProvider: IObservableArrayVisualizerConfigProvider) {
  return new ObservableArrayVisualizer(configProvider);
}

class ObservableArrayVisualizer implements IObservableArrayVisualizer {
  private readonly _configProvider: IObservableArrayVisualizerConfigProvider;
  private readonly _arrayContainer: HTMLDivElement = document.getElementById(Selectors.arrayContainer) as HTMLDivElement;
  private readonly _controlsContainer: HTMLDivElement = document.getElementById(Selectors.controlsContainer) as HTMLDivElement;

  public constructor(configProvider: IObservableArrayVisualizerConfigProvider) {
    this._configProvider = configProvider;
  }

  private _array: HTMLCollection;

  public get controlsContainer(): HTMLDivElement { return this._controlsContainer }

  // Helper to access array indicies, since we always have to retrieve `.children[0]`
  private get = (index: number): HTMLDivElement => this._array[index].children[0] as HTMLDivElement

  public getLength(): number {
    return this._arrayContainer.children.length
  }

  public clearStyles(): void {
    for (let i = 0; i < this._array.length; i++) {
      this.get(i).removeAttribute("class");
    }
  }

  public setStyle = (index: number, type: keyof typeof CSSColorRules): void => {
    this.get(index).className = CSSColorRules[type]
  }

  public setValue = (index: number, value: number): void => {
    this.get(index).children[0].innerHTML = value.toString();
    (this.get(index) as HTMLElement).style.height = `${value}%`;
  }

  public getValue = (index: number): number => {
    return parseInt(this.get(index).children[0].innerHTML);
  }

  public rebuildArray = (sourceArray: number[]): void => {
    this._arrayContainer.replaceChildren(...[]);

    for (let i = 0; i < sourceArray.length; i++) {
      const barWrapper = document.createElement("div");
      const bar = document.createElement("div");
      const barLabel = document.createElement("label");

      bar.style.height = `${sourceArray[i]}%`;
      barLabel.innerHTML = sourceArray[i].toString();

      bar.appendChild(barLabel);
      barWrapper.appendChild(bar)
      this._arrayContainer.appendChild(barWrapper);
    }

    this._array = this._arrayContainer.children;
  };

  private setRootStyle = (rule: keyof typeof CSSRules, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty('--' + CSSRules[rule], value)

  public updateCssBarWidthRule = (rule: 'barWidth' & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = this._configProvider[rule] * 100 + '%';
    this.setRootStyle(rule, value)
  }

  public updateCssTimeRule = (rule: keyof typeof CSSTimeRules & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = this._configProvider[rule] + 's';
    this.setRootStyle(rule, value)
  }

  public updateCssColorRule = (rule: keyof typeof CSSColorRules & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = this._configProvider[rule];
    this.setRootStyle(rule, value)
  }
}