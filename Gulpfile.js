/* eslint-env es6 */
"use strict";

const gulp = require('gulp');
const bump = require('gulp-bump');
const changelog = require('gulp-conventional-changelog');
const tag = require('gulp-tag-version');
const sequence = require('run-sequence');
const gutil = require('gulp-util');
const pkg = require('./package.json');
const exec = require('child_process').exec;

const shellExec = (command, callback) => {
    const args = process.argv.slice(3).join(' '),
        proc = exec(command + ' ' + args, (err, stdout, stderr) => {
            callback(err, stdout, stderr, proc);
        });

    proc.stdout.on('data', data => process.stdout.write(data));
    proc.stderr.on('data', data => process.stderr.write(data));
};

const shell = command => (callback => { shellExec(command, callback); });

const hint = command => (callback => {
    gutil.log(gutil.colors.red('Error'), 'use', gutil.colors.yellow(command), 'instead.');
    callback();
});

gulp.task('default', hint('npm run build'));
gulp.task('dev', hint('npm run dev'));
gulp.task('build', hint('npm run build'));
gulp.task('test', hint('npm run test'));
gulp.task('lint', hint('npm run lint'));

gulp.task('doc', callback => {
    shellExec(`yuidoc --config yuidoc.json --project-version ${pkg.version}`, callback);
});

gulp.task('bump', () => {
    return gulp.src(['package.json', 'bower.json'])
        .pipe(bump({ type: process.argv[4] || 'minor' }))
        .pipe(gulp.dest('.'));
});

gulp.task('tag', () => {
    return gulp.src('package.json')
        .pipe(tag({ prefix: '' }));
});

gulp.task('changelog', () => {
    return gulp.src('CHANGELOG.md')
        .pipe(changelog())
        .pipe(gulp.dest('.'));
});

gulp.task('release', callback => {
    shellExec('git status --porcelain', (err, stdout) => {
        if (stdout && stdout.trim()) {
            throw new gutil.PluginError({
                plugin: 'release',
                message: 'cannot build release as there are uncomitted changes'
            });
        } else {
            sequence(
                'release:lint', 'bump', 'release:build', 'release:test', 
                'doc', 'changelog', callback
            );
        }
    });
});

gulp.task('release:lint', shell('npm run lint'));
gulp.task('release:build', shell('npm run build'));
gulp.task('release:test', shell('TEST_BUILD=true npm run test'));
gulp.task('release:push:git', shell('git push origin && git push origin --tags'));
gulp.task('release:push:npm', shell('npm publish'));

gulp.task('release:push', callback => {
    shellExec('git status --porcelain', (err, stdout) => {
        if (stdout && stdout.trim()) {
            throw new gutil.PluginError({
                plugin: 'release',
                message: 'cannot push release as it has not yet been committed'
            });
        } else {
            sequence('tag', 'release:push:git', 'release:push:npm', callback);
        }
    });
});
