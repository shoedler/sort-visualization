const CSSColors = {
  compareColorA: "bar-compare-a",
  compareColorB: "bar-compare-b",
  swapColorA: "bar-swap-a",
  swapColorB: "bar-swap-b",
  readColor: "bar-read",
  writeColor: "bar-write",
}

const CSSRules = {
  transitionTime: "transition-time",
  ...CSSColors
}

const Selectors = {
  dataContainer: "data-container",
  controlsContainer: "controls-container",
}

export interface IObservableArrayVisualizerConfigProvider {
  readonly barSpanFactor: number;
  readonly compareColorA: string;
  readonly compareColorB: string;
  readonly swapColorA: string;
  readonly swapColorB: string;
  readonly readColor: string;
  readonly writeColor: string;
  readonly transitionTime: number;
}

export interface IObservableArrayVisualizer {

  setStyle(index: number, type: keyof typeof CSSColors): void;
  clearStyles(): void;
  setValue(index: number, value: number): void;
  getValue(index: number): number;
  getLength(): number;
  
  rebuildArray(sourceArray: number[]): void;
  redrawArray(): void;
  updateCssRule(rule: keyof typeof CSSRules & keyof IObservableArrayVisualizerConfigProvider): void;
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

  private _array: HTMLDivElement[] = Array.from(this._dataContainer.children) as HTMLDivElement[];

  public get controlsContainer(): HTMLDivElement { return this._controlsContainer }

  public getLength(): number {
    return this._dataContainer.children.length
  }

  public clearStyles(): void {
    this._array.forEach(div => div.className = "");
  }

  public setStyle = (index: number, type: keyof typeof CSSColors): void => {
    this._array[index].className = CSSColors[type]
  }

  public setValue = (index: number, value: number): void => {
    this._array[index].style.height = `${value}px`;
  }

  public getValue = (index: number): number => {
    return parseInt(this._array[index].style.height);
  }

  private calcSizes = (len: number): { 
    availableBarHeight: number,
    availableBarWidth: number,
    barWidth: number, 
    barMargin: number } => {
    const width = parseFloat(getComputedStyle(this._dataContainer).width);
    const height = this._dataContainer.clientHeight;

    const availableBarHeight = height * 0.9;
    const availableBarWidth = width / len;
    
    const barWidth = availableBarWidth * this._configProvider.barSpanFactor;
    const barMargin = (availableBarWidth - barWidth) / 2;

    return { availableBarHeight, availableBarWidth, barWidth, barMargin }
  }

  private setIthBar = (bar: HTMLDivElement, value: number, barPos: number, sizes: { barWidth: number, barMargin: number, availableBarHeight: number }): number => {
    bar.style.width = `${sizes.barWidth}px`;
    bar.style.transform = `translateX(${barPos}px)`;
    bar.style.height = `${value * sizes.availableBarHeight / 100}px`;
    bar.style.borderRadius = `${sizes.barWidth / 2}px`;

    return sizes.barWidth + sizes.barMargin * 2;
  }

  public redrawArray = (): void => {
    const sizes = this.calcSizes(this._array.length);

    let barPos = sizes.barMargin;

    for (let i = 0; i < this._array.length; i++) {
      const value = parseInt(this._array[i].id, 10);
      const bar = this._array[i];
      
      barPos += this.setIthBar(bar, value, barPos, sizes);
    }
  }

  public rebuildArray = (sourceArray: number[]): void => {
    this._dataContainer.replaceChildren(...[]);

    const sizes = this.calcSizes(sourceArray.length)

    let barPos = sizes.barMargin;

    for (let i = 0; i < sourceArray.length; i++) {
      const value = sourceArray[i];
      const bar = document.createElement("div");
      
      barPos += this.setIthBar(bar, value, barPos, sizes);

      const barLabel = document.createElement("label");
      barLabel.innerHTML = value.toString();

      // Update the bar's label on resize
      new ResizeObserver(_ => { 
        barLabel.innerHTML = Math.ceil(parseInt(bar.style.height, 10)  / sizes.availableBarHeight * 100).toFixed(0); 
      }).observe(bar);

      bar.appendChild(barLabel);
      this._dataContainer.appendChild(bar);
    }

    this._array = Array.from(this._dataContainer.children) as HTMLDivElement[];
  };

  

  private setRootStyle = (name: string, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty(name, value)

  public updateCssRule = (rule: keyof typeof CSSRules & keyof IObservableArrayVisualizerConfigProvider): void => {
    const value = rule.toLocaleLowerCase().includes('time') ? this._configProvider[rule] + 's' : this._configProvider[rule] as string;
    this.setRootStyle('--' + CSSRules[rule], value)
  }
}