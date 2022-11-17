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
  dataContainer: "data-container",
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
  readonly controlsContainer: HTMLElement;
}

export default function useObservableArrayVisualizer(configProvider: IObservableArrayVisualizerConfigProvider) {
  return new ObservableArrayVisualizer(configProvider);
}

class ObservableArrayVisualizer implements IObservableArrayVisualizer {
  private readonly _configProvider: IObservableArrayVisualizerConfigProvider;
  private readonly _dataContainer: HTMLDivElement = document.getElementById(Selectors.dataContainer) as HTMLDivElement;
  private readonly _controlsContainer: HTMLDivElement = document.getElementById(Selectors.controlsContainer) as HTMLDivElement;

  public constructor(configProvider: IObservableArrayVisualizerConfigProvider) {
    this._configProvider = configProvider;
  }

  private _array: HTMLCollection;

  public get controlsContainer(): HTMLDivElement { return this._controlsContainer }

  public getLength(): number {
    return this._dataContainer.children.length
  }

  public clearStyles(): void {
    for (let i = 0; i < this._array.length; i++) {
      this._array[i].removeAttribute("class");
    }
  }

  public setStyle = (index: number, type: keyof typeof CSSColorRules): void => {
    this._array[index].className = CSSColorRules[type]
  }

  public setValue = (index: number, value: number): void => {

    this._array[index].children[0].innerHTML = value.toString();
    (this._array[index] as HTMLElement).style.height = `${value}%`;
  }

  public getValue = (index: number): number => {
    return parseInt(this._array[index].children[0].innerHTML);
  }

  public rebuildArray = (sourceArray: number[]): void => {
    this._dataContainer.replaceChildren(...[]);

    for (let i = 0; i < sourceArray.length; i++) {
      const bar = document.createElement("div");
      const barLabel = document.createElement("label");

      bar.style.height = `${sourceArray[i]}%`;
      barLabel.innerHTML = sourceArray[i].toString();

      bar.appendChild(barLabel);      
      this._dataContainer.appendChild(bar);
    }

    this._array = this._dataContainer.children;
  };

  private setRootStyle = (name: string, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty('--' + name, value)

  public updateCssTimeRule = (rule: keyof typeof CSSTimeRules & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = this._configProvider[rule] + 's';
    this.setRootStyle(CSSRules[rule], value)
  }

  public updateCssColorRule = (rule: keyof typeof CSSColorRules & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = this._configProvider[rule];
    this.setRootStyle(CSSRules[rule], value)
  }
}