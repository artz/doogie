var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var git = require('git-rev');
var replace = require('gulp-replace');
var livereload = require('gulp-livereload');
var svgmin = require('gulp-svgmin');

var paths = {
	sass: './client/scss/**/*.scss',
	svg: './design/**/*.svg',
	libJS: [
		'./node_modules/jquery/dist/jquery.js',
		'./widget/jquery.timeago.js',
		'./widget/jquery.sparkline.js',
		'./widget/jquery.doogieboard.js',
		'./node_modules/angular/angular.js',
		'./node_modules/angular-sanitize/angular-sanitize.js',
		'./node_modules/angular-resource/angular-resource.js',
		'./node_modules/angular-route/angular-route.js'
	],
	libCSS: [
		'./widget/jquery.doogieboard.css',
		'./node_modules/bootstrap/dist/css/bootstrap.css'
	],
	scripts: [
		'./client/scripts/**/*.js'
	],
	templates: './client/templates/**/*.html'
 };

gulp.task('templates', function () {
	gulp.src(paths.templates)
		.pipe(templateCache({
			module: 'doogie.templates',
			standalone: true,
			root: 'templates/'
		}))
		.pipe(gulp.dest('./client/scripts/templates'));
 });



gulp.task('libJS', function () {
	gulp.src(paths.libJS)
		.pipe(sourcemaps.init())
		.pipe(concat('lib.js'))
		.pipe(ngAnnotate({ add: true, single_quotes: true }))
		.on('error', function (err) {
			console.error(err.toString());
			this.emit('end');
		})
		.pipe(gulp.dest('./client/www/js/'))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./client/www/js/'));
});

gulp.task('scripts', function () {
	gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		.pipe(concat('doogie.js'))
		.pipe(ngAnnotate({ add: true, single_quotes: true }))
		.on('error', function (err) {
			console.error(err.toString());
			this.emit('end');
		})
		.pipe(gulp.dest('./client/www/js/'))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./client/www/js/'));
 });

gulp.task('libCSS', function () {
	gulp.src(paths.libCSS)
		.pipe(concat('lib.css'))
		.pipe(gulp.dest('./client/www/css/'))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(minifyCss())
		.pipe(gulp.dest('./client/www/css/'));
});

gulp.task('sass', function () {
	gulp.src('./client/scss/doogie.scss')
		.pipe(sass({
			errLogToConsole: true
 		}))
		.pipe(gulp.dest('./client/www/css/'))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(minifyCss())
		.pipe(gulp.dest('./client/www/css/'));
});

gulp.task('widgetCSS', function () {
	return gulp.src('./widget/**.css')
		.pipe(gulp.dest('./client/www/widget/'))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(minifyCss())
		.pipe(gulp.dest('./client/www/widget/'));
});

gulp.task('widgetJS', function () {
	return gulp.src('./widget/**.js')
		.pipe(sourcemaps.init())
		.pipe(gulp.dest('./client/www/widget/'))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./client/www/widget/'));
});

gulp.task('svg', function () {
	return gulp.src(paths.svg)
		.pipe(svgmin())
		.pipe(gulp.dest('./client/www/svg/'));
});

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch(paths.svg, ['svg']);
	gulp.watch(paths.sass, ['sass']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.libJS, ['libJS']);
	gulp.watch(paths.libCSS, ['libCSS']);
	gulp.watch(paths.templates, ['templates']);
	gulp.watch('./client/www/**').on('change', livereload.changed);
 });

// TODO: https://www.npmjs.org/package/gulp-rev
// TODO: https://github.com/jonkemp/gulp-useref
// TODO: https://github.com/jamesknelson/gulp-rev-replace
gulp.task('rev', function () {
	git.short(function (rev) {
		gulp.src('./client/www/index.html')
			.pipe(replace(/\?v=[^"]+/g, '?v=' + rev))
			.pipe(gulp.dest('./client/www/'));
	});
});

gulp.task('default', ['templates', 'sass', 'svg', 'libJS', 'libCSS', 'widgetJS', 'widgetCSS', 'scripts', 'rev']);
