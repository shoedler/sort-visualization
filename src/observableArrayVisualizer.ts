import { IObservableArrayVisualizer } from "./observableArray";

const Selectors = {
  container: "data-container",
  compareColorA: "bar-compare-a", // css var & html class
  compareColorB: "bar-compare-b", // css var & html class
  swapColorA: "bar-swap-a", // css var & html class
  swapColorB: "bar-swap-b", // css var & html class
  readColor: "bar-read", // css var & html class
  writeColor: "bar-write", // css var & html class
  transitionTime: "transition-time", // css var & html class
}

export interface IObservableArrayVisualizerConfigProvider {
  readonly barCompareColorA: string;
  readonly barCompareColorB: string;
  readonly barSwapColorA: string;
  readonly barSwapColorB: string;
  readonly barReadColor: string;
  readonly barWriteColor: string;
  readonly transitionTime: number;
}

export class ObservableArrayVisualizer implements IObservableArrayVisualizer {
  private readonly _configProvider: IObservableArrayVisualizerConfigProvider;
  private readonly _dataContainer: HTMLDivElement = document.getElementById(Selectors.container) as HTMLDivElement;

  public constructor(configProvider: IObservableArrayVisualizerConfigProvider) {
    this._configProvider = configProvider;
  }

  private getArray = (): HTMLDivElement[] => Array.from(this._dataContainer.children) as HTMLDivElement[];

  public setStyle = (index: number, type: "read" | "write" | "swapA" | "swapB" | "compareA" | "compareB"): void => {
    throw new Error("Method not implemented.");
  }
  public setValue = (index: number, height: number): void => {
    throw new Error("Method not implemented.");
  }
  public getValue = (index: number): number => {
    throw new Error("Method not implemented.");
  }

  public updateVisualArray = (arr: number[], barSpanFactor: number) => {
    this._dataContainer.replaceChildren(...[]);

    const width = parseFloat(getComputedStyle(this._dataContainer).width);
    const height = this._dataContainer.clientHeight;

    const availableBarHeight = height * 0.9;
    const availableBarWidth = width / arr.length;
    
    const barWidth = availableBarWidth * barSpanFactor;
    const barMargin = (availableBarWidth - barWidth) / 2;

    let barPos = barMargin;

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      const bar = document.createElement("div");
      
      bar.style.width = `${barWidth}px`;
      bar.style.transform = `translateX(${barPos}px)`;
      bar.style.height = `${value * availableBarHeight / 100}px`;
      bar.style.borderRadius = `${barWidth / 2}px`;
      
      barPos += barWidth + barMargin * 2;

      const barLabel = document.createElement("label");
      barLabel.innerHTML = value.toString();

      // Update the bar's label on resize
      new ResizeObserver(_ => { barLabel.innerHTML = Math.ceil(parseInt(bar.style.height, 10)  / availableBarHeight * 100).toFixed(0); }).observe(bar);

      bar.appendChild(barLabel);
      this._dataContainer.appendChild(bar);
    }
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