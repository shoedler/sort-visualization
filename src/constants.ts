export const CSSColorRules = {
  compareColorA: "bar-compare-a",
  compareColorB: "bar-compare-b",
  swapColorA: "bar-swap-a",
  swapColorB: "bar-swap-b",
  readColor: "bar-read",
  writeColor: "bar-write",
}

export const CSSTimeRules = {
  transitionTime: "transition-time",
}

export const CSSRules = {
  barWidth: "bar-width",
  ...CSSTimeRules,
  ...CSSColorRules
}

export const DOMSelectors = {
  arrayContainer: "array-container",
  arrayVars: "array-vars",
  controlsContainer: "controls-container",
}

export const LocalStorageKeys = {
  tweakpanePreset: "tweakpanePreset",
}