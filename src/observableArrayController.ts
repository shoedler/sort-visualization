import { ButtonApi, InputBindingApi, ListApi, MonitorBindingApi, Pane } from "tweakpane";
import { Sorters } from "./index";
import { Model } from "./model";
import { IObservableArray, IObservableArrayAudioPlayer, IObservableArrayVisualizer } from "./observableArray";

export default function useObservableArrayController(
  model: Model,
  visualizer: IObservableArrayVisualizer,
  observableArray: IObservableArray): IObservableArrayController {
  return new ObservableArrayController(model, visualizer, observableArray)
}

interface IObservableArrayController {
  run(): void
}

class ObservableArrayController {
  private readonly _model: Model
  private readonly _observableArray: IObservableArray
  private readonly _visualizer: IObservableArrayVisualizer
  private readonly _pane: Pane;
  private _abortController: AbortController
  private _sourceArray: number[] = [];

  private _buttonGenerate: ButtonApi;
  private _buttonSort: ButtonApi;
  private _buttonCancel: ButtonApi;
  private _listSorters: ListApi<any>;
  private _sliderDelay: InputBindingApi<unknown, any>
  private _sliderArrSize: InputBindingApi<unknown, any>
  private _sliderBarSpan: InputBindingApi<unknown, any>
  private _sliderTransTime: InputBindingApi<unknown, any>
  private _sliderCompareColorA: InputBindingApi<unknown, any>
  private _sliderCompareColorB: InputBindingApi<unknown, any>
  private _sliderReadColor: InputBindingApi<unknown, any>
  private _sliderSwapColorA: InputBindingApi<unknown, any>
  private _sliderSwapColorB: InputBindingApi<unknown, any>
  private _sliderWriteColor: InputBindingApi<unknown, any>
  private _textCurrentReads: MonitorBindingApi<any>
  private _textCurrentWrites: MonitorBindingApi<any>
  private _textCurrentComparisons: MonitorBindingApi<any>
  private _textCurrentSwaps: MonitorBindingApi<any>

  constructor(
    model: Model,
    visualizer: IObservableArrayVisualizer,
    observableArray: IObservableArray) {
    this._model = model;
    this._visualizer = visualizer;
    this._observableArray = observableArray;
    this._pane = new Pane({
      title: "Sorting Visualizer",
      container: this._visualizer.controlsContainer,
    });
  }

  public run = (): void => {
    this.configurePaneControlsFolder();
    this.configurePaneSimulationsFolder();
    this.configurePaneVisualAndAudioFolder();
    this.configurePaneMonitorFolder();
    this.configurePaneSortButton();
    this.configureSerialization();

    this.configureGlobalEventListeners();

    this._visualizer.rebuildArray(this._sourceArray);
  }

  private configureGlobalEventListeners = (): void => {
    window.addEventListener("resize", () => {
      this._visualizer.redrawArray();
    });
  }

  private randomArrayValue = (): number => Math.floor(Math.random() * 100) + 1

  private reshapeArray = (): void => {
    if (this._model.sourceArraySize < this._sourceArray.length) {
      this._sourceArray = this._sourceArray.slice(0, this._model.sourceArraySize);
    }
    else {
      while (this._sourceArray.length < this._model.sourceArraySize)
        this._sourceArray.push(this.randomArrayValue())
    }
  }

  private generateArray = (): number[] => {
    this._sourceArray = [];
    for (let i = 0; i < this._model.sourceArraySize; i++)
      this._sourceArray.push(this.randomArrayValue());

    this._sourceArray = this._sourceArray;

    return this._sourceArray;
  }


  private configurePaneControlsFolder = (): void => {
    const controlsFolder = this._pane.addFolder({
      title: "Controls",
      expanded: true,
    })
  
    this._buttonGenerate = controlsFolder.addButton({ 
      title: "Generate New Array" 
    })
    this._buttonGenerate.on("click", () => { 
      this.generateArray()
      this._visualizer.rebuildArray(this._sourceArray)
    });
  
    this._buttonSort = controlsFolder.addButton({ 
      title: "Sort" 
    })
  
    controlsFolder.addSeparator();
  
    this._buttonCancel = controlsFolder.addButton({ 
      title: "Reset" 
    })
    
    this._buttonCancel.on("click", () => {
      this._abortController.abort();
      this._buttonCancel.title = "Signaled..."
      this._buttonCancel.disabled = true;
      this._visualizer.rebuildArray(this._sourceArray)
    });

    // (this._buttonCancel.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.backgroundColor = "var(--color-pink)";
    // (this._buttonCancel.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.color = "var(--fg-color)";

    controlsFolder.addSeparator();
  
    this._listSorters = controlsFolder.addBlade({ 
      view: "list",
      label: "sorter",
      options: Object.entries(Sorters).map(e => { return { text: e[0], value: e[0] } }),
      value: this._model.sorterName 
    }) as ListApi<any>;
    this._listSorters.on("change", (ev) => {
        this._model.sorterName = ev.value;
    });
  }

  private configurePaneSimulationsFolder = (): void => {
    const simParamsFolder = this._pane.addFolder({
      title: "Simulation",
      expanded: true,
    })
  
    this._sliderDelay = simParamsFolder.addInput(this._model, "delay", {
      min: 0,
      max: 500,
      step: 5,
      value: 30,
    })
  
    this._sliderArrSize = simParamsFolder.addInput(this._model, "sourceArraySize", {
      label: "array size",
      min: 10,
      max: 100,
      step: 1 
    })
    this._sliderArrSize.on('change', ev => {
      this.reshapeArray();
      this._visualizer.rebuildArray(this._sourceArray)
    })
  }

  private configurePaneVisualAndAudioFolder = () => {
    const visualAndAudioParamsTab = this._pane.addTab({
      pages: [
        {title: 'Visuals'},
        {title: 'Audio'},
      ],
    })

    const visualParamsTab = visualAndAudioParamsTab.pages[0];
    const audioParamsTab = visualAndAudioParamsTab.pages[1];

    this._sliderBarSpan = visualParamsTab.addInput(this._model, "barSpanFactor", {
      label: "bar width",
      min: 0.1,
      max: 1,
      step: 0.1
    })  
    this._sliderBarSpan.on('change', () => this._visualizer.redrawArray())

    this._sliderTransTime = visualParamsTab.addInput(this._model, 'transitionTime', {
      label: 'transition time',
      min: 0,
      max: 0.3,
      step: 0.01,
      value: 0.1
    })

    this._sliderCompareColorA = visualParamsTab.addInput(this._model, 'barCompareColorA', {
      label: 'compare a',
      view: 'color',
    })
    
    this._sliderCompareColorB = visualParamsTab.addInput(this._model, 'barCompareColorB', {
      label: 'compare b',
      view: 'color',
    })

    this._sliderReadColor = visualParamsTab.addInput(this._model, 'barReadColor', {
      label: 'read',
      view: 'color',
    })

    this._sliderSwapColorA = visualParamsTab.addInput(this._model, 'barSwapColorA', {
      label: 'swap a',
      view: 'color',
    })

    this._sliderSwapColorB = visualParamsTab.addInput(this._model, 'barSwapColorB', {
      label: 'swap b',
      view: 'color',
    })

    this._sliderWriteColor = visualParamsTab.addInput(this._model, 'barWriteColor', {
      label: 'write',
      view: 'color',
    })
  }

  private configurePaneMonitorFolder = (): void => {
      const monitorFolder = this._pane.addFolder({
        title: "Monitor",
        expanded: true,
      })
    
      this._textCurrentReads = monitorFolder.addMonitor(this._model, 'currentReads', {
        label: 'reads',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._textCurrentWrites = monitorFolder.addMonitor(this._model, 'currentWrites', {
        label: 'writes',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._textCurrentComparisons = monitorFolder.addMonitor(this._model, 'currentComparisons', {
        label: 'comparisons',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
      
      this._textCurrentSwaps = monitorFolder.addMonitor(this._model, 'currentSwaps', {
        label: 'swaps',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
  }

  private configurePaneSortButton = (): void => {
    const beforeSort = () => {
      this._sliderArrSize.disabled = true;
      this._buttonGenerate.disabled = true;
      this._buttonSort.disabled = true;
      this._listSorters.disabled = true;
      // barSpanSlider.disabled = true;
      this._buttonCancel.title = "Cancel & Reset";
    };
  
    const afterSort = () => {
      this._sliderArrSize.disabled = false;
      this._buttonGenerate.disabled = false;
      this._buttonSort.disabled = false;
      this._listSorters.disabled = false;
      // barSpanSlider.disabled = false;
      this._buttonCancel.disabled = false;
      this._buttonCancel.title = "Reset";
    };

    this._buttonSort.on("click", async () => {
      beforeSort();
      const sorter = Sorters[this._model.sorterName]
      this._abortController = new AbortController()
      await sorter.sort(this._observableArray, this._abortController.signal)
      afterSort();
    });
  }

  private configureSerialization = (): void => {
    let timeout: NodeJS.Timeout = null;    
    this._pane.on('change', () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        const preset = this._pane.exportPreset();
        localStorage.setItem('preset', JSON.stringify(preset));
      }, 1000);
    });
  
    const preset = localStorage.getItem('preset');
    if (preset) {
      this._pane.importPreset(JSON.parse(preset));
    }
  }
}