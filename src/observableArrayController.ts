import { ButtonApi, InputBindingApi, ListApi, MonitorBindingApi, Pane } from "tweakpane";
import { Sorters } from "./index";
import { Model } from "./model";
import { IObservableArray, ObservableArrayStats } from "./observableArray";
import { IObservableArrayVisualizer } from "./observableArrayVisualizer";

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
  private readonly _model: Model;
  private readonly _observableArray: IObservableArray;
  private readonly _visualizer: IObservableArrayVisualizer;
  private readonly _pane: Pane;
  private _abortController: AbortController;
  private _sourceArray: number[] = [];
  private _sorterPromise: Promise<ObservableArrayStats>;

  private _buttonGenerate: ButtonApi;
  private _buttonSort: ButtonApi;
  private _buttonCancel: ButtonApi;
  private _listSorters: ListApi<any>;
  private _sliderDelay: InputBindingApi<unknown, any>;
  private _sliderArrSize: InputBindingApi<unknown, any>;

  private _sliderBarSpan: InputBindingApi<unknown, any>;
  private _sliderTransTime: InputBindingApi<unknown, any>;
  private _sliderCompareColorA: InputBindingApi<unknown, any>;
  private _sliderCompareColorB: InputBindingApi<unknown, any>;
  private _sliderReadColor: InputBindingApi<unknown, any>;
  private _sliderSwapColorA: InputBindingApi<unknown, any>;
  private _sliderSwapColorB: InputBindingApi<unknown, any>;
  private _sliderWriteColor: InputBindingApi<unknown, any>;

  private _sliderGain: InputBindingApi<unknown, any>;
  
  private _textCurrentReads: MonitorBindingApi<any>;
  private _textCurrentWrites: MonitorBindingApi<any>;
  private _textCurrentComparisons: MonitorBindingApi<any>;
  private _textCurrentSwaps: MonitorBindingApi<any>;

  private _buttonDefaultParams: ButtonApi;

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
    this._buttonDefaultParams = this._pane.addButton({
      title: "Restore",
      label: "default values"
    }).on("click", () => { 
      localStorage.removeItem('preset');
      window.location.reload();
    });

    this.configureGlobalEventListeners();
  }

  private configureGlobalEventListeners = (): void => {
    window.addEventListener("resize", () => this._visualizer.redrawArray());
    window.addEventListener("load", () => setTimeout(() => this._visualizer.rebuildArray(this._sourceArray), 500));
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
    }).on("click", () => { 
      this.generateArray()
      this._visualizer.rebuildArray(this._sourceArray)
    });
  
    this._buttonSort = controlsFolder.addButton({ 
      title: "Sort" 
    })
  
    controlsFolder.addSeparator();
  
    this._buttonCancel = controlsFolder.addButton({ 
      title: "Reset" 
    }).on("click", async () => {
      if (this._abortController) {
        this._abortController.abort();
        this._buttonCancel.title = "Signaled..."
        this._buttonCancel.disabled = true;
        await this._sorterPromise
      }
      this._visualizer.rebuildArray(this._sourceArray)
    });

    // (this._buttonCancel.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.backgroundColor = "var(--color-pink)";
    // (this._buttonCancel.element.children.item(1).children.item(0).children.item(0) as HTMLElement).style.color = "var(--fg-color)";

    controlsFolder.addSeparator();
  
    this._listSorters = (controlsFolder.addBlade({ 
      view: "list",
      label: "sorter",
      options: Object.entries(Sorters).map(e => { return { text: e[0], value: e[0] } }),
      value: this._model.sorterName 
    }) as ListApi<any>).on("change", (ev) => {
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
      step: 1,
    }).on('change', ev => {
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
      step: 0.05
    }).on('change', () => this._visualizer.redrawArray())

    this._sliderTransTime = visualParamsTab.addInput(this._model, 'transitionTime', {
      label: 'transition time',
      min: 0,
      max: 0.3,
      step: 0.01,
      value: 0.1
    }).on('change', () => this._visualizer.updateCssRule('transitionTime'))

    this._sliderCompareColorA = visualParamsTab.addInput(this._model, 'compareColorA', {
      label: 'compare a',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('compareColorA'))
    
    this._sliderCompareColorB = visualParamsTab.addInput(this._model, 'compareColorB', {
      label: 'compare b',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('compareColorB'))

    this._sliderReadColor = visualParamsTab.addInput(this._model, 'readColor', {
      label: 'read',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('readColor'))

    this._sliderSwapColorA = visualParamsTab.addInput(this._model, 'swapColorA', {
      label: 'swap a',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('swapColorA'))

    this._sliderSwapColorB = visualParamsTab.addInput(this._model, 'swapColorB', {
      label: 'swap b',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('swapColorB'))

    this._sliderWriteColor = visualParamsTab.addInput(this._model, 'writeColor', {
      label: 'write',
      view: 'color',
    }).on('change', () => this._visualizer.updateCssRule('writeColor'))
    
    this._sliderGain = audioParamsTab.addInput(this._model, 'gain', {
      min: 0.0,
      max: 0.5,
      step: 0.01,
    })
  }

  private configurePaneMonitorFolder = (): void => {
      const monitorFolder = this._pane.addFolder({
        title: "Monitor",
        expanded: true,
      })
    
      this._textCurrentReads = monitorFolder.addMonitor(this._observableArray.stats, 'reads', {
        label: 'reads',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._textCurrentWrites = monitorFolder.addMonitor(this._observableArray.stats, 'writes', {
        label: 'writes',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._textCurrentComparisons = monitorFolder.addMonitor(this._observableArray.stats, 'comparisons', {
        label: 'comparisons',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
      
      this._textCurrentSwaps = monitorFolder.addMonitor(this._observableArray.stats, 'swaps', {
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
      this._buttonDefaultParams.disabled = true;
      this._buttonCancel.title = "Cancel & Reset";
    };
  
    const afterSort = () => {
      this._sliderArrSize.disabled = false;
      this._buttonGenerate.disabled = false;
      this._buttonSort.disabled = false;
      this._listSorters.disabled = false;
      // barSpanSlider.disabled = false;
      this._buttonCancel.disabled = false;
      this._buttonDefaultParams.disabled = false;
      this._buttonCancel.title = "Reset";
    };

    this._buttonSort.on("click", async () => {
      beforeSort();
      this._observableArray.stats.reset();
      const sorter = Sorters[this._model.sorterName]
      this._abortController = new AbortController()
      this._sorterPromise = sorter.sort(this._observableArray, this._abortController.signal)
      await this._sorterPromise;
      this._abortController = null;
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