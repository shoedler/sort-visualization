import { Model } from "./model";
import useObservableArray, { IObservableArraySorter } from "./observableArray";
import useObservableArrayAudioPlayer from "./observableArrayAudioPlayer";
import useObservableArrayController from "./observableArrayController";
import useObservableArrayVisualizer from "./observableArrayVisualizer";
import { 
  ObservableBubbleSort,
  ObservableCombSort,
  ObservableHeapSort,
  ObservableInsertionSort,
  ObservableMergeSort,
  ObservableQuickSort,
  ObservableRadixSort,
  ObservableSelectionSort,
  ObservableShellSort } from "./sorters";

export const Sorters: { [key: string]: IObservableArraySorter } = {
  "Bubble Sort": new ObservableBubbleSort(),
  "Merge Sort": new ObservableMergeSort(),
  "Insertion Sort": new ObservableInsertionSort(),
  "Selection Sort": new ObservableSelectionSort(),
  "Quick Sort": new ObservableQuickSort(),
  "Heap Sort": new ObservableHeapSort(),
  "Radix Sort": new ObservableRadixSort(),
  "Shell Sort": new ObservableShellSort(),
  "Comb Sort": new ObservableCombSort(),
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
  const model = new Model();
  const audioPlayer = useObservableArrayAudioPlayer(model);
  const visualizer = useObservableArrayVisualizer(model);
  const array = useObservableArray(model, visualizer, audioPlayer);
  const controller = useObservableArrayController(model, visualizer, array) 

  controller.run();
})()