const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './frontend/src/index.js',
    target: 'electron-renderer',
    devtool: isDevelopment ? 'source-map' : false,
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'bundle.[contenthash].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'frontend/src'),
        '@components': path.resolve(__dirname, 'frontend/src/components'),
        '@hooks': path.resolve(__dirname, 'frontend/src/hooks'),
        '@store': path.resolve(__dirname, 'frontend/src/store'),
        '@services': path.resolve(__dirname, 'frontend/src/services'),
        '@utils': path.resolve(__dirname, 'frontend/src/utils')
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './frontend/public/index.html',
        filename: 'index.html',
        favicon: './frontend/public/favicon.ico'
      })
    ],
    devServer: {
      port: 3000,
      hot: true,
      static: {
        directory: path.join(__dirname, 'frontend/public')
      },
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  };
};