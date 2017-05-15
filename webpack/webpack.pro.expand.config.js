//commonjs中require一个模块就会执行，但是webpack是不一样的，仅仅是打包
const path = require('path');
const webpack = require("webpack");
const CleanPlugin = require('clean-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
//通过这个插件可以在webpack打包之前删除某些目录中的文件
//strip-loader是一个webpack-loader，用于从你打包的代码中移除一些函数。特别是那些你开发环境中需要的函数，但是在生产模式下
//不需要的这些函数
const BabelConfigQuery = require("webpackcc/lib/getBabelDefaultConfig");
const projectRootPath = path.resolve(__dirname, '../');
const assetsPath = path.resolve(projectRootPath, './static/dist');
// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack-isomorphic-tools-config'));
//此时资源会真实的打包到目录下，而不是内存中~~~
module.exports = {
    // devtool: "source-map",
    entry: {
    'main': [
      'bootstrap-webpack!./src/theme/bootstrap.config.prod.js',
      // 'font-awesome-webpack!./src/theme/font-awesome.config.prod.js',
      './src/client.js'
    ]
  }, 
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/dist/'
  },
  module:{
    rules:[
        { test: webpackIsomorphicToolsPlugin.regular_expression('images'), loader: 'url-loader?limit=10240' },
        { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=application/octet-stream" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=10000&mimetype=image/svg+xml" },
        {
            test: /\.jsx$/,
            exclude :path.resolve("node_modules"),
            // 这里不能使用path.resolve("node_modules")否则webpack-merge会出现两次通过
            // babel处理的情况，是webpack-merge的bug
            // https://github.com/survivejs/webpack-merge/issues/75
            use: [
            {
                loader:require.resolve('strip-loader'),
                options:{
                  strip:["debug","console.log"]
                }
            },
             {
              loader:require.resolve('babel-loader'),
              options:BabelConfigQuery.getDefaultBabel ()
            }]
          },
            {
            test: /\.js$/,
            exclude :path.resolve("node_modules"),
            // 这里不能使用path.resolve("node_modules")否则webpack-merge会出现两次通过
            // babel处理的情况，是webpack-merge的bug
            // https://github.com/survivejs/webpack-merge/issues/75
            use: [
             {
                loader:require.resolve('strip-loader'),
                options:{
                  strip:["debug","console.log"]
                }
             },
            {
              loader:require.resolve('babel-loader'),
              options:BabelConfigQuery.getDefaultBabel ()
            }]
          }
    ]
  },
//extract-text-plugin在pro模式下默认会添加
 plugins: [
   // new ExtractTextPlugin({ filename: 'css/[name].css', disable: false, allChunks: true }),
   new CleanPlugin([assetsPath], { root: projectRootPath }),
   //指定需要清除的路径以及root配置
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: false,
      __DEVTOOLS__: false
    }),
    // ignore dev config
    new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),
    webpackIsomorphicToolsPlugin
  ]
}
