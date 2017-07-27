'use strict'

const gulp = require('gulp');
const webpack = require('webpack');
const gutil = require('gulp-util');
const open = require('open');
const webpackDevServer = require('webpack-dev-server');
const path = require('path');
const del = require('del');
const babel = require('gulp-babel');
const config = require('./webpack.config');

const port = 3000;

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
      gutil.log('[webpack-dev-server]', gutil.colors.magenta(`http://localhost:${port}`)),
      gutil.log('[webpack-dev-server]', 'to stop service, press [Ctrl + C] ...');
      open(`http://localhost:${port}/demo/index.html`);
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
  }).listen(port, '127.0.0.1', (err) => {
    if (err) {
      throw new gutil.PluginError('webpack-dev-server', err);
    }
  })

  // compiler.run((err, stats) => {
  //   if(err) throw new gutil.PluginError("webpack:build-dev", err);
	// 	gutil.log("[webpack:build-dev]", stats.toString({
	// 		colors: true
	// 	}));
	// 	cb();
  // })
})

gulp.task('clean', (cb) => {
  // 删除 build 和 lib 文件夹中的内容
  del(['build', 'lib']).then(() => {
    cb();
  })
})

gulp.task('build:dist', ['clean'], (cb) => {
  const webpackConfig = config.prod();
  const compiler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      gutil.log(err);
    }

    gutil.log(stats.toString({
      color: true,
      chunks: false,
    }))
  })
  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      console.log(stats.toString({ color: true}));
    }
    cb & cb();
  })
})

gulp.task('build:lib', ['clean'], () => {
  gulp.src(['src/**/*.less', 'src/**/*.scss'], ['src/**/*.scssm'], ['src/**/*.lessm'], ['src/**/*.cssm'])
    .pipe(gulp.dest('lib'));
  
  return gulp.src('src/**/*.js?(x)')
    .pipe(babel({
      presets: ['es2015','react', 'stage-3']
    }))
    .pipe(gulp.dest('lib'));
})

gulp.task('build:demo', ['clean'], (cb) => {
  const webpackConfig = config.demo();

  const compiler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      gutil.log(err);
    }

    gutil.log(stats.toString({
      color: true,
      chunks: false,
    }))
  })

  compiler.plugin('done', (stats) => {
    if (stats.hasErrors()) {
      console.log(stats.toString({ color: true}));
    }
    cb & cb();
  })
})

gulp.task('default', ['start']);
gulp.task('build', ['build:dist', 'build:lib', 'build:demo'])