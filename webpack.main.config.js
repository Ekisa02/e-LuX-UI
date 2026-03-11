const path = require('path');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './electron/main.js',
    target: 'electron-main',
    devtool: isDevelopment ? 'source-map' : false,
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'main.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js']
    },
    externals: {
      'electron-log': 'commonjs electron-log',
      'electron-store': 'commonjs electron-store',
      'sqlite3': 'commonjs sqlite3',
      'systeminformation': 'commonjs systeminformation',
      'node-pcap': 'commonjs node-pcap',
      'face-api.js': 'commonjs face-api.js'
    }
  };
};