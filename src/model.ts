import { IObservableArrayConfigProvider } from "./observableArray";
import { IObservableArrayVisualizerConfigProvider } from "./observableArrayVisualizer";
import { Sorters } from "./index";
import { IObservableArrayAudioPlayerConfigProvider } from "./observableArrayAudioPlayer";


export class Model implements IObservableArrayConfigProvider, IObservableArrayVisualizerConfigProvider, IObservableArrayAudioPlayerConfigProvider {
  public constructor() {
    this.defaults();
  }

  private defaults = () => {
    this._sorterName = Object.keys(Sorters)[0];
    this._delay = 300;
    this._sourceArraySize = 30;

    this._barSpanFactor = 0.5;
    this._transitionTime = 0.1;
    this._compareColorA = "#ff5346";
    this._compareColorB = "#ff954e";
    this._readColor = "#ffeb3b";
    this._swapColorA = "#5dc7ce";
    this._swapColorB = "#4580c7";
    this._writeColor = "#67ca6b";

    this._gain = 0.2;

    this._currentReads = 0;
    this._currentWrites = 0;
    this._currentComparisons = 0;
    this._currentSwaps = 0;
  };

  private _sorterName: string;
  public get sorterName(): string { return this._sorterName; }
  public set sorterName(v: string) { this._sorterName = v; }

  private _delay: number;
  public get delay(): number { return this._delay; }
  public set delay(v: number) { this._delay = v; }

  private _sourceArraySize: number;
  public get sourceArraySize(): number { return this._sourceArraySize; }
  public set sourceArraySize(v: number) { this._sourceArraySize = v; }


  private _barSpanFactor: number;
  public get barSpanFactor(): number { return this._barSpanFactor; }
  public set barSpanFactor(v: number) { this._barSpanFactor = v; }

  private _transitionTime: number;
  public get transitionTime(): number { return this._transitionTime; }
  public set transitionTime(v: number) { this._transitionTime = v; }

  private _compareColorA: string;
  public get compareColorA(): string { return this._compareColorA; }
  public set compareColorA(v: string) { this._compareColorA = v; }

  private _compareColorB: string;
  public get compareColorB(): string { return this._compareColorB; }
  public set compareColorB(v: string) { this._compareColorB = v; }

  private _readColor: string;
  public get readColor(): string { return this._readColor; }
  public set readColor(v: string) { this._readColor = v; }

  private _swapColorA: string;
  public get swapColorA(): string { return this._swapColorA; }
  public set swapColorA(v: string) { this._swapColorA = v; }

  private _swapColorB: string;
  public get swapColorB(): string { return this._swapColorB; }
  public set swapColorB(v: string) { this._swapColorB = v; }

  private _writeColor: string;
  public get writeColor(): string { return this._writeColor; }
  public set writeColor(v: string) { this._writeColor = v; }


  private _gain: number;
  public get gain(): number { return this._gain; }
  public set gain(v: number) { this._gain = v; }


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