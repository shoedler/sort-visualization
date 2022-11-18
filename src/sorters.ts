import { IObservableArray } from "./observableArray/observableArrayDriver";
import { ObservableArraySorterBase } from "./observableArray/observableArraySorterBase";

export type Lookup = { [key: string]: number | string | boolean | number[] };

export class ObservableBubbleSort extends ObservableArraySorterBase {
  protected _sort = async (array: IObservableArray, vars: Lookup): Promise<void> => {
    for (vars.i= 0; vars.i < array.length; vars.i++) {
      for (vars.j = 0; vars.j < array.length - vars.i - 1; vars.j++) {
        if (await array.compare(vars.j, '>', vars.j + 1)) {
          await array.swap(vars.j, vars.j + 1);
        }
      }
      delete vars.j;
    }
    delete vars.i;
  }
}

export class ObservableInsertionSort extends ObservableArraySorterBase {
  protected _sort = async (array: IObservableArray, vars: Lookup): Promise<void> => {
    for (vars.i = 0; vars.i < array.length; vars.i++) {
      vars.j = vars.i;
      vars.x = await array.get(vars.i);
      while (vars.j > 0 && await array.compareWithVal(vars.j-1, '>', vars.x)) { 
        await array.set(vars.j, await array.get(--vars.j)); // TODO: (classification) isn't this a swap?
      }
      await array.set(vars.j, vars.x);
      delete vars.x;
      delete vars.j;
    }
    delete vars.i;
  }
}

export class ObservableSelectionSort extends ObservableArraySorterBase {
  protected _sort = async (array: IObservableArray, vars: Lookup): Promise<void> => {
    for (vars.i = 0; vars.i < array.length - 1; vars.i++) {
      vars.minIndex = vars.i;
      for (vars.j = vars.i + 1; vars.j < array.length; vars.j++) {
        if (await array.compare(vars.j, '<', vars.minIndex)) {
          vars.minIndex = vars.j;
        }
      }
      await array.swap(vars.i, vars.minIndex);
      delete vars.minIndex;
    }
  }
}

export class ObservableQuickSort extends ObservableArraySorterBase {
  protected _sort = async (array: IObservableArray, vars: Lookup): Promise<void> => {
    await this.quickSort(array, vars, 0, array.length - 1);
    delete vars.pivotIndex; // Cannot remove this in a recursive function, so we do it here.
  }

  private quickSort = async (array: IObservableArray, vars: Lookup, low: number, high: number): Promise<void> => {
    if (low < high) {;
      vars.pivotIndex = await this.partition(array, vars, low, high, await this.findPivot(array, vars, low, high));
      await this.quickSort(array, vars, low, vars.pivotIndex - 1);
      await this.quickSort(array, vars, vars.pivotIndex + 1, high);
    }
  }

  private partition = async (array: IObservableArray, vars: Lookup, low: number, high: number, pivotIndex: number): Promise<number> => {
    vars.pivotValue = await array.get(pivotIndex);
    await array.swap(pivotIndex, high);
    vars.i = low;

    for (vars.j = low; vars.j < high; vars.j++) {
      if (await array.compareWithVal(vars.j, '<=', vars.pivotValue)) {
        await array.swap(vars.i, vars.j);
        vars.i++;
      }
    }
    delete vars.j;

    await array.swap(vars.i, high);
    delete vars.pivotValue;
    const iTemp = vars.i;
    delete vars.i;
    return iTemp;
  }

  private findPivot = async (array: IObservableArray, vars: Lookup, low: number, high: number): Promise<number> => {
		vars.midIndex = Math.floor((low + high) / 2);

		vars.lowValue = await array.get(low);
		vars.midValue = await array.get(vars.midIndex);
		vars.highValue = await array.get(high);


    const xor = (a: boolean, b: boolean) => (a || b) && !(a && b);

    let pivotIndex = 0;
    if (xor((vars.lowValue > vars.midValue), (vars.lowValue > vars.highValue))) // TODO: (classification) aren't these comparisons?
      pivotIndex = low;
    else if (xor((vars.midValue < vars.lowValue), (vars.midValue < vars.highValue))) // TODO: (classification) aren't these comparisons?
      pivotIndex = vars.midIndex;
    else
      pivotIndex = high;

    delete vars.lowValue;
    delete vars.midValue;
    delete vars.highValue;
    delete vars.midIndex;
    return pivotIndex;
	}
}

export class ObservableHeapSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray): Promise<void> => {
    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
      await this.heapify(array, array.length, i);
    }

    for (let i = array.length - 1; i > 0; i--) {
      await array.swap(0, i);
      await this.heapify(array, i, 0);
    }
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

export class ObservableRadixSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray): Promise<void> => {
    const max = await this.getMax(array);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      await this.countSort(array, exp);
    }
  }

  private getMax = async (array: IObservableArray): Promise<number> => {
    let max = await array.get(0);
    for (let i = 1; i < array.length; i++) {
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

    for (let i = array.length - 1; i >= 0; i--) {
      output[count[Math.floor(await array.get(i) / exp) % 10] - 1] = await array.get(i);
      count[Math.floor(await array.get(i) / exp) % 10]--;
    }

    for (let i = 0; i < array.length; i++) {
      await array.set(i, output[i]);
    }
  }
}

export class ObservableShellSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray): Promise<void> => {
    for (let gap = Math.floor(array.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < array.length; i++) {
        let temp = await array.get(i);
        let j;
        for (j = i; j >= gap && await array.compareWithVal(j - gap, '>', temp); j -= gap) {
          await array.set(j, await array.get(j - gap));
        }
        await array.set(j, temp);
      }
    }
  }
}

export class ObservableCombSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray): Promise<void> => {
    let gap = array.length;
    let swapped = true;

    while (gap !== 1 || swapped) {
      gap = Math.max(1, Math.floor(gap / 1.3));
      swapped = false;

      for (let i = 0; i < array.length - gap; i++) {
        if (await array.compare(i + gap, '<', i)) {
          await array.swap(i, i + gap);
          swapped = true;
        }
      }
    }
  }
}

export class ObservableMergeSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray, vars: Lookup): Promise<void> => {
    await this.mergeSort(array, vars, 0, array.length - 1);
  }

  private mergeSort = async (array: IObservableArray, vars: Lookup, l: number, r: number): Promise<void> => {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      await this.mergeSort(array, vars, l, m);
      await this.mergeSort(array, vars, m + 1, r);
      await this.merge(array, vars, l, m, r);
    }
  }

  private merge = async (array: IObservableArray, vars: Lookup, l: number, m: number, r: number): Promise<void> => {
    const n1 = m - l + 1;
    const n2 = r - m;

    vars.L = new Array(n1);
    vars.R = new Array(n2);

    for (let i = 0; i < n1; i++) {
      vars.L[i] = await array.get(l + i);
    }
    for (let j = 0; j < n2; j++) {
      vars.R[j] = await array.get(m + 1 + j);
    }

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
      if (vars.L[i] <= vars.R[j]) {
        await array.set(k, vars.L[i++]);
      } else {
        await array.set(k, vars.R[j++]);
      }
      k++;
    }

    while (i < n1) {
      await array.set(k++, vars.L[i++]);
    }

    while (j < n2) {
      await array.set(k++, vars.R[j++]);
    }

    delete vars.L;
    delete vars.R;
  }
}

export class ObservablePigeonholeSort extends ObservableArraySorterBase { // TODO: Convert to use observable vars
  protected _sort = async (array: IObservableArray): Promise<void> => {
    const min = await this.getMin(array);
    const max = await this.getMax(array);
    const range = max - min + 1;

    const holes = new Array(range).fill(0);

    for (let i = 0; i < array.length; i++) {
      holes[await array.get(i) - min]++;
    }

    let i = 0;
    for (let count = 0; count < range; count++) {
      while (holes[count]-- > 0) {
        await array.set(i++, count + min);
      }
    }
  }

  private getMin = async (array: IObservableArray): Promise<number> => {
    let min = await array.get(0);
    for (let i = 1; i < array.length; i++) {
      if (await array.compareWithVal(i, '<', min)) {
        min = await array.get(i);
      }
    }
    return min;
  }

  private getMax = async (array: IObservableArray): Promise<number> => {
    let max = await array.get(0);
    for (let i = 1; i < array.length; i++) {
      if (await array.compareWithVal(i, '>', max)) {
        max = await array.get(i);
      }
    }
    return max;
  }
}