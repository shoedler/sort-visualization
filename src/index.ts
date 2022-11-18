import { Model } from "./model";
import { ObservableArrayDriver, IObservableArraySorter } from "./observableArray/observableArrayDriver";
import useController from "./controller";
import {
  ObservableBubbleSort,
  ObservableCombSort,
  ObservableHeapSort,
  ObservableInsertionSort,
  ObservableMergeSort,
  ObservablePigeonholeSort,
  ObservableQuickSort,
  ObservableRadixSort,
  ObservableSelectionSort,
  ObservableShellSort } from "./sorters";
import useStyleService from "./styleService";

export const Sorters: { [key: string]: IObservableArraySorter } = {
  "Bubble": new ObservableBubbleSort(),
  "Pigeonhole": new ObservablePigeonholeSort(),
  "Merge": new ObservableMergeSort(),
  "Insertion": new ObservableInsertionSort(),
  "Selection": new ObservableSelectionSort(),
  "Quick": new ObservableQuickSort(),
  "Heap": new ObservableHeapSort(),
  "Radix": new ObservableRadixSort(),
  "Shell": new ObservableShellSort(),
  "Comb": new ObservableCombSort(),
};

(() => {
  document.addEventListener("DOMContentLoaded", _ => {
    const model = new Model();
    const styleService = useStyleService(model);
    const array = new ObservableArrayDriver(model);
    const controller = useController(model, styleService, array) 
  
    controller.run();
  })
})()