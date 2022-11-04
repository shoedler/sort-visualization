import { Pane, ListApi } from "tweakpane";
import { Controller } from "./controller";
import { DOMAdapter } from "./domAdapter";
import { IObservableArrayConfigProvider, IObservableArraySorter } from "./observableArray";
import { IObservableArrayVisualizerConfigProvider } from "./observableArrayVisualizer";
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

const Sorters: { [key: string]: IObservableArraySorter } = {
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

const Defaults = {
  sourceArraySize: 100,
  barSpanFactor: 0.7,
  delay: 30,
  sorterName: Object.keys(Sorters)[0],
};

export class Model implements IObservableArrayConfigProvider, IObservableArrayVisualizerConfigProvider {
  public constructor() {
    this.defaults();
  }

  private defaults = () => {
    this._delay = 30;
    this._sourceArraySize = 100;
    this._barSpanFactor = 0.7;
    this._sorterName = Object.keys(Sorters)[0];
    this._transitionTime = 0.1;
    this._barCompareColorA = "#ff6600";
    this._barCompareColorB = "#f44336";
    this._barReadColor = "#ffeb3b";
    this._barSwapColorA = "#18beff";
    this._barSwapColorB = "#00bcd4";
    this._barWriteColor = "#4caf50";
    this._currentReads = 0;
    this._currentWrites = 0;
    this._currentComparisons = 0;
    this._currentSwaps = 0;
  }
  
  private _delay: number;
  public get delay(): number { return this._delay; }
  public set delay(v: number) { this._delay = v; }

  private _sourceArraySize: number;
  public get sourceArraySize(): number { return this._sourceArraySize; }
  public set sourceArraySize(v: number) { this._sourceArraySize = v; }

  private _barSpanFactor: number;
  public get barSpanFactor(): number { return this._barSpanFactor; }
  public set barSpanFactor(v: number) { this._barSpanFactor = v; }

  private _sorterName: string;
  public get sorterName(): string { return this._sorterName; }
  public set sorterName(v: string) { this._sorterName = v; }

  private _transitionTime: number;
  public get transitionTime(): number { return this._transitionTime; }
  public set transitionTime(v: number) { this._transitionTime = v; }

  private _barCompareColorA: string;
  public get barCompareColorA(): string { return this._barCompareColorA; }
  public set barCompareColorA(v: string) { this._barCompareColorA = v; }

  private _barCompareColorB: string;
  public get barCompareColorB(): string { return this._barCompareColorB; }
  public set barCompareColorB(v: string) { this._barCompareColorB = v; }

  private _barReadColor: string;
  public get barReadColor(): string { return this._barReadColor; }
  public set barReadColor(v: string) { this._barReadColor = v; }

  private _barSwapColorA: string;
  public get barSwapColorA(): string { return this._barSwapColorA; }
  public set barSwapColorA(v: string) { this._barSwapColorA = v; }

  private _barSwapColorB: string;
  public get barSwapColorB(): string { return this._barSwapColorB; }
  public set barSwapColorB(v: string) { this._barSwapColorB = v; }

  private _barWriteColor: string;
  public get barWriteColor(): string { return this._barWriteColor; }
  public set barWriteColor(v: string) { this._barWriteColor = v; }

  private _currentReads: number;
  public get currentReads(): number { return this._currentReads; }
  public set currentReads(v: number) { this._currentReads = v; }

  private _currentWrites: number;
  public get currentWrites(): number { return this._currentWrites; }
  public set currentWrites(v: number) { this._currentWrites = v; }

  private _currentComparisons: number;
  public get currentComparisons(): number { return this._currentComparisons; }
  public set currentComparisons(v: number) { this._currentComparisons; }

  private _currentSwaps: number;
  public get currentSwaps(): number { return this._currentSwaps; }
  public set currentSwaps(v: number) { this._currentSwaps; }

}


(() => {
  const controller = new Controller( new DOMAdapter(), Sorters);

  
  const pane = new Pane({
    title: "Sorting Visualizer",
    container: document.getElementById("controls-container"),
  });

  //
  // Controls Folder
  //
  const controlsFolder = pane.addFolder({
    title: "Controls",
    expanded: true,
  })

  // Generate new array button
  const generateButton = controlsFolder.addButton({ 
    title: "Generate New Array" 
  })
  generateButton.on("click", () => { 
    controller.removeSourceArray()
    window.location.reload();
  });

  // Sort button
  const sortButton = controlsFolder.addButton({ 
    title: "Sort" 
  })

  controlsFolder.addSeparator();

  // Cancel button
  const cancelButton = controlsFolder.addButton({ 
    title: "Reset" 
  }).on("click", () => {
    window.location.reload();
  });
  (cancelButton.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.backgroundColor = "var(--color-pink)";
  (cancelButton.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.color = "var(--fg-color)";

  controlsFolder.addSeparator();
  
  // Sorter dropdown
  const sorterList: ListApi<any> = controlsFolder.addBlade({ view: "list", label: "sorter", options: Object.entries(controller.sorterLookup).map(e => { return { text: e[0], value: e[0] } }), value: controller.sorterName }) as ListApi<any>
  sorterList.on("change", (ev) => {
      controller.sorterName = ev.value;
  });
  
  // 
  // Simulation Parameters Folder
  //
  const simParamsFolder = pane.addFolder({
    title: "Simulation",
    expanded: true,
  })

  // Delay slider (Frame delay)
  const delaySlider = simParamsFolder.addInput(Defaults, "delay", {
    min: 0,
    max: 500,
    step: 5,
    value: 30,
  })

  // Array Size slider
  const arraySizeSlider = simParamsFolder.addInput(controller, "sourceArraySize", {
    label: "array size",
    min: 10,
    max: 100,
    step: 1 
  })

  //
  // Visual & Audio Parameters Folder
  //
  const visualParamsTab = pane.addTab({
    pages: [
      {title: 'Visuals'},
      {title: 'Audio'},
    ],
  })

  // Bar Span Factor slider
  const barSpanSlider = visualParamsTab.pages[0].addInput(controller, "barSpanFactor", {
    label: "bar width",
    min: 0.1,
    max: 1,
    step: 0.1
  })

  const styleMap = new DOMStyleAdapter();

  visualParamsTab.pages[0].addInput(styleMap, 'transitionTime', {
    label: 'transition time',
    min: 0,
    max: 0.3,
    step: 0.01,
    value: 0.1
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barCompareColorA', {
    label: 'compare a',
    view: 'color',
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barCompareColorB', {
    label: 'compare b',
    view: 'color',
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barReadColor', {
    label: 'read',
    view: 'color',
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barSwapColorA', {
    label: 'swap a',
    view: 'color',
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barSwapColorB', {
    label: 'swap b',
    view: 'color',
  })
  visualParamsTab.pages[0].addInput(styleMap, 'barWriteColor', {
    label: 'write',
    view: 'color',
  })


  // 
  // Monitoring Folder
  //
  const monitorFolder = pane.addFolder({
    title: "Monitor",
    expanded: true,
  })

  // Current reads graph
  monitorFolder.addMonitor(controller, 'currentReads', {
    label: 'reads',
    view: 'text',
    format: (v) => v.toFixed(0),
    interval: 10,
  });

  // Current writes graph
  monitorFolder.addMonitor(controller, 'currentWrites', {
    label: 'writes',
    view: 'text',
    format: (v) => v.toFixed(0),
    interval: 10,
  });

  // Current comparisons text
  monitorFolder.addMonitor(controller, 'currentComparisons', {
    label: 'comparisons',
    view: 'text',
    format: (v) => v.toFixed(0),
    interval: 10,
  });
  
  // Current swaps text
  monitorFolder.addMonitor(controller, 'currentSwaps', {
    label: 'swaps',
    view: 'text',
    format: (v) => v.toFixed(0),
    interval: 10,
  });

  const beforeSort = () => {
    arraySizeSlider.disabled = true;
    generateButton.disabled = true;
    sortButton.disabled = true;
    sorterList.disabled = true;
    barSpanSlider.disabled = true;
    cancelButton.title = "Cancel & Reset";
  };

  const afterSort = () => {
    arraySizeSlider.disabled = false;
    generateButton.disabled = false;
    sortButton.disabled = false;
    sorterList.disabled = false;
    barSpanSlider.disabled = false;
    cancelButton.title = "Reset";
  };

  let timeout: NodeJS.Timeout = null;    
  pane.on('change', () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      const preset = pane.exportPreset();
      localStorage.setItem('preset', JSON.stringify(preset));
    }, 1000);
  });

  const preset = localStorage.getItem('preset');
  if (preset) {
    pane.importPreset(JSON.parse(preset));
  }
  

  sortButton.on("click", async () => {
    await controller.sort(beforeSort, afterSort);
  });

  controller.retrieveSourceArray();
})()