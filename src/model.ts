import { IObservableArrayConfigProvider } from "./observableArray";
import { IObservableArrayVisualizerConfigProvider } from "./observableArrayVisualizer";
import { Sorters } from "./index";
import { IObservableArrayAudioPlayerConfigProvider } from "./observableArrayAudioPlayer";


export class Model implements IObservableArrayConfigProvider, IObservableArrayVisualizerConfigProvider, IObservableArrayAudioPlayerConfigProvider {
  public constructor() {
    this.defaults();
  }

  private defaults = () => {
    this._gain = 0.2;
    this._delay = 30;
    this._sourceArraySize = 100;
    this._barSpanFactor = 0.7;
    this._sorterName = Object.keys(Sorters)[0];
    this._transitionTime = 0.1;
    this._barCompareColorA = "#ff6600";
    this._barCompareColorB = "#f44336";
    this._barReadColor = "#ffeb3b";
    this._barSwapColorA = "#18beff";
    this._barSwapColorB = "#00bcd4";
    this._barWriteColor = "#4caf50";
    this._currentReads = 0;
    this._currentWrites = 0;
    this._currentComparisons = 0;
    this._currentSwaps = 0;
  };

  private _gain: number;
  public get gain(): number { return this._gain; }
  public set gain(v: number) { this._gain = v; }

  private _delay: number;
  public get delay(): number { return this._delay; }
  public set delay(v: number) { this._delay = v; }

  private _sourceArraySize: number;
  public get sourceArraySize(): number { return this._sourceArraySize; }
  public set sourceArraySize(v: number) { this._sourceArraySize = v; }

  private _barSpanFactor: number;
  public get barSpanFactor(): number { return this._barSpanFactor; }
  public set barSpanFactor(v: number) { this._barSpanFactor = v; }

  private _sorterName: string;
  public get sorterName(): string { return this._sorterName; }
  public set sorterName(v: string) { this._sorterName = v; }

  private _transitionTime: number;
  public get transitionTime(): number { return this._transitionTime; }
  public set transitionTime(v: number) { this._transitionTime = v; }

  private _barCompareColorA: string;
  public get barCompareColorA(): string { return this._barCompareColorA; }
  public set barCompareColorA(v: string) { this._barCompareColorA = v; }

  private _barCompareColorB: string;
  public get barCompareColorB(): string { return this._barCompareColorB; }
  public set barCompareColorB(v: string) { this._barCompareColorB = v; }

  private _barReadColor: string;
  public get barReadColor(): string { return this._barReadColor; }
  public set barReadColor(v: string) { this._barReadColor = v; }

  private _barSwapColorA: string;
  public get barSwapColorA(): string { return this._barSwapColorA; }
  public set barSwapColorA(v: string) { this._barSwapColorA = v; }

  private _barSwapColorB: string;
  public get barSwapColorB(): string { return this._barSwapColorB; }
  public set barSwapColorB(v: string) { this._barSwapColorB = v; }

  private _barWriteColor: string;
  public get barWriteColor(): string { return this._barWriteColor; }
  public set barWriteColor(v: string) { this._barWriteColor = v; }

  private _currentReads: number;
  public get currentReads(): number { return this._currentReads; }
  public set currentReads(v: number) { this._currentReads = v; }

  private _currentWrites: number;
  public get currentWrites(): number { return this._currentWrites; }
  public set currentWrites(v: number) { this._currentWrites = v; }

  private _currentComparisons: number;
  public get currentComparisons(): number { return this._currentComparisons; }
  public set currentComparisons(v: number) { this._currentComparisons; }

  private _currentSwaps: number;
  public get currentSwaps(): number { return this._currentSwaps; }
  public set currentSwaps(v: number) { this._currentSwaps; }
}