const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'popup.js',
    path: path.resolve(__dirname, '.'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'production', // Change this to 'production'
  devtool: 'cheap-source-map', // Add this line for source maps without using eval
};