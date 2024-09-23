# sort-visualization

A simple, zero-dependency[^1], HTML5 + Web Audio API-based visualiser for popular sorting algorithms.

![image](https://github.com/user-attachments/assets/ca28c174-b8dc-420e-9241-b58ce6c4e47a)

## Usage

> [!TIP]
> You can check out the [live demo](https://shoedler.github.io/) to see the app in action.

### Development

1. Run `npm ci` to install the dev dependencies.
2. Run `npm run start` to start the development server.

### Production

1. Run `npm ci` to install the dev dependencies.
2. Run `npm run build-prod` to build the app.

## Roadmap

- [ ] Fix redrawing issues of the Page. Sometimes array bars are not displayed (in the wrong spot) or bars are colored wrongly / keep the color from the array operations
- [ ] Check all `TODO (classification)` Comments - some situations in the sorting algos probably need additional functionality in `observableArray`. This is just to make sure the displayed "stats" are correct.

[^1]: Only [tweakpane](https://github.com/cocopon/tweakpane), to tweak parameters 😉
