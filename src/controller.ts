import { IObservableArraySorter } from "./observableArray";
import { ViewService } from "./viewService";

const StorageKeys = {
  sourceArray: "sourceArray",
  sourceArraySize: "sourceArraySize",
  sorterName: "sorterName",
  barSpanFactor: "barSpanFactor",
  delay: "delay",
}

export class Controller {
  private static _instance: Controller;
  public static build = (sorterLookup: { [key: string]: IObservableArraySorter; }): Controller => {
    if (this._instance)
      throw new Error("Controller can only be instantiated once");
    this._instance = new Controller(sorterLookup);
    return this._instance;
  };
  public static get = (): Controller => {
    if (this._instance)
      return this._instance;
    throw new Error("Controller must be built first");
  };
  private constructor(sorters: { [key: string]: IObservableArraySorter; }) {
    this._sorterLookup = sorters;
  }
  
  public get sorter(): IObservableArraySorter {
    return this._sorterLookup[this.sorterName];
  }

  private readonly _sorterLookup: { [key: string]: IObservableArraySorter; };
  public get sorterLookup(): { [key: string]: IObservableArraySorter; } {
    return this._sorterLookup;
  }

  private _sorterName?: string = null
  public get sorterName(): string {
    this._sorterName ??= localStorage.getItem(StorageKeys.sorterName) ?? Object.keys(this._sorterLookup)[0];
    return this._sorterName
  }
  public set sorterName(v: string) {
    if (!(v in Object.keys(this._sorterLookup)))
      throw new Error(`Unknown sorter '${v}'`)
    ViewService.get().setDropdownButtonLabel(v);
    this._sorterName = v;
    localStorage.setItem(StorageKeys.sorterName, v.toString());
  }

  private _barSpanFactor?: number = null;
  public get barSpanFactor(): number {
    this._barSpanFactor ??= parseFloat(localStorage.getItem(StorageKeys.barSpanFactor) ?? '0.7');
    return this._barSpanFactor;
  }
  public set barSpanFactor(v: number) {
    this._barSpanFactor = v;
    localStorage.setItem(StorageKeys.barSpanFactor, v.toString());
  }


  private _delay?: number = null;
  public get delay(): number {
    this._delay ??= parseInt(localStorage.getItem(StorageKeys.delay) ?? '30', 10);
    return this._delay;
  }
  public set delay(v: number) {
    this._delay = v
    localStorage.setItem(StorageKeys.delay, v.toString());
  }

  private _cachedSourceArray: number[] = [];
  private _sourceArraySize?: number = null;
  public get sourceArraySize(): number {
    this._sourceArraySize ??= parseInt(localStorage.getItem(StorageKeys.sourceArraySize) ?? '80', 10);
    return this._sourceArraySize;
  }
  public set sourceArraySize(v: number) {  
    this._sourceArraySize = v; 
    localStorage.setItem(StorageKeys.sourceArraySize, v.toString());
    
    this.retrieveSourceArray();
    this.reshapeSourceArray();
  }
  private randomSourceArrayNumber = (): number => Math.floor(Math.random() * 100) + 1
  public removeSourceArray = (): void => {
    this._cachedSourceArray = [];
    localStorage.removeItem(StorageKeys.sourceArray);
  }
  private reshapeSourceArray = (): void => {
    if (this.sourceArraySize < this._cachedSourceArray.length)
      this._cachedSourceArray = this._cachedSourceArray.slice(0, this.sourceArraySize);
    else if ((this.sourceArraySize > this._cachedSourceArray.length)) {
      while (this._cachedSourceArray.length < this.sourceArraySize)
        this._cachedSourceArray.push(this.randomSourceArrayNumber())
    }
    else { 
      return // They are the same -- ignore
    }

    localStorage.setItem(StorageKeys.sourceArray, JSON.stringify(this._cachedSourceArray));
    ViewService.get().updateVisualArray(this._cachedSourceArray, this.barSpanFactor);
  }
  public retrieveSourceArray = (): number[] => {
    let arr: number[];

    if ((arr = this._cachedSourceArray).length > 0) {
      ViewService.get().updateVisualArray(arr, this.barSpanFactor);
      return arr
    }
    
    if ((arr = JSON.parse(localStorage.getItem(StorageKeys.sourceArray) ?? "[]") as number[]).length > 0) {
      this._cachedSourceArray = arr;
      ViewService.get().updateVisualArray(arr, this.barSpanFactor);
      return arr;
    }
    
    for (let i = 0; i < this.sourceArraySize; i++)
      arr.push(this.randomSourceArrayNumber());

    localStorage.setItem(StorageKeys.sourceArray, JSON.stringify(arr));
    this._cachedSourceArray = arr;
    ViewService.get().updateVisualArray(arr, this.barSpanFactor);

    return arr;
  }
}
