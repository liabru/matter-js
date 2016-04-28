var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var eslint = require('gulp-eslint');
var bump = require('gulp-bump');
var changelog = require('gulp-conventional-changelog');
var tag = require('gulp-tag-version');
var release = require('gulp-github-release');
var sequence = require('run-sequence');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var preprocess = require('gulp-preprocess');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var through2 = require('through2');
var pkg = require('./package.json');
var clone = require('gulp-clone');
var livereload = require('connect-livereload');
var es = require('event-stream');
var path = require('path');
var fs = require('fs');
var watchify = require('watchify');
var extend = require('util')._extend;
var exec = require('child_process').exec;
var buildDirectory = 'build';
var server;

gulp.task('default', ['build:dev', 'build:examples']);

gulp.task('dev', function(callback) {
    sequence('build:examples', 'watch', 'serve', callback);
});

gulp.task('release', function(callback) {
    shell('git status --porcelain', function(err, stdout) {
        if (stdout && stdout.trim()) {
            throw new gutil.PluginError({
                plugin: 'release',
                message: 'cannot build release as there are uncomitted changes'
            });
        } else {
            sequence('build:dev', 'build:examples', 'test', 'bump', 'reload', 'build:edge', 'build:release', 'doc', 'changelog', callback);
        }
    });
});

gulp.task('release:push', function(callback) {
    shell('git status --porcelain', function(err, stdout) {
        if (stdout && stdout.trim()) {
            throw new gutil.PluginError({
                plugin: 'release',
                message: 'cannot push release as it has not yet been committed'
            });
        } else {
            sequence('tag', 'release:push:git', 'release:push:github', 'release:push:npm', 'release:push:docs', callback);
        }
    });
});

gulp.task('release:push:github', function(callback) {
    return gulp.src([
        'CHANGELOG.md',
        'LICENSE', 
        buildDirectory + '/matter.min.js', 
        buildDirectory + '/matter.js'
    ]).pipe(release({
        owner: 'liabru',
        repo: pkg.name,
        tag: pkg.version,
        name: 'Matter.js ' + pkg.version
    }));
});

gulp.task('release:push:git', function(callback) {
    shell('git push', callback);
});

gulp.task('release:push:npm', function(callback) {
    shell('npm publish', callback);
});

gulp.task('release:push:docs', function(callback) {
    shell('../deploy-docs.sh', callback);
});

gulp.task('build:dev', function() {
    return build(extend(extend({}, pkg), { version: 'dev' }));
});

gulp.task('build:edge', function() {
    return build(extend(extend({}, pkg), { version: 'master' }));
});

gulp.task('build:release', function() {
    return build(extend(extend({}, pkg), { version: pkg.version }));
});

gulp.task('build:examples', function() {
    return gulp.src('examples/**/*.js')
        .pipe(concat('Examples.js'))
        .pipe(gulp.dest('demo/js'));
});

gulp.task('watch', function() {
    var b = browserify({
        entries: ['src/module/main.js'],
        standalone: 'Matter',
        plugin: [watchify]
    });

    var bundle = function() {
        gutil.log('Updated bundle build/matter-dev.js');
        b.bundle().pipe(fs.createWriteStream('build/matter-dev.js'));
    };

    b.on('update', bundle);
    bundle();

    gulp.watch('examples/**/*.js', ['build:examples']);
});

gulp.task('bump', function() {
    return gulp.src(['package.json', 'bower.json'])
        .pipe(bump({ type: process.argv[4] || 'patch' }))
        .pipe(gulp.dest('.'));
});

gulp.task('reload', function(callback) {
    delete require.cache[require.resolve('./package.json')];
    pkg = require('./package.json');
    callback();
});

gulp.task('tag', function() {
    return gulp.src('package.json')
        .pipe(tag({ prefix: '' }));
});

gulp.task('changelog', function () {
    return gulp.src('CHANGELOG.md')
        .pipe(changelog())
        .pipe(gulp.dest('.'));
});

gulp.task('serve', function() {
    serve(false);
});

gulp.task('serve:test', function() {
    serve(true);
});

gulp.task('serve:stop', function() {
    if (server) {
        try {
            server.emit('kill');
        } catch (e) {} // eslint-disable-line no-empty
        gutil.log('Web server stopped');
    }
});

gulp.task('test', function(callback) {
    sequence('serve:test', 'lint', 'test:browser', 'test:node', 'serve:stop', callback);
});

gulp.task('test:browser', function(callback) {
    shell('phantomjs test/browser/TestDemo.js', callback);
});

gulp.task('test:node', function(callback) {
    shell('node test/node/TestDemo.js', callback);
});

gulp.task('lint', function() {
    return gulp.src([
        'src/**/*.js',
        'demo/js/*.js',
        'examples/*.js',
        'test/browser/TestDemo.js',
        'test/node/TestDemo.js',
        'Gulpfile.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('doc', function(callback) {
    var options = {
        paths: ['src'],
        themedir: 'matter-doc-theme',
        outdir: 'doc/build',
        linkNatives: true,
        project: {
            name: pkg.name + ' ' + pkg.version + ' Physics Engine API Docs',
            description: pkg.description,
            version: pkg.version,
            url: pkg.homepage
        }
    };

    var Y = require('yuidocjs');
    var json = new Y.YUIDoc(options).run();
    json.project = options.project;

    var builder = new Y.DocBuilder(options, json);
    builder.compile(callback);
});

var serve = function(isTest) {
    process.on('uncaughtException', function(err) {
        if (err.errno === 'EADDRINUSE') {
            gutil.log('Server already running (or port is otherwise in use)');
        }
    });

    server = gulp.src('.')
        .pipe(webserver({
            host: '0.0.0.0',
            livereload: {
                enable: !isTest,
                filter: function(filename) {
                    return filename.match(/build|demo/);
                }
            },
            middleware: livereload(),
            open: isTest ? false : 'http://localhost:8000/demo/index.html',
            directoryListing: true
        }));
};

var build = function(options) {
    var filename = buildDirectory + '/matter',
        dest = filename + '.js',
        destMin = filename + '.min.js';

    options.date = options.date || new Date().toISOString().slice(0, 10);
    options.author = '@liabru';

    gutil.log('Building', filename, options.date);

    var compiled = gulp.src(['src/module/main.js'])
        .pipe(replace("version = 'master'", "version = '" + options.version + "'"))
        .pipe(through2.obj(function(file, enc, next){
            browserify(file.path, { standalone: 'Matter' })
                .bundle(function(err, res){
                    file.contents = res;
                    next(null, file);
                });
        }));

    if (options.version !== 'dev') {
        compiled.pipe(preprocess({ context: { DEBUG: false } }));
    }

    var build = compiled.pipe(clone())
        .pipe(header(banner + '\n' + license + '\n\n', { context: options }))
        .pipe(rename(dest))
        .pipe(gulp.dest('.'));

    var buildMin = compiled.pipe(clone())
        .pipe(uglify({ output: { max_line_len: 1000 } }))
        .pipe(header(banner, { context: options }))
        .pipe(rename(destMin))
        .pipe(gulp.dest('.'));

    return es.merge(build, buildMin);
};

var shell = function(command, callback) {
    var args = process.argv.slice(3).join(' '),
        proc = exec(command + ' ' + args, function(err, stdout, stderr) {
            callback(err, stdout, stderr, proc);
        });

    proc.stdout.on('data', function(data) {
        process.stdout.write(data);
    });

    proc.stderr.on('data', function(data) {
        process.stderr.write(data);
    });
};

var license = fs.readFileSync('src/module/license.js');

var banner = [
    '/**',
    '* <%= context.name %> <%= context.version %> by <%= context.author %> <%= context.date %>',
    '* <%= context.homepage %>',
    '* License <%= context.license %>',
    '*/',
    ''
].join('\n');
