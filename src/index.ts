import { Controller } from "./controller";
import { ObservableArray } from "./observableArray";
import { ViewService } from "./viewService";
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

(() => {
  const viewService = ViewService.get();
  const controller = Controller.build({
    "Bubble Sort": new ObservableBubbleSort(),
    "Merge Sort": new ObservableMergeSort(),
    "Insertion Sort": new ObservableInsertionSort(),
    "Selection Sort": new ObservableSelectionSort(),
    "Quick Sort": new ObservableQuickSort(),
    "Heap Sort": new ObservableHeapSort(),
    "Radix Sort": new ObservableRadixSort(),
    "Shell Sort": new ObservableShellSort(),
    "Comb Sort": new ObservableCombSort(),
  });

  controller.retrieveSourceArray();

  // Add dropdown items
  viewService.setDropdownButtonLabel(controller.sorterName);

  viewService.bindDropdownItems(
    Object.keys(controller.sorterLookup).map(key => { return { label: key, onclick: () => Controller.get().sorterName = key} } )
  );

  viewService.bindDelaySlider(controller.delay, slider => () => { 
    Controller.get().delay = parseInt(slider.value, 10) 
  });

  viewService.bindSizeSlider(controller.sourceArraySize, slider => () => { 
    Controller.get().sourceArraySize = parseInt(slider.value, 10) 
  });

  viewService.bindGenerateButton(button => () => {
    Controller.get().removeSourceArray()
    window.location.reload();
  });

  viewService.bindCancelButton(button => () => {
    window.location.reload();
  })

  viewService.bindSortButton(button => async () => {
    disable();
    const divArray = Array.from(document.querySelectorAll(".data-container > div") as NodeListOf<HTMLDivElement>);
    const statsSpan = document.querySelector(".sorting-stats") as HTMLSpanElement;
    const observableArray = new ObservableArray(divArray, statsSpan);
    const stats = await Controller.get().sorter.sort(observableArray);
    console.log(stats);
    enable();
  });

})()

const enable = () => {
  (document.querySelector(".button-generate") as HTMLButtonElement).disabled = false;
  (document.querySelector(".button-sort") as HTMLButtonElement).disabled = false;
  (document.querySelector(".button-drop") as HTMLButtonElement).disabled = false;
}

const disable = () => {
  (document.querySelector(".button-generate") as HTMLButtonElement).disabled = true;
  (document.querySelector(".button-sort") as HTMLButtonElement).disabled = true;
  (document.querySelector(".button-drop") as HTMLButtonElement).disabled = true;
}