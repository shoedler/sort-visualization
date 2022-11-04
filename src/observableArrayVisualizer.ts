import { IObservableArrayVisualizer } from "./observableArray";

const Selectors = {
  dataContainer: "data-container",
  controlsContainer: "controls-container",
  compareColorA: "bar-compare-a", // css var & html class
  compareColorB: "bar-compare-b", // css var & html class
  swapColorA: "bar-swap-a", // css var & html class
  swapColorB: "bar-swap-b", // css var & html class
  readColor: "bar-read", // css var & html class
  writeColor: "bar-write", // css var & html class
  transitionTime: "transition-time", // css var & html class
}

export interface IObservableArrayVisualizerConfigProvider {
  readonly barSpanFactor: number;
  readonly barCompareColorA: string;
  readonly barCompareColorB: string;
  readonly barSwapColorA: string;
  readonly barSwapColorB: string;
  readonly barReadColor: string;
  readonly barWriteColor: string;
  readonly transitionTime: number;
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

  public setStyle = (index: number, type: "read" | "write" | "swapA" | "swapB" | "compareA" | "compareB"): void => {
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
  private getRootStyle = (name: string) => getComputedStyle(document.querySelector(':root')).getPropertyValue(name).trim();

  // public get barCompareColorB() { return this.getRootStyle('--' + Selectors.compareColorB).trim(); }
  // public get barCompareColorA() { return this.getRootStyle('--' + Selectors.compareColorA).trim(); }
  // public get barSwapColorA() { return this.getRootStyle('--' + Selectors.swapColorA);}
  // public get barSwapColorB() { return this.getRootStyle('--' + this._config.barSwapColorB).trim(); }
  // public get barReadColor() { return this.getRootStyle('--' + Selectors.readColor).trim(); }
  // public get barWriteColor() { return this.getRootStyle('--' + Selectors.writeColor).trim(); }
  // public get transitionTime() { return parseFloat(this.getRootStyle('--' + Selectors.transitionTime).trim()); }
  public updateBarCompareColorA = () =>  this.setRootStyle('--' + Selectors.compareColorA, this._configProvider.barCompareColorA); 
  public updateBarCompareColorB = () =>  this.setRootStyle('--' + Selectors.compareColorB, this._configProvider.barCompareColorB); 
  public updateBarSwapColorA = () =>  this.setRootStyle('--' + Selectors.swapColorA, this._configProvider.barSwapColorA); 
  public updateBarSwapColorB = () =>  this.setRootStyle('--' + Selectors.swapColorB, this._configProvider.barSwapColorB); 
  public updateBarReadColor = () =>  this.setRootStyle('--' + Selectors.readColor, this._configProvider.barReadColor); 
  public updateBarWriteColor = () =>  this.setRootStyle('--' + Selectors.writeColor, this._configProvider.barWriteColor); 
  public updateTransitionTime = () =>  this.setRootStyle('--' + Selectors.transitionTime, this._configProvider.transitionTime + 's'); 
}