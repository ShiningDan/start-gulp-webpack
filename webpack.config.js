'use strict'

const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const glob = require('glob');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const componentName = 'DataMap';
const srcPath = path.resolve(__dirname, './src');
const demoPath = path.resolve(__dirname, './demo');
const buildPath = path.resolve(__dirname, './build');

const port = 3000;

const config = {
  // The base directory (absolute path!) for resolving the entry option.
  context: srcPath,

  entry: {
    index: './index.jsx',
  },

  output: {
    path: buildPath,
    filename: '[name].js',
    publicPath: '/build/'
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }, {
      test: /\.css$/,
			loader: "style-loader!css-loader"
    }],
  },

  plugins: [

    //允许错误不打断程序
    new webpack.NoEmitOnErrorsPlugin(),
    //根据模块调用次数，给模块分配ids，常被调用的ids分配更短的id，使得ids可预测，降低文件大小
    new webpack.optimize.OccurrenceOrderPlugin(),
    //进度插件
    new webpack.ProgressPlugin((percentage, msg) => {
      const stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(`${msg}`);
        stream.clearLine(1);
      }
    })
  ]
};

// 获取 demo 文件夹中的入口文件
const getDevEntry = (cwd) => {
  const entry = {};
  // node的glob模块允许你使用 *等符号, 来写一个glob规则,像在shell里一样,获取匹配对应规则的文件.
  glob.sync('*.jsx', { cwd } ).forEach((item) => {
    const file = item.replace('.jsx', '');
    // entry[file] = `./${item}`;
    entry[file] = [
      `webpack-dev-server/client?http://0.0.0.0:${port}`, 
      `webpack/hot/only-dev-server`,
      // `${file}.scss`,
      `./${item}`
    ]
  });
  return entry;
}

// 开发环境及 demo 编译时的配置
const dev = () => {
  const _config = _.cloneDeep(config);
  _config.context = demoPath;
  _config.output = {
    path: demoPath,
    filename: '[name].js',
    publicPath: '/demo/',
  };

  _config.plugins.push(
    //这个插件用来定义全局变量，在webpack打包的时候会对这些变量做替换。
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV : JSON.stringify('development')},
      __DEV__ : JSON.stringify(JSON.parse('true')),
    }),

    // 代码热替换
    new webpack.HotModuleReplacementPlugin(),
    // 不把 css 文件以 style 的形式内嵌到JS中，而是导出每个 css 文件
    new ExtractTextPlugin('[name].css', { allChunks: true })
  );

  // 添加 source-map 方便对于打包之后的文件调试的时候，找到源文件对应关系
  _config.devtool = 'source-map';
  // 更新入口文件
  _config.entry = getDevEntry(demoPath);
  
  return _config;
}

// 编译到 demo 文件夹的配置，与 dev 的区别是不需要调试相关的配置
const demo = () => {
  const _config = _.cloneDeep(config);
  _config.context = demoPath;
  _config.output = {
    path: demoPath,
    filename: '[name].js',
    publicPath: '/demo/',
  };

  _config.plugins.push(
    //这个插件用来定义全局变量，在webpack打包的时候会对这些变量做替换。
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV : JSON.stringify('production')},
      __DEV__ : JSON.stringify(JSON.parse('false')),
    }),

    // 有些JS库有自己的依赖树，并且这些库可能有交叉的依赖，DedupePlugin可以找出他们并删除重复的依赖。
    // DedupePlugin() 在 webpack 2 中已经废弃
    // new webpack.optimize.DedupePlugin(),
    // 不把 css 文件以 style 的形式内嵌到JS中，而是导出每个 css 文件
    new ExtractTextPlugin('[name].css', { allChunks: true })
  );

  // 更新入口文件
  _config.entry = getDevEntry(demoPath);
  
  for (const i in _config.entry) {
    _config.entry[i] = _config.entry[i].slice(2);
  }
  return _config;
}

// 发布到 cdn 以及 tnpm 时的配置
const prod = () => {
  const _config = _.cloneDeep(config);
  
  // build 环境
  _config.plugins.push(
    //这个插件用来定义全局变量，在webpack打包的时候会对这些变量做替换。
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV : JSON.stringify('production')},
      __DEV__ : JSON.stringify(JSON.parse('false')),
    }),

    // 有些JS库有自己的依赖树，并且这些库可能有交叉的依赖，DedupePlugin可以找出他们并删除重复的依赖。
    // DedupePlugin() 在 webpack 2 中已经废弃
    // new webpack.optimize.DedupePlugin(),
    
    // 不把 css 文件以 style 的形式内嵌到JS中，而是导出每个 css 文件
    new ExtractTextPlugin('[name].css', { allChunks: true }),

    // 压缩代码
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: { warnings: false },
      output: { comments: false}
    })
  );

  return _config;
}

module.exports = { dev, demo, prod }