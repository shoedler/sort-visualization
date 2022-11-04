import { DOMAdapter as DOMAdapter } from "./domAdapter";
import { IObservableArraySorter, ObservableArrayStats, ObservableArray } from "./observableArray";

const StorageKeys = {
  sourceArray: "sourceArray",
  sourceArraySize: "sourceArraySize",
  sorterName: "sorterName",
  barSpanFactor: "barSpanFactor",
  delay: "delay",
}

export class Controller {
  private readonly _domAdapter: DOMAdapter;

  public constructor(
      domAdapter: DOMAdapter, 
      sorters: { [key: string]: IObservableArraySorter; }
    ) {
    this._domAdapter = domAdapter;
    this._sorterLookup = sorters;
    window.addEventListener("resize", () => {
      this._domAdapter.updateVisualArray(this._cachedSourceArray, this.barSpanFactor);
    });
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
    if (!Object.keys(this._sorterLookup).includes(v))
      throw new Error(`Unknown sorter '${v}', must be one of ${Object.keys(this._sorterLookup).join(", ")}`);	
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
    this._domAdapter.updateVisualArray(this._cachedSourceArray, this.barSpanFactor);
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

  private _currentStats: ObservableArrayStats = new ObservableArrayStats();
  public set currentStats(v: ObservableArrayStats) {
    this._currentStats = v;
  }
  public get currentStats(): ObservableArrayStats {
    return this._currentStats;
  }
  public get currentReads(): number { return this._currentStats.reads ?? 0; }
  public get currentWrites(): number { return this._currentStats.writes ?? 0; }
  public get currentComparisons(): number { return this._currentStats.comparisons ?? 0; }
  public get currentSwaps(): number { return this._currentStats.swaps ?? 0; }


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
    this._domAdapter.updateVisualArray(this._cachedSourceArray, this.barSpanFactor);
  }
  public retrieveSourceArray = (): number[] => {
    let arr: number[];

    if ((arr = this._cachedSourceArray).length > 0) {
      this._domAdapter.updateVisualArray(arr, this.barSpanFactor);
      return arr
    }
    
    if ((arr = JSON.parse(localStorage.getItem(StorageKeys.sourceArray) ?? "[]") as number[]).length > 0) {
      this._cachedSourceArray = arr;
      this._domAdapter.updateVisualArray(arr, this.barSpanFactor);
      return arr;
    }
    
    for (let i = 0; i < this.sourceArraySize; i++)
      arr.push(this.randomSourceArrayNumber());

    localStorage.setItem(StorageKeys.sourceArray, JSON.stringify(arr));
    this._cachedSourceArray = arr;
    this._domAdapter.updateVisualArray(arr, this.barSpanFactor);

    return arr;
  }

  public sort = async (before: () => any, after: () => any): Promise<void> => {
    before()
    const observableArray = new ObservableArray(this, this._domAdapter.getArray());
    const stats = await this._sorterLookup[this._sorterName].sort(observableArray);
    console.log(stats);
    after();
  }
}