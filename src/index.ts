import { IObservableArraySorter, ObservableArray } from "./observableArray";
import { ObservableBubbleSort, ObservableCombSort, ObservableHeapSort, ObservableInsertionSort, ObservableMergeSort, ObservableQuickSort, ObservableRadixSort, ObservableSelectionSort, ObservableShellSort } from "./sorters";

export const CONFIG = {
  arraySize: 80,
  barSpanFactor: 0.7, // Max: 1, represents the percentage of the available bar width that is filled
  delay: parseInt(localStorage.getItem("delay"), 10) ?? 30 // Delay in milliseconds between each step of the sort
}

const sorters: { [key: string]: IObservableArraySorter } = {
  "Bubble Sort": new ObservableBubbleSort(),
  "Merge Sort": new ObservableMergeSort(),
  "Insertion Sort": new ObservableInsertionSort(),
  "Selection Sort": new ObservableSelectionSort(),
  "Quick Sort": new ObservableQuickSort(),
  "Heap Sort": new ObservableHeapSort(),
  "Radix Sort": new ObservableRadixSort(),
  "Shell Sort": new ObservableShellSort(),
  "Comb Sort": new ObservableCombSort(),
}

let sorter: IObservableArraySorter = sorters["Bubble Sort"];
let sourceArray: number[] = [];

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
const resetArray = (): number[] => {
  sourceArray = JSON.parse(localStorage.getItem("sourceArray") ?? "[]");
  console.log(sourceArray);
  if (sourceArray.length === 0) {
    for (let i = 0; i < CONFIG.arraySize; i++) 
      sourceArray.push(Math.floor(Math.random() * 100) + 1);
  }
  return sourceArray;
}

window.sort = async (): Promise<void> => {
  disable();
  const divArray = Array.from(document.querySelectorAll(".data-container > div") as NodeListOf<HTMLDivElement>);
  const statsSpan = document.querySelector(".sorting-stats") as HTMLSpanElement;
  const observableArray = new ObservableArray(divArray, statsSpan);
  const stats = await sorter.sort(observableArray);
  console.log(stats);
  enable();
}

window.select = (sorterName: string) => {
  const dropdownButton = document.querySelector(".button-drop") as HTMLButtonElement; 
  dropdownButton.innerHTML = "&nbsp;" + sorterName + "&nbsp;";
  sorter = sorters[sorterName] as IObservableArraySorter;
  localStorage.setItem("sorter", sorterName);
}
  
window.generate = () => {
  localStorage.removeItem("sourceArray")
  window.location.reload();
}
window.cancel = () => {
  localStorage.setItem("sourceArray", JSON.stringify(sourceArray));  
  window.location.reload();
}


// Setup
(() => {
  const container = document.querySelector(".data-container");
  resetArray();

  // Create bar array
  for (let i = 0; i < CONFIG.arraySize; i++) {
    const value = sourceArray[i];

    // Calculate bar width
    const width = (document.querySelector(".data-container") as HTMLElement).clientWidth;
    const availableBarWidth = width / CONFIG.arraySize;

    const bar = document.createElement("div");
    bar.style.width = `${availableBarWidth * CONFIG.barSpanFactor}px`;
    
    bar.style.transform = `translateX(${((i * availableBarWidth) + availableBarWidth * (1 - CONFIG.barSpanFactor))}px)`;
    bar.style.height = `${value * 3}px`;
    
    const barLabel = document.createElement("label");
    barLabel.innerHTML = value.toString();

    // Update the bar's label on resize
    new ResizeObserver(_ => { barLabel.innerHTML = (parseInt(bar.style.height, 10) / 3).toString() }).observe(bar);

    bar.appendChild(barLabel);
    container.appendChild(bar);
  }

  // Initialize dropdown with cached sorter, if available
  const storedSorter = localStorage.getItem("sorter");
  select(storedSorter ?? "Bubble Sort");

  // Add dropdown items
  const dropdownMenu = document.querySelector(".dropdown-content") as HTMLDivElement;
  
  Object.keys(sorters).forEach(sorterName => {
    const sorterButton = document.createElement("a");
    sorterButton.innerHTML = sorterName;
    sorterButton.onclick = _ => select(sorterName);
    dropdownMenu.appendChild(sorterButton);
  });

  // Initialize slider
  const delaySlider = document.querySelector(".slider-delay") as HTMLInputElement;
  delaySlider.value = CONFIG.delay.toString();
  delaySlider.oninput = _ => {
    CONFIG.delay = parseInt(delaySlider.value, 10);
    console.log(CONFIG.delay);
    
    localStorage.setItem("delay", CONFIG.delay.toString());
  }
  
})();
