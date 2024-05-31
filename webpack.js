const path = require('path');

module.exports = {
  mode: 'development', // Set mode to 'development' or 'production' as needed
  entry: './src/index.js', // Adjust this as per your entry file location
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "url": require.resolve("url/"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false // Node.js 'fs' module is not available in the browser
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // This regex matches both .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    static: path.resolve(__dirname, 'public'),
    compress: true,
    port: 9000
  }
};
