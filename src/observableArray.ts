import { Controller } from "./controller";
import { CssVariables } from "./domAdapter";

export type ObservableArrayContext = {
  read: (index: number) => number;
  write: (index: number, value: number) => void;
  setClassName: (index: number, className: string) => void;
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
}

export interface IObservableArraySorter {
  sort(array: ObservableArray): Promise<ObservableArrayStats>;
}

// TODO: Implement
export interface IObservableArrayConfigProvider {
  readonly delay: number;
}

// TODO: Implement
export interface IObservableArrayVisualizer {
  setStyle(index: number, type: 'swapA' | 'swapB' | 'compareA' | 'compareB' | 'read' | 'write'): void;
  setValue(index: number, height: number): void;
  getValue(index: number): number;
  getLength(): number;
}

// TODO: Implement
export interface IObservableArrayAudioPlayer {
  sound(noteIndex: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', reverb: number): void
}

export class ObservableArray {
  private readonly _configProvider: IObservableArrayConfigProvider;
  private readonly _visualizer: IObservableArrayVisualizer;
  private readonly _audioPlayer: IObservableArrayAudioPlayer;

  private _stats: ObservableArrayStats = {} as ObservableArrayStats;

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
    this.sound(index + 60, 'sine');
    return parseInt(this._array[index].style.height);
  }

  // Atomic function to write to the array - this is the only way to write to it
  private write = (index: number, value: number): void => {
    this._stats.writes++;
    this.sound(index + 40, 'sawtooth');
    this._array[index].style.height = `${value}px`;
  }
  
  public command = async <TRet>(name: string, fn: (actions: ObservableArrayContext) => Promise<TRet>): Promise<TRet> => {
    this._array.forEach(div => div.className = "");
    this._controller.currentStats = this._stats;
    return fn({ 
      read: this.read, 
      write: this.write,
      setClassName: (index: number, className: string) => this._array[index].className = className,
      pause: () => this.pause(this._controller.delay)
    });
  }

  private compareFn = (a: number, op: '>' | '>=' | '<' | '<=' | '==' | '!=', b: number): boolean => {
    switch (op) {
      case '>':  return a >  b;
      case '>=': return a >= b;
      case '<':  return a <  b;
      case '<=': return a <= b;
      case '==': return a == b;
      case '!=': return a != b;
      default: throw new Error(`Unknown operator ${op}`);
    }
  }

  public compare = async (index1: number, op: '>' | '>=' | '<' | '<=' | '==' | '!=', index2: number): Promise<boolean> => {
    this._stats.comparisons++;
    return await this.command(`Compare a[${index1}] ${op} a[${index2}] `, async (actions) => {
      this._array[index1].className = CssVariables.compareColorA;
      this._array[index2].className = CssVariables.compareColorB;

      const value1 = actions.read(index1);
      await this.pause(this._controller.delay / 2); 
      const value2 = actions.read(index2);
      await this.pause(this._controller.delay / 2); 

      return this.compareFn(value1, op, value2);
    })
  }

  public compareWithVal = async (index: number, op: '>' | '>=' | '<' | '<=' | '==' | '!=', value: number): Promise<boolean> => {
    this._stats.comparisons++;
    return await this.command(`Compare a[${index}] ${op} ${value} `, async (actions) => {
      const value1 = actions.read(index);

      this._array[index].className = CssVariables.compareColorA;

      await this.pause(this._controller.delay);
      return this.compareFn(value1, op, value);
    })
  }

  public swap = async (index1: number, index2: number): Promise<void> => {
    this._stats.swaps++;
    await this.command(`Swap ${index1} and ${index2}`, async (actions) => {

      this._array[index1].className = CssVariables.swapColorA;
      this._array[index2].className = CssVariables.swapColorB;

      const tmp = actions.read(index1);

      await this.pause(this._controller.delay / 2);

      actions.write(index1, actions.read(index2));
      actions.write(index2, tmp);

      this._array[index1].className = CssVariables.swapColorB;
      this._array[index2].className = CssVariables.swapColorA;
      
      await this.pause(this._controller.delay / 2);
    })
  }

  public set = async (index: number, value: number): Promise<void> => {
    await this.command(`Set ${index} to ${value}`, async (actions) => {
      this._array[index].className = CssVariables.writeColor;
      actions.write(index, value);
      await this.pause(this._controller.delay);
    })
  }

  public get = async (index: number): Promise<number> => {
    return await this.command(`Get ${index}`, async (actions) => {
      this._array[index].className = CssVariables.readColor;
      const value = actions.read(index);
      await this.pause(this._controller.delay);
      return value;
    })
  }
}
