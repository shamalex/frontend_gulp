'use strict';

var gulp = require('gulp'),
    image = require('gulp-image'),
    autoprefixer = require('gulp-autoprefixer'),
    preprocess = require('gulp-preprocess'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    env = require('gulp-env'),
    minifyCSS = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    copy = require('gulp-copy'),
    concat = require('gulp-concat'),
    pxtorem = require('gulp-pxtorem');

/* TODO: вынести конфигурацию в отдельный файл */
var params = {
    build: {
        dev: {
            html: 'build/dev/',
            js: 'build/dev/js/',
            css: 'build/dev/css/',
            img: 'build/dev/img/',
            fonts: 'build/dev/fonts/',
            copy: {
                'bower_components/normalize.css/normalize.css' : 'build/dev/css',
                'bower_components/jquery/dist/jquery.js' : {'build/dev/js': 'jquery.js'}
            },
            settings: {
                NODE_ENV: 'dev'
                // preprocess settings
            }
        },
        prod: {
            html: 'build/prod/',
            js: 'build/prod/js/',
            css: 'build/prod/css/',
            img: 'build/prod/img/',
            fonts: 'build/dev/fonts/',
            copy: {
                'bower_components/jquery/dist/jquery.min.js' : 'build/prod/js'
            },
            settings: {
                NODE_ENV: 'prod'
                // preprocess settings
            },
            joinCss: {
                'build/dev/css/{styles,normalize}.css': {'build/prod/css/' : 'styles.min.css'}
            },
            joinJs: {
                'build/dev/js/app.js': {'build/prod/js/' : 'app.min.js'}
            }
        }
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/app.js',
        coffee: 'src/coffee/app-coffee.coffee',
        fonts: 'src/fonts/**/*.*',
        style: 'src/less/build.less',
        //style: 'src/scss/build.scss',
        img: 'src/img/**/*.+(jpg|jpeg|gif|png|svg|ico)'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        coffee: 'src/coffee/**/*.coffee',
        fonts: 'src/fonts/**/*.*',
        style: 'src/less/**/*.less',
        //style: 'src/scss/**/*.scss',
        img: 'src/img/**/*.+(jpg|jpeg|gif|png|svg|ico)'
    }
};




// Сборка html файлов

gulp.task('html-dev:build', function () {
    return gulp.src(params.src.html)
        .pipe(preprocess({context: params.build.dev.settings}))
        .pipe(gulp.dest(params.build.dev.html));
});

gulp.task('html-prod:build', function () {
    return gulp.src(params.src.html)
        .pipe(preprocess({context: params.build.prod.settings}))
        .pipe(gulp.dest(params.build.prod.html));
});

// Сборка шрифтов

gulp.task('fonts-dev:build', function () {
    return gulp.src(params.src.fonts)
        .pipe(preprocess({context: params.build.dev.settings}))
        .pipe(gulp.dest(params.build.dev.fonts));
});

gulp.task('fonts-prod:build', function () {
    return gulp.src(params.src.fonts)
        .pipe(preprocess({context: params.build.prod.settings}))
        .pipe(gulp.dest(params.build.prod.fonts));
});

//-------------


// Сборка less файлов
gulp.task('styles-dev:build', function () {
    return gulp.src(params.src.style)
        .pipe(less())
        //.pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 55 versions'],
            cascade: false
        }))
        .pipe(pxtorem({replace: false}))
        .pipe(rename("styles.css"))
        .pipe(gulp.dest(params.build.dev.css));
});

gulp.task('styles-prod:build', ['styles-dev:build'], function () {
    return function() {
        for (var p in params.build.prod.joinCss) {
            for (var _p in params.build.prod.joinCss[p]) {
                gulp.src(p)
                    .pipe(minifyCSS())
                    .pipe(concat(params.build.prod.joinCss[p][_p]))
                    .pipe(gulp.dest(_p));
            }
        }
    }();
});

//-------------


// Сборка js файлов

gulp.task('coffee-dev:build', function() {
    return gulp.src(params.src.coffee)
        .pipe(coffee({bare: true}))
        .pipe(gulp.dest(params.build.dev.js));
});

gulp.task('js-dev:build', function () {
    return gulp.src(params.src.js)
        .pipe(gulp.dest(params.build.dev.js));
});

gulp.task('js-prod:build', function () {
    return function() {
        for (var p in params.build.prod.joinJs) {
            for (var _p in params.build.prod.joinJs[p]) {
                gulp.src(p)
                    .pipe(uglify())
                    .pipe(concat(params.build.prod.joinJs[p][_p]))
                    .pipe(gulp.dest(_p));
            }
        }
    }();
});

//-------------


// Копирование файлов

gulp.task('copy-dev:build', function () {
    return function() {
        for (var p in params.build.dev.copy) {
            if (typeof params.build.dev.copy[p] === 'object') {
                for (var _p in params.build.dev.copy[p]) {
                    gulp.src(p)
                        .pipe(rename(params.build.dev.copy[p][_p]))
                        .pipe(gulp.dest(_p));
                }
            } else {
                gulp.src(p).pipe(gulp.dest(params.build.dev.copy[p]));
            }
        }
    }();
});

gulp.task('copy-prod:build', function () {
    return function() {
        for (var p in params.build.prod.copy) {
            if (typeof params.build.prod.copy[p] === 'object') {
                for (var _p in params.build.prod.copy[p]) {
                    gulp.src(p)
                        .pipe(rename(params.build.prod.copy[p][_p]))
                        .pipe(gulp.dest(_p));
                }
            } else {
                gulp.src(p).pipe(gulp.dest(params.build.prod.copy[p]));
            }
        }
    }();
});

//-------------


// Обработка изображений

gulp.task('image-dev:build', function () {
    return gulp.src(params.src.img)
        .pipe(gulp.dest(params.build.dev.img));
});

gulp.task('image-prod:build', function () {
    return gulp.src(params.src.img)
        .pipe(image({
            pngquant: true,
            optipng: false,
            zopflipng: true,
            advpng: true,
            jpegRecompress: false,
            jpegoptim: true,
            mozjpeg: true,
            gifsicle: true,
            svgo: true
        }))
        .pipe(gulp.dest(params.build.prod.img));
});

//-------------


gulp.task('watch', function() {
    watch([params.watch.html], function(event, cb) {
        gulp.start('html-dev:build');
    });
    watch([params.watch.style], function(event, cb) {
        gulp.start('styles-dev:build');
    });
    watch([params.watch.js], function(event, cb) {
        gulp.start('js-dev:build');
    });
    watch([params.watch.js], function(event, cb) {
        gulp.start('image-dev:build');
    });
    watch([params.watch.js], function(event, cb) {
        gulp.start('fonts-dev:build');
    });
});


gulp.task('images', function() {
    gulp.start('image-dev:build');
    gulp.start('image-prod:build');
});


gulp.task('dev', function() {
    gulp.start('html-dev:build');
    gulp.start('fonts-dev:build');
    gulp.start('js-dev:build');
    gulp.start('coffee-dev:build');
    gulp.start('styles-dev:build');
    gulp.start('copy-dev:build');
    gulp.start('image-dev:build');
});


gulp.task('prod', ['dev'], function() {
    gulp.start('html-prod:build');
    gulp.start('js-prod:build');
    gulp.start('styles-prod:build');
    gulp.start('copy-prod:build');
    gulp.start('fonts-prod:build');
});


gulp.task('default', ['dev', 'prod', 'images']);