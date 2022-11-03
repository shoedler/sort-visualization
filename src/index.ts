import { Pane, ListApi } from "tweakpane";
import { Controller } from "./controller";
import { DOMAdapter, DOMStyleAdapter } from "./domAdapter";
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
  const controller = new Controller(
    new DOMAdapter(),
    {
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
  const delaySlider = simParamsFolder.addInput(controller, "delay", {
    min: 0,
    max: 500,
    step: 1 
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