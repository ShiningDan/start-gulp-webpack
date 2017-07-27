'use strict'

const gulp = require('gulp');
const webpack = require('webpack');
const gutil = require('gulp-util');
const open = require('open');
const webpackDevServer = require('webpack-dev-server');
const path = require('path');
const config = require('./webpack.config');

gulp.task('start', (cb) => {
  let buildFirstTime = true;
  const webpackConfig = config.dev();
  const compiler = webpack(webpackConfig);

  compiler.plugin('done', (stats) => {
    if(stats.hasErrors()) {
      console.log(stats.toString({ color: true}));
    }
    // 只有在第一次启动 start 的时候才执行
    if (buildFirstTime) {
      buildFirstTime = false;
      cb & cb();
      //gutil.log() 的结果会自动带上时间前缀。另外，它还支持颜色
      gutil.log('[webpack-dev-server]', gutil.colors.magenta('http://localhost:3000')),
      gutil.log('[webpack-dev-server]', 'to stop service, press [Ctrl + C] ...');
      open('http://localhost:3000/demo/index.html');
    }
  })

  new webpackDevServer(compiler, {
    // adds the HotModuleReplacementPlugin and switch the server to hot mode
    hot: true,
    // 设置 inline 刷新模式，将webpack-dev-server客户端加入到webpack入口文件的配置中。
    inline: true,
    // don’t output anything to the console.
    quiet: true,
    publicPath: webpackConfig.output.publicPath,
    // 允许跨域
    headers: {'Access-Control-Allow-Origin': '*'},
    contentBase: path.resolve(__dirname, './'),
  }).listen(3000, '127.0.0.1', (err) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  })
  
})

gulp.task('default', ['start']);