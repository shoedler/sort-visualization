module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    path: `${__dirname}/dist_prod`,
    filename: 'bundle.js',
  }
};