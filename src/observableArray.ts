import { CONFIG } from "./index";

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

export class ObservableArray {
  private _array: HTMLElement[] = [];
  private _statsSink: HTMLSpanElement;
  private _stats: ObservableArrayStats = {} as ObservableArrayStats;
  private _audioContext: AudioContext = null;

  public get stats(): ObservableArrayStats { return this._stats; }
  public get length(): number { return this._array.length; }

  constructor(domDivArray: HTMLDivElement[], statsSink: HTMLSpanElement) {
    this._stats = new ObservableArrayStats();
    this._array = domDivArray
    this._statsSink = statsSink;
    this._audioContext = new AudioContext();
  }

  private sound = (noteIndex: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine', reverb: number = 0.5) => {
    const o = this._audioContext.createOscillator()
    const g = this._audioContext.createGain()
    o.connect(g)
    o.type = type
    o.frequency.value = notes[Math.min( ...[ noteIndex, notes.length - 1 ] )]
    g.connect(this._audioContext.destination)
    g.gain.exponentialRampToValueAtTime( 0.00001, this._audioContext.currentTime + reverb)
    g.gain.value = 0.5
    o.start(0)
    o.stop(this._audioContext.currentTime + reverb)
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
    this._statsSink.innerHTML = `Reads ${this._stats.reads} | Writes ${this._stats.writes} | Comparisons ${this._stats.comparisons} | Swaps ${this._stats.swaps}`;
    this._array.forEach(div => div.className = "");
    return fn({ 
      read: this.read, 
      write: this.write,
      setClassName: (index: number, className: string) => this._array[index].className = className,
      pause: () => this.pause(CONFIG.delay)
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
      const value1 = actions.read(index1);
      const value2 = actions.read(index2);

      this._array[index1].className = 'bar-red';
      this._array[index2].className = 'bar-yellow';

      await this.pause(CONFIG.delay); 
      return this.compareFn(value1, op, value2);
    })
  }

  public compareWithVal = async (index: number, op: '>' | '>=' | '<' | '<=' | '==' | '!=', value: number): Promise<boolean> => {
    this._stats.comparisons++;
    return await this.command(`Compare a[${index}] ${op} ${value} `, async (actions) => {
      const value1 = actions.read(index);

      this._array[index].className = 'bar-red';

      await this.pause(CONFIG.delay);
      return this.compareFn(value1, op, value);
    })
  }

  public swap = async (index1: number, index2: number): Promise<void> => {
    this._stats.swaps++;
    await this.command(`Swap ${index1} and ${index2}`, async (actions) => {

      this._array[index1].className = 'bar-blue';
      this._array[index2].className = 'bar-green';

      await this.pause(CONFIG.delay / 2);
      
      const tmp = actions.read(index1);
      actions.write(index1, actions.read(index2));
      actions.write(index2, tmp);

      this._array[index1].className = 'bar-green';
      this._array[index2].className = 'bar-blue';
      
      await this.pause(CONFIG.delay / 2);
    })
  }

  public set = async (index: number, value: number): Promise<void> => {
    await this.command(`Set ${index} to ${value}`, async (actions) => {
      this._array[index].className = 'bar-blue';
      actions.write(index, value);
      await this.pause(CONFIG.delay);
    })
  }

  public get = async (index: number): Promise<number> => {
    return await this.command(`Get ${index}`, async (actions) => {
      this._array[index].className = 'bar-red';
      const value = actions.read(index);
      await this.pause(CONFIG.delay);
      return value;
    })
  }
}

const notes = Object.values({
  'C0': 16.35,
  'C#0': 17.32,
  'Db0': 17.32,
  'D0': 18.35,
  'D#0': 19.45,
  'Eb0': 19.45,
  'E0': 20.60,
  'F0': 21.83,
  'F#0': 23.12,
  'Gb0': 23.12,
  'G0': 24.50,
  'G#0': 25.96,
  'Ab0': 25.96,
  'A0': 27.50,
  'A#0': 29.14,
  'Bb0': 29.14,
  'B0': 30.87,
  'C1': 32.70,
  'C#1': 34.65,
  'Db1': 34.65,
  'D1': 36.71,
  'D#1': 38.89,
  'Eb1': 38.89,
  'E1': 41.20,
  'F1': 43.65,
  'F#1': 46.25,
  'Gb1': 46.25,
  'G1': 49.00,
  'G#1': 51.91,
  'Ab1': 51.91,
  'A1': 55.00,
  'A#1': 58.27,
  'Bb1': 58.27,
  'B1': 61.74,
  'C2': 65.41,
  'C#2': 69.30,
  'Db2': 69.30,
  'D2': 73.42,
  'D#2': 77.78,
  'Eb2': 77.78,
  'E2': 82.41,
  'F2': 87.31,
  'F#2': 92.50,
  'Gb2': 92.50,
  'G2': 98.00,
  'G#2': 103.83,
  'Ab2': 103.83,
  'A2': 110.00,
  'A#2': 116.54,
  'Bb2': 116.54,
  'B2': 123.47,
  'C3': 130.81,
  'C#3': 138.59,
  'Db3': 138.59,
  'D3': 146.83,
  'D#3': 155.56,
  'Eb3': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F#3': 185.00,
  'Gb3': 185.00,
  'G3': 196.00,
  'G#3': 207.65,
  'Ab3': 207.65,
  'A3': 220.00,
  'A#3': 233.08,
  'Bb3': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C#4': 277.18,
  'Db4': 277.18,
  'D4': 293.66,
  'D#4': 311.13,
  'Eb4': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F#4': 369.99,
  'Gb4': 369.99,
  'G4': 392.00,
  'G#4': 415.30,
  'Ab4': 415.30,
  'A4': 440.00,
  'A#4': 466.16,
  'Bb4': 466.16,
  'B4': 493.88,
  'C5': 523.25,
  'C#5': 554.37,
  'Db5': 554.37,
  'D5': 587.33,
  'D#5': 622.25,
  'Eb5': 622.25,
  'E5': 659.26,
  'F5': 698.46,
  'F#5': 739.99,
  'Gb5': 739.99,
  'G5': 783.99,
  'G#5': 830.61,
  'Ab5': 830.61,
  'A5': 880.00,
  'A#5': 932.33,
  'Bb5': 932.33,
  'B5': 987.77,
  'C6': 1046.50,
  'C#6': 1108.73,
  'Db6': 1108.73,
  'D6': 1174.66,
  'D#6': 1244.51,
  'Eb6': 1244.51,
  'E6': 1318.51,
  'F6': 1396.91,
  'F#6': 1479.98,
  'Gb6': 1479.98,
  'G6': 1567.98,
  'G#6': 1661.22,
  'Ab6': 1661.22,
  'A6': 1760.00,
  'A#6': 1864.66,
  'Bb6': 1864.66,
  'B6': 1975.53,
  'C7': 2093.00,
  'C#7': 2217.46,
  'Db7': 2217.46,
  'D7': 2349.32,
  'D#7': 2489.02,
  'Eb7': 2489.02,
  'E7': 2637.02,
  'F7': 2793.83,
  'F#7': 2959.96,
  'Gb7': 2959.96,
  'G7': 3135.96,
  'G#7': 3322.44,
  'Ab7': 3322.44,
  'A7': 3520.00,
  'A#7': 3729.31,
  'Bb7': 3729.31,
  'B7': 3951.07,
  'C8': 4186.01
});
