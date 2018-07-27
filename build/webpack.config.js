const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const portfinder = require('portfinder')
const isDev = process.env.NODE_ENV === "dev"
/**基本参数*/
const base = require('./base')
/**基本配置*/
let config = {
  context: path.resolve(__dirname, '../'),
  entry: {
    client: "./src/client.ts",
    "demo/demo": "./demo/demo.ts"
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
    publicPath: base.publicPath,
    chunkFilename: path.join('js/[id].[chunkhash].js'),
    library: "babylonjsMaterialEditor",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: ['ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  externals: {
    "babylonjs": "BABYLON"
  },
  module: {
    rules: [
      {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      {test: /\.ts$/, loader: "ts-loader"},
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
        test: /\.less/,
        use: ["style-loader", "css-loader", "postcss-loader", "less-loader"]
      },
      {test: /\.html$/, loader: "text-loader"},
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/, use: [
          {
            loader: 'url-loader',
            options: {
              limit: base.urlLimit,
              name: path.join('img/[name].[hash:7].[ext]')
            }
          },
          {
            loader: 'image-webpack-loader',
            options: base.imgCompress,
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: base.urlLimit,
          name: path.join('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: base.urlLimit,
          name: path.join('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../demo/template.html'),
      filename: "demo.html"
    })
  ]
}
/**开发环境*/
if (isDev) {
  config.devtool = 'eval-source-map'
  config.devServer = {
    hot: true,
    quiet: true,
    host: base.host,
    port: base.port,
    overlay: {
      warnings: false,
      errors: true
    },
    watchOptions: {
      poll: false,
    }
  }
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  )
  module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.devServer.port
    portfinder.getPort((err, port) => {
      if (err) {
        reject(err)
      } else {
        process.env.PORT = port
        config.devServer.port = port
        config.plugins.push(new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [`Your application is running here: http://${config.devServer.host}:${port}`],
          }
        }))
        resolve(config)
      }
    })
  })
}
/**生产环境*/
else {
  config.plugins.push(
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: base.compress
      }
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../', base.copyDir),
      to: base.copyDir,
      ignore: ['.*']
    }
    ]),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../src/server.js'),
      to: ""
    }
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: "common",
      minChunks: 2,
      minSize: 1
    }))
  module.exports = config;
}
