import { IObservableArrayAudioPlayer } from "./observableArrayAudioPlayer";
import { IObservableArrayVisualizer } from "./observableArrayVisualizer";

const CompareOperations = {
  '>':  (a: number, b: number): boolean => a  >  b,
  '>=': (a: number, b: number): boolean => a  >= b,
  '<':  (a: number, b: number): boolean => a  <  b,
  '<=': (a: number, b: number): boolean => a  <= b,
  '==': (a: number, b: number): boolean => a === b,
  '!=': (a: number, b: number): boolean => a !== b,
}

export type ObservableArrayContext = {
  read: (index: number) => number;
  write: (index: number, value: number) => void;
  pause: () => Promise<void>;
}

export type ObservableArrayCommand<TReturns> = {
  name: string,
  action: (actions: ObservableArrayContext) => Promise<TReturns>
}

export class ObservableArrayStats {
  public reads: number = 0;
  public writes: number = 0;
  public comparisons: number = 0;
  public swaps: number = 0;
  public reset = (): void  => {
    this.reads = 0;
    this.writes = 0;
    this.comparisons = 0;
    this.swaps = 0;
  }
}

export interface IObservableArraySorter {
  sort(array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats>;
}

export interface IObservableArrayConfigProvider {
  readonly delay: number;
}

export interface IObservableArray {
  readonly stats: ObservableArrayStats
  readonly length: number
  command <TRet>(name: string, fn: (actions: ObservableArrayContext) => Promise<TRet>): Promise<TRet>
  compare(index1: number, op: keyof typeof CompareOperations, index2: number): Promise<boolean>
  compareWithVal(index: number, op: keyof typeof CompareOperations, value: number): Promise<boolean>
  swap(index1: number, index2: number): Promise<void>
  set(index: number, value: number): Promise<void>
  get(index: number): Promise<number>
}

export default function useObservableArray(
  configProvider: IObservableArrayConfigProvider,
  visualizer: IObservableArrayVisualizer,
  audioPlayer: IObservableArrayAudioPlayer): IObservableArray {
  return new ObservableArray(
    configProvider,
    visualizer,
    audioPlayer);
}

class ObservableArray implements IObservableArray {
  private readonly _configProvider: IObservableArrayConfigProvider;
  private readonly _visualizer: IObservableArrayVisualizer;
  private readonly _audioPlayer: IObservableArrayAudioPlayer;
  private readonly _stats: ObservableArrayStats;

  public get stats(): ObservableArrayStats { return this._stats; }
  public get length(): number { return this._visualizer.getLength(); }

  constructor(
    configProvider: IObservableArrayConfigProvider,
    visualizer: IObservableArrayVisualizer,
    audioPlayer: IObservableArrayAudioPlayer) {
    this._configProvider = configProvider;
    this._visualizer = visualizer;
    this._audioPlayer = audioPlayer;
    this._stats = new ObservableArrayStats();
  }

  private pause = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  // Atomic function to read from the array - this is the only way to read from it
  private read = (index: number): number => {
    this._stats.reads++;
    this._audioPlayer.sound(index + 60, 'sine');
    return this._visualizer.getValue(index)
  }

  // Atomic function to write to the array - this is the only way to write to it
  private write = (index: number, value: number): void => {
    this._stats.writes++;
    this._audioPlayer.sound(index + 40, 'sawtooth');
    this._visualizer.setValue(index, value);
  }
  
  public command = async <TRet>(name: string, fn: (actions: ObservableArrayContext) => Promise<TRet>): Promise<TRet> => {
    this._visualizer.clearStyles()
    // this._controller.currentStats = this._stats;
    return fn({ 
      read: this.read, 
      write: this.write,
      pause: () => this.pause(this._configProvider.delay)
    });
  }

  public compare = async (index1: number, op: keyof typeof CompareOperations, index2: number): Promise<boolean> => {
    this._stats.comparisons++;
    return await this.command(`Compare a[${index1}] ${op} a[${index2}] `, async (actions) => {
      this._visualizer.setStyle(index1, "compareColorA")
      this._visualizer.setStyle(index2, "compareColorB")

      const value1 = actions.read(index1);
      await this.pause(this._configProvider.delay / 2); 
      const value2 = actions.read(index2);
      await this.pause(this._configProvider.delay / 2); 

      return CompareOperations[op](value1, value2)
    })
  }

  public compareWithVal = async (index: number, op: keyof typeof CompareOperations, value: number): Promise<boolean> => {
    this._stats.comparisons++;
    return await this.command(`Compare a[${index}] ${op} ${value} `, async (actions) => {
      const value1 = actions.read(index);

      this._visualizer.setStyle(index, "compareColorA")

      await this.pause(this._configProvider.delay);
      return CompareOperations[op](value1, value)
    })
  }

  public swap = async (index1: number, index2: number): Promise<void> => {
    this._stats.swaps++;
    await this.command(`Swap ${index1} and ${index2}`, async (actions) => {
      this._visualizer.setStyle(index1, "swapColorA")
      this._visualizer.setStyle(index2, "swapColorB")

      const tmp = actions.read(index1);

      await this.pause(this._configProvider.delay / 2);

      actions.write(index1, actions.read(index2));
      actions.write(index2, tmp);

      this._visualizer.setStyle(index1, "swapColorB")
      this._visualizer.setStyle(index2, "swapColorA")
      
      await this.pause(this._configProvider.delay / 2);
    })
  }

  public set = async (index: number, value: number): Promise<void> => {
    await this.command(`Set ${index} to ${value}`, async (actions) => {
      this._visualizer.setStyle(index, "writeColor")
      actions.write(index, value);
      await this.pause(this._configProvider.delay);
    })
  }

  public get = async (index: number): Promise<number> => {
    return await this.command(`Get ${index}`, async (actions) => {
      this._visualizer.setStyle(index, "readColor")
      const value = actions.read(index);
      await this.pause(this._configProvider.delay);
      return value;
    })
  }
}
