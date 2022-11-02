module.exports = {
  entry: './build/index.js',
  devtool: "inline-source-map",
  mode: 'development',
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle.js',
  },
};