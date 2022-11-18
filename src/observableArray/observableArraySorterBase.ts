import { IObservableArray, IObservableArraySorter, ObservableArrayAbortError } from "./observableArrayDriver";
import { DOMSelectors } from "../constants";

export type Lookup = { [key: string]: number | string | boolean | number[] };

export abstract class ObservableArraySorterBase implements IObservableArraySorter {
  private createValue = (value: Lookup[keyof Lookup]): HTMLSpanElement[] => {
    if (Array.isArray(value)) {
      const bracketOpen = document.createElement("span");
      bracketOpen.className = "punctuation-bracket";
      bracketOpen.innerText = "[";
      const bracketClose = document.createElement("span");
      bracketClose.className = "punctuation-bracket";
      bracketClose.innerText = "]";

      const values = value.map(v => {
        const valueSpan = this.createValue(v)[0];
        const commaSpan = document.createElement("span");
        commaSpan.className = "punctuation";
        commaSpan.innerText = ", ";
        return [valueSpan, commaSpan];
      }).flat();

      if (values.length)
        values.pop(); // Remove trailing comma
            
      return [bracketOpen, ...values, bracketClose];
    }
    else if (typeof value === "string") {
      const span = document.createElement("span");
      span.className = "string-literal";
      span.innerText = '"' + value + '"';
      return [span];
    }
    else if (typeof value === "number") {
      const span = document.createElement("span");
      span.className = "numeric-literal";
      span.innerText = value.toString();
      return [span];
    }
    else if (typeof value === "boolean") {
      const span = document.createElement("span");
      span.className = "boolean-literal";
      span.innerText = value.toString();
      return [span];
    }
    throw new Error(`Unknown value type: ${typeof value}`);
  }

  private createOrUpdateProp = (container: HTMLElement, prop: string, value: Lookup[keyof Lookup]) => {
    const propId = DOMSelectors.arrayVars + `-${prop}`
    let propElement = document.getElementById(propId)

    if (!propElement) {
      propElement = document.createElement('div');
      propElement.id = propId;
      container.append(propElement);
    }
    else {
      propElement.innerHTML = "";
    }

    const code = document.createElement('pre');
    code.className = 'code';

    const propPrefix = document.createElement("span");
    propPrefix.className = "var-keyword";
    propPrefix.innerText = "var ";

    const equalSign = document.createElement("span");
    equalSign.className = "punctuation";
    equalSign.innerText = " = ";

    const propNameSpan = document.createElement("span");
    propNameSpan.className = "var-name";
    propNameSpan.innerText = prop;

    const propValue = this.createValue(value);

    code.append(propPrefix, propNameSpan, equalSign, ...propValue);

    propElement.append(code);
  }

  private removeProp = (prop: string) => {
    const propId = DOMSelectors.arrayVars + `-${prop}`
    const propElement = document.getElementById(propId)
    if (propElement) {
      propElement.remove();
    }
  }

  protected abstract _sort(array: IObservableArray, vars: Lookup): Promise<void>;
  public sort = async (array: IObservableArray): Promise<void> => {
    // TODO: Move this code to visualizer (incl. helper methods)
    const arrayVarsContainer = document.getElementById(DOMSelectors.arrayVars);
    arrayVarsContainer.replaceChildren(...[]);

    try {
      const proxy = new Proxy({} as Lookup, {
        get: (target: Lookup, prop: string) => {
          this.createOrUpdateProp(arrayVarsContainer, prop, target[prop]);
          return target[prop];
        },
        set: (target: Lookup, prop: string, value: Lookup[keyof Lookup]) => {
          this.createOrUpdateProp(arrayVarsContainer, prop, value);         
          target[prop] = value;
          return true;
        },
        deleteProperty: (target: Lookup, prop: string | symbol): boolean => {
          if (prop in target) {
            delete target[prop as string];
            this.removeProp(prop as string);
            return true;
          }
          return false;
        }
      });

      await this._sort(array, proxy);
    }
    catch (e: unknown) {
      if (e instanceof ObservableArrayAbortError) {
        return null;
      }
      throw e;
    }
  };
}
