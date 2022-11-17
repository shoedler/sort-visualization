import { Model } from "./model";
import useObservableArray, { IObservableArraySorter } from "./observableArray";
import useObservableArrayAudioPlayer from "./observableArrayAudioPlayer";
import useController from "./controller";
import useObservableArrayVisualizer from "./observableArrayVisualizer";
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
import useViewService from "./viewService";

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

// class Observable<T> {
//   public constructor(init?: T) {
//     this._value = init;
//   }

//   private onGetHandlers: ((v?: T) => void)[] = [];
//   private onSetHandlers: ((v?: T) => void)[] = [];

//   private _value : T;
//   public get value() : T {
//     this.onGetHandlers.forEach(fn => fn(this._value))
//     return this._value;
//   }
//   public set value(v : T) {
//     this.onSetHandlers.forEach(fn => fn(v))
//     this._value = v;
//   }
  
//   public addOnGetHandler = (fn: (v?: T) => void) => this.onGetHandlers.push(fn);
//   public addOnSetHandler = (fn: (v?: T) => void) => this.onSetHandlers.push(fn);
// }

// const name: Observable<string> = new Observable();
// name.addOnSetHandler(str => console.log(str+" was set"))
// name.addOnGetHandler(str => console.log(str+" was retrieved"))

// name.value = "123;"
// name.value = "312"

// if (name.value == "312") {
//   name.value = "Works!";
// }

(() => {
  document.addEventListener("DOMContentLoaded", _ => {
    const model = new Model();
    const viewService = useViewService(model);
    const audioPlayer = useObservableArrayAudioPlayer(model);
    const visualizer = useObservableArrayVisualizer(model);
    const array = useObservableArray(model, visualizer, audioPlayer);
    const controller = useController(model, viewService, visualizer, audioPlayer, array) 
  
    controller.run();
  })
})()