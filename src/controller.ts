import { ButtonApi, InputBindingApi, ListApi, MonitorBindingApi, Pane } from "tweakpane";
import * as TweakpaneWaveformPlugin from "tweakpane-plugin-waveform"; 
import { DOMSelectors, LocalStorageKeys } from "./constants";
import { Sorters } from "./index";
import { Model } from "./model";
import { ObservableArrayDriver, ObservableArrayStats } from "./observableArray/observableArrayDriver";
import { IStyleService } from "./styleService";

export default function useController(
  model: Model,
  styleService: IStyleService,
  observableArray: ObservableArrayDriver): IController {
  return new Controller(model, styleService,  observableArray)
}

interface IController {
  run(): void
}

class Controller {
  private readonly _model: Model;
  private readonly _styleService: IStyleService;
  private readonly _observableArray: ObservableArrayDriver;
  private readonly _pane: Pane;
  private _sourceArray: number[] = [];
  private _sorterPromise: Promise<void>;

  private _buttonGenerate: ButtonApi;
  private _buttonSort: ButtonApi;
  private _buttonCancel: ButtonApi;
  private _listSorters: ListApi<any>;
  private _sliderDelay: InputBindingApi<unknown, any>;
  private _sliderArrSize: InputBindingApi<unknown, any>;

  private _sliderBarSpan: InputBindingApi<unknown, any>;
  private _selectorTransTime: InputBindingApi<unknown, any>;
  private _sliderCompareColorA: InputBindingApi<unknown, any>;
  private _sliderCompareColorB: InputBindingApi<unknown, any>;
  private _sliderReadColor: InputBindingApi<unknown, any>;
  private _sliderSwapColorA: InputBindingApi<unknown, any>;
  private _sliderSwapColorB: InputBindingApi<unknown, any>;
  private _sliderWriteColor: InputBindingApi<unknown, any>;

  private _sliderGain: InputBindingApi<unknown, any>;
  private _selectorReadSoundShape: InputBindingApi<unknown, any>;
  private _selectorWriteSoundShape: InputBindingApi<unknown, any>;

  private _monitorAudioWaveform : MonitorBindingApi<any>;
  
  private _monitorCurrentReads: MonitorBindingApi<any>;
  private _monitorCurrentWrites: MonitorBindingApi<any>;
  private _monitorCurrentComparisons: MonitorBindingApi<any>;
  private _monitorCurrentSwaps: MonitorBindingApi<any>;
  private _monitorCurrentAction: MonitorBindingApi<any>;

  private _buttonDefaultParams: ButtonApi;

  constructor(
    model: Model,
    styleService: IStyleService,
    observableArray: ObservableArrayDriver) {
    this._model = model;
    this._styleService = styleService;
    this._observableArray = observableArray;
    this._pane = new Pane({
      container: document.getElementById(DOMSelectors.controlsContainer),
    });
    this._pane.registerPlugin(TweakpaneWaveformPlugin)
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
      localStorage.removeItem(LocalStorageKeys.tweakpanePreset);
      window.location.reload();
    });

    this.configureGlobalEventListeners();
  }

  private configureGlobalEventListeners = (): void => {
    window.addEventListener("load", () => setTimeout(() => this._observableArray.visualizer.rebuildArray(this._sourceArray), 500));
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
      this._observableArray.visualizer.rebuildArray(this._sourceArray)
    });
  
    this._buttonSort = controlsFolder.addButton({ 
      title: "Sort" 
    })
  
    controlsFolder.addSeparator();
  
    this._buttonCancel = controlsFolder.addButton({ 
      title: "Reset" 
    }).on("click", async () => {
      if (this._model.abortController) {
        this._buttonCancel.disabled = true;
        this._model.abortController.abort();
        await this._sorterPromise
        this._model.abortController = null;
      }

      this._buttonCancel.disabled = false;

      this._observableArray.visualizer.rebuildArray(this._sourceArray)
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
      this._observableArray.visualizer.rebuildArray(this._sourceArray)
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

    this._sliderBarSpan = visualParamsTab.addInput(this._model, "barWidth", {
      label: "bar width",
      min: 0.1,
      max: 0.9,
      step: 0.05
    }).on('change', () => this._styleService.updateCssBarWidthRule('barWidth'))

    this._selectorTransTime = visualParamsTab.addInput(this._model, 'transitionTime', {
      label: 'transition time',
      options: {
        "Instant": 0,
        "Fast": 0.1,
        "Medium": 0.3,
        "Slow": 0.7,
        "🦥": 1.2
      },
    }).on('change', () => this._styleService.updateCssTimeRule('transitionTime'))

    this._sliderCompareColorA = visualParamsTab.addInput(this._model, 'compareColorA', {
      label: 'compare a',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('compareColorA'))
    
    this._sliderCompareColorB = visualParamsTab.addInput(this._model, 'compareColorB', {
      label: 'compare b',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('compareColorB'))

    this._sliderReadColor = visualParamsTab.addInput(this._model, 'readColor', {
      label: 'read',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('readColor'))

    this._sliderSwapColorA = visualParamsTab.addInput(this._model, 'swapColorA', {
      label: 'swap a',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('swapColorA'))

    this._sliderSwapColorB = visualParamsTab.addInput(this._model, 'swapColorB', {
      label: 'swap b',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('swapColorB'))

    this._sliderWriteColor = visualParamsTab.addInput(this._model, 'writeColor', {
      label: 'write',
      view: 'color',
    }).on('change', () => this._styleService.updateCssColorRule('writeColor'))
    

    this._sliderGain = audioParamsTab.addInput(this._model, 'gain', {
      min: 0.0,
      max: 0.5,
      step: 0.01,
    })

    this._selectorReadSoundShape = audioParamsTab.addInput(this._model, 'readSoundShape', {
      options: {
        "Sine": "sine",
        "Sawtooth": "sawtooth",
        "Square": "square",
        "Triangle": "triangle",
      },
    })

    this._selectorWriteSoundShape = audioParamsTab.addInput(this._model, 'writeSoundShape', {
      options: {
        "Sine": "sine",
        "Sawtooth": "sawtooth",
        "Square": "square",
        "Triangle": "triangle",
      },
    })

    this._monitorAudioWaveform = audioParamsTab.addMonitor(this._observableArray.audioPlayer, "waveFormValue", {
      type: "waveform",
      interval: 5,
      max: Math.pow(2, 8),
      min: 0,
    })
  }

  private configurePaneMonitorFolder = (): void => {
      const monitorFolder = this._pane.addFolder({
        title: "Monitor",
        expanded: true,
      })

      this._monitorCurrentAction = monitorFolder.addMonitor(this._observableArray.stats, 'action', {
        label: 'action',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._monitorCurrentReads = monitorFolder.addMonitor(this._observableArray.stats, 'reads', {
        label: 'reads',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._monitorCurrentWrites = monitorFolder.addMonitor(this._observableArray.stats, 'writes', {
        label: 'writes',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
    
      this._monitorCurrentComparisons = monitorFolder.addMonitor(this._observableArray.stats, 'comparisons', {
        label: 'comparisons',
        view: 'text',
        format: (v) => v.toFixed(0),
        interval: 10,
      });
      
      this._monitorCurrentSwaps = monitorFolder.addMonitor(this._observableArray.stats, 'swaps', {
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
      this._buttonDefaultParams.disabled = true;
      this._buttonCancel.title = "Cancel & Reset";
    };
  
    const afterSort = () => {
      this._sliderArrSize.disabled = false;
      this._buttonGenerate.disabled = false;
      this._buttonSort.disabled = false;
      this._listSorters.disabled = false;
      this._buttonDefaultParams.disabled = false;
      this._buttonCancel.title = "Reset";
    };

    this._buttonSort.on("click", async () => {
      beforeSort();
      this._observableArray.stats.reset();
      const sorter = Sorters[this._model.sorterName]
      this._model.abortController = new AbortController();

      try {
        // This will throw an error if the user cancels the sort
        this._sorterPromise = sorter.sort(this._observableArray)
      }
      catch (e) {
        // Ignore
      }
      finally {
        await this._sorterPromise;
        this._sorterPromise = Promise.resolve(null)
      };
      
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
        localStorage.setItem(LocalStorageKeys.tweakpanePreset, JSON.stringify(preset));
      }, 1000);
    });
  
    const preset = localStorage.getItem(LocalStorageKeys.tweakpanePreset);
    if (preset) {
      this._pane.importPreset(JSON.parse(preset));
    }
  }
}