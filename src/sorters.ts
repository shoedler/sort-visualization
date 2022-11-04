import { IObservableArraySorter, IObservableArray, ObservableArrayStats } from "./observableArray";

export class ObservableBubbleSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    for (let i = 0; i < array.length && !signal.aborted; i++) {
      for (let j = 0; j < array.length - i - 1 && !signal.aborted; j++) {
        if (await array.compare(j, '>', j + 1)) {
          await array.swap(j, j + 1);
        }
      }
    }
    return array.stats;
  }
}

export class ObservableInsertionSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    for (let i = 0; i < array.length && !signal.aborted; i++) {
      let j = i;
      let x = await array.get(i);
      while (j > 0 && await array.compareWithVal(j-1, '>', x) && !signal.aborted) { 
        await array.set(j, await array.get(--j)); // TODO: (classification) isn't this a swap?
      }
      await array.set(j, x);
    }
    return array.stats;
  }
}

export class ObservableSelectionSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    for (let i = 0; i < array.length - 1 && !signal.aborted; i++) {
      let minIndex = i;
      for (let j = i + 1; j < array.length && !signal.aborted; j++) {
        if (await array.compare(j, '<', minIndex)) {
          minIndex = j;
        }
      }
      await array.swap(i, minIndex);
    }
    return array.stats;
  }
}

export class ObservableQuickSort implements IObservableArraySorter {
  private _signal: AbortSignal;

  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    this._signal = signal;
    await this.quickSort(array, 0, array.length - 1);
    return array.stats;
  }

  private quickSort = async (array: IObservableArray, low: number, high: number): Promise<void> => {
    if (low < high) {;
      const pi = await this.partition(array, low, high, await this.findPivot(array, low, high));
      await this.quickSort(array, low, pi - 1);
      await this.quickSort(array, pi + 1, high);
    }
  }

  private partition = async (array: IObservableArray, low: number, high: number, pivotIndex: number): Promise<number> => {
    const pivot = await array.get(pivotIndex);
    await array.swap(pivotIndex, high);
    let i = low;

    for (let j = low; j < high && !this._signal.aborted; j++) {
      if (await array.compareWithVal(j, '<=', pivot)) {
        await array.swap(i, j);
        i++;
      }
    }
    await array.swap(i, high);
    return i;
  }

  private findPivot = async (array: IObservableArray, low: number, high: number): Promise<number> => {
    const mid = Math.floor((low + high) / 2);

    const a = array.get(low);
    const b = array.get(mid);
    const c = array.get(high);

    const xor = (a: boolean, b: boolean) => (a || b) && !(a && b);

    if (xor((a > b), (a > c))) // TODO: (classification) arn't these comparisons?
      return low;
    else if (xor((b < a), (b < c))) // TODO: (classification) arn't these comparisons?
      return mid;
    else
      return high;
  }
}

export class ObservableHeapSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    for (let i = Math.floor(array.length / 2) - 1; i >= 0 && !signal.aborted; i--) {
      await this.heapify(array, array.length, i);
    }

    for (let i = array.length - 1; i > 0 && !signal.aborted; i--) {
      await array.swap(0, i);
      await this.heapify(array, i, 0);
    }
    return array.stats;
  }

  private heapify = async (array: IObservableArray, n: number, i: number): Promise<void> => {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && await array.compare(l, '>', largest)) {
      largest = l;
    }

    if (r < n && await array.compare(r, '>', largest)) {
      largest = r;
    }

    if (largest !== i) {
      await array.swap(i, largest);
      await this.heapify(array, n, largest);
    }
  }
}

export class ObservableRadixSort implements IObservableArraySorter {
  private _signal: AbortSignal

  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    this._signal = signal;
    const max = await this.getMax(array);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      await this.countSort(array, exp);
    }
    return array.stats;
  }

  private getMax = async (array: IObservableArray): Promise<number> => {
    let max = await array.get(0);
    for (let i = 1; i < array.length && !this._signal.aborted; i++) {
      if (await array.compareWithVal(i, '>', max)) {
        max = await array.get(i);
      }
    }
    return max;
  }

  private countSort = async (array: IObservableArray, exp: number): Promise<void> => {
    const output = new Array(array.length);
    const count = new Array(10).fill(0);

    for (let i = 0; i < array.length; i++) {
      count[Math.floor(await array.get(i) / exp) % 10]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = array.length - 1; i >= 0 && !this._signal.aborted; i--) {
      output[count[Math.floor(await array.get(i) / exp) % 10] - 1] = await array.get(i);
      count[Math.floor(await array.get(i) / exp) % 10]--;
    }

    for (let i = 0; i < array.length; i++) {
      await array.set(i, output[i]);
    }
  }
}

export class ObservableShellSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < array.length && !signal.aborted; i++) {
        let temp = await array.get(i);
        let j;
        for (j = i; j >= gap && await array.compareWithVal(j - gap, '>', temp); j -= gap) {
          await array.set(j, await array.get(j - gap));
        }
        await array.set(j, temp);
      }
    }
    return array.stats;
  }
}

export class ObservableCombSort implements IObservableArraySorter {
  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    let gap = array.length;
    let swapped = true;

    while ((gap !== 1 || swapped) && !signal.aborted) {
      gap = Math.max(1, Math.floor(gap / 1.3));
      swapped = false;

      for (let i = 0; i < array.length - gap; i++) {
        if (await array.compare(i + gap, '<', i)) {
          await array.swap(i, i + gap);
          swapped = true;
        }
      }
    }
    return array.stats;
  }
}

export class ObservableMergeSort implements IObservableArraySorter {
  private _signal: AbortSignal

  public sort = async (array: IObservableArray, signal: AbortSignal): Promise<ObservableArrayStats> => {
    this._signal = signal
    await this.mergeSort(array, 0, array.length - 1);
    return array.stats;
  }

  private mergeSort = async (array: IObservableArray, l: number, r: number): Promise<void> => {
    if (l < r && !this._signal.aborted) {
      const m = Math.floor((l + r) / 2);
      await this.mergeSort(array, l, m);
      await this.mergeSort(array, m + 1, r);
      await this.merge(array, l, m, r);
    }
  }

  private merge = async (array: IObservableArray, l: number, m: number, r: number): Promise<void> => {
    const n1 = m - l + 1;
    const n2 = r - m;

    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1 && !this._signal.aborted; i++) {
      L[i] = await array.get(l + i);
    }
    for (let j = 0; j < n2 && !this._signal.aborted; j++) {
      R[j] = await array.get(m + 1 + j);
    }

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
      if (L[i] <= R[j]) {
        await array.set(k, L[i++]);
      } else {
        await array.set(k, R[j++]);
      }
      k++;
    }

    while (i < n1) {
      await array.set(k++, L[i++]);
    }

    while (j < n2) {
      await array.set(k++, R[j++]);
    }
  }
}