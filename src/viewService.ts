export class ViewService {
  private static _instance: ViewService;
  public static get = (): ViewService => {
    if (this._instance)
      return this._instance
    this._instance = new ViewService();
    return this._instance;
  }
  private constructor() {}

  private _sortButton: HTMLButtonElement = document.querySelector(".button-sort") as HTMLButtonElement;
  private _generateButton: HTMLButtonElement = document.querySelector(".button-generate") as HTMLButtonElement;
  private _cancelButton: HTMLButtonElement = document.querySelector(".button-cancel") as HTMLButtonElement;
  private _dropdownButton: HTMLButtonElement = document.querySelector(".button-drop") as HTMLButtonElement;
  private _dropdownMenu: HTMLDivElement = document.querySelector(".dropdown-content") as HTMLDivElement;
  private _delaySlider: HTMLInputElement = document.querySelector(".slider-delay") as HTMLInputElement;
  private _sizeSlider: HTMLInputElement = document.querySelector(".slider-size") as HTMLInputElement;
  private _dataContainer: HTMLDivElement = document.querySelector(".data-container") as HTMLDivElement;

  public setDropdownButtonLabel = (v: string) => this._dropdownButton.innerHTML = "&nbsp;" + v + "&nbsp;";

  public updateVisualArray = (arr: number[], barSpanFactor: number) => {
    this._dataContainer.replaceChildren(...[]);

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];

      // Calculate bar width
      const width = this._dataContainer.clientWidth;
      const availableBarWidth = width / arr.length;

      const bar = document.createElement("div");
      bar.style.width = `${availableBarWidth * barSpanFactor}px`;
      bar.style.transform = `translateX(${((i * availableBarWidth) + availableBarWidth * (1 - barSpanFactor))}px)`;
      bar.style.height = `${value * 3}px`;

      const barLabel = document.createElement("label");
      barLabel.innerHTML = value.toString();

      // Update the bar's label on resize
      new ResizeObserver(_ => { barLabel.innerHTML = (parseInt(bar.style.height, 10) / 3).toString(); }).observe(bar);

      bar.appendChild(barLabel);
      this._dataContainer.appendChild(bar);
    }
  };

  public bindDropdownItems = (items: { label: string; onclick: () => void; }[]) => {
    this._dropdownMenu.replaceChildren(...[]);

    items.forEach(obj => {
      const sorterButton = document.createElement("a");
      sorterButton.innerHTML = obj.label;
      sorterButton.onclick = obj.onclick;
      this._dropdownMenu.appendChild(sorterButton);
    });
  };

  public bindDelaySlider = (initial: number, oninputGen: (el: HTMLInputElement) => () => void) => {
    this._delaySlider.value = initial.toString();
    this._delaySlider.oninput = oninputGen(this._delaySlider);
  };

  public bindSizeSlider = (initial: number, oninputGen: (el: HTMLInputElement) => () => void) => {
    this._sizeSlider.value = initial.toString();
    this._sizeSlider.oninput = oninputGen(this._sizeSlider); 
  };

  public bindSortButton = (onclickGen: (el: HTMLButtonElement) => () => void) => {
    this._sortButton.onclick = onclickGen(this._sortButton); 
  };

  public bindGenerateButton = (onclickGen: (el: HTMLButtonElement) => () => void) => {
    this._generateButton.onclick = onclickGen(this._generateButton); 
  };

  public bindCancelButton = (onclickGen: (el: HTMLButtonElement) => () => void) => {
    this._cancelButton.onclick = onclickGen(this._cancelButton); 
  };
}
