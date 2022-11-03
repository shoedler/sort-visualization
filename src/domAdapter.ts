export class DOMAdapter {
  private readonly _dataContainer: HTMLDivElement = document.getElementById("data-container") as HTMLDivElement;

  public getArray = (): HTMLDivElement[] => Array.from(this._dataContainer.children) as HTMLDivElement[];

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
}

export const CssVariables = {
  compareColorA: "bar-compare-a",
  compareColorB: "bar-compare-b",
  swapColorA: "bar-swap-a",
  swapColorB: "bar-swap-b",
  readColor: "bar-read",
  writeColor: "bar-write",
  transitionTime: "transition-time",
}

export class DOMStyleAdapter {
  private setRootStyle = (name: string, value: string) => (document.querySelector(':root') as HTMLElement).style.setProperty(name, value)
  private getRootStyle = (name: string) => getComputedStyle(document.querySelector(':root')).getPropertyValue(name).trim();
  public set barCompareColorA(value: string) { this.setRootStyle('--' + CssVariables.compareColorA, value); }
  public get barCompareColorA() { return this.getRootStyle('--' + CssVariables.compareColorA).trim(); }
  public set barCompareColorB(value: string) { this.setRootStyle('--' + CssVariables.compareColorB, value); }
  public get barCompareColorB() { return this.getRootStyle('--' + CssVariables.compareColorB).trim(); }
  public set barSwapColorA(value: string) { this.setRootStyle('--' + CssVariables.swapColorA, value); }
  public get barSwapColorA() { return this.getRootStyle('--' + CssVariables.swapColorA);}
  public set barSwapColorB(value: string) { this.setRootStyle('--' + CssVariables.swapColorB, value); }
  public get barSwapColorB() { return this.getRootStyle('--' + CssVariables.swapColorB).trim(); }
  public set barReadColor(value: string) { this.setRootStyle('--' + CssVariables.readColor, value); }
  public get barReadColor() { return this.getRootStyle('--' + CssVariables.readColor).trim(); }
  public set barWriteColor(value: string) { this.setRootStyle('--' + CssVariables.writeColor, value); }
  public get barWriteColor() { return this.getRootStyle('--' + CssVariables.writeColor).trim(); }
  public set transitionTime(value: number) { this.setRootStyle('--' + CssVariables.transitionTime, value + 's'); }
  public get transitionTime() { return parseFloat(this.getRootStyle('--' + CssVariables.transitionTime).trim()); }
}