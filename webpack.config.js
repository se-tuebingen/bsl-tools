const path = require('path');

module.exports = {
  watch: true,
  entry: './src/bsl_tools.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css?$/,
        use: 'raw-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bsl_tools.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production'
};
