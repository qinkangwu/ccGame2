var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var TerserPlugin = require('terser-webpack-plugin');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/')
var phaser = path.join(phaserModule, 'src/phaser.js')

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
  WEBGL_RENDERER: true, 
  CANVAS_RENDERER: true 
})

module.exports = {
  mode : 'production',
  entry: {
    app: [
      path.resolve(__dirname, 'src/main.ts')
    ],
    vendor: ['phaser']
  },
  output: {
    pathinfo: true,
    path:path.resolve(__dirname,'build'),
    filename:'[name].js',
    publicPath: './',
  },
  optimization: {
    splitChunks: {
        cacheGroups: {
            commons: {
                name: "commons",
                chunks: "initial",
                minChunks: 2
            }
        }
    },
    minimizer: [
      new TerserPlugin({
          cache: true, // 开启缓存
          parallel: true, // 支持多进程
          sourceMap: true, 
      }),
    ]
  },
  plugins: [
    definePlugin,
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['vendor', 'app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      hash: true
    }),
    new HardSourceWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: ['babel-loader', 'awesome-typescript-loader'],
        include: path.join(__dirname, 'src'),
      },
      { 
        test: [/\.vert$/, /\.frag$/], 
        use: 'raw-loader' 
      }
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  resolve: {
    extensions: ['.ts', '.js','.css'],
    alias: {
      'phaser': phaser
    }
  }
}