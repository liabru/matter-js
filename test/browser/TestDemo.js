var page = require('webpage').create();
var fs = require('fs');
var Resurrect = require('../lib/resurrect');
var compare = require('fast-json-patch').compare;
var system = require('system');

var demo,
    frames = 10,
    testUrl = 'http://localhost:8000/demo/index.html',
    refsPath = 'test/browser/refs',
    diffsPath = 'test/browser/diffs';

var update = arg('--update'),
    updateAll = typeof arg('--updateAll') !== 'undefined',
    diff = arg('--diff');

var resurrect = new Resurrect({ cleanup: true, revive: false }),
    created = [],
    changed = [];

var test = function(status) {
    if (status === 'fail') {
        console.log('failed to load', testUrl);
        console.log('check dev server is running!');
        console.log('use `grunt dev`');
        phantom.exit(1);
        return;
    }

    var demos = page.evaluate(function() {
        var demoSelect = document.getElementById('demo-select'),
            options = Array.prototype.slice.call(demoSelect);
        return options.map(function(o) { return o.value; });
    });

    fs.removeTree(diffsPath);

    if (diff) {
        fs.makeDirectory(diffsPath);
    }

    for (var i = 0; i < demos.length; i += 1) {
        demo = demos[i];

        var hasChanged = false,
            hasCreated = false,
            forceUpdate = update === demo || updateAll,
            worldStartPath = refsPath + '/' + demo + '/' + demo + '-0.json',
            worldEndPath = refsPath + '/' + demo + '/' + demo + '-' + frames + '.json',
            worldStartDiffPath = diffsPath + '/' + demo + '/' + demo + '-0.json',
            worldEndDiffPath = diffsPath + '/' + demo + '/' + demo + '-' + frames + '.json';

        var worldStart = page.evaluate(function(demo) {
            if (!(demo in Matter.Example)) {
                throw '\'' + demo + '\' is not defined in Matter.Demo';
            }

            var _demo = Matter.Demo.create(),
                engine = Matter.Example.engine(_demo),
                runner = Matter.Runner.create();

            Matter.Demo._demo = _demo;
            _demo.engine = engine;
            _demo.engine.render = {};
            _demo.engine.render.options = {};
            _demo.runner = runner;
            _demo.render = { options: {} };
            _demo.mouseConstraint = Matter.MouseConstraint.create(engine);

            Matter.Demo.reset(_demo);
            Matter.Example[demo](_demo);

            return engine.world;
        }, demo);

        var worldEnd = page.evaluate(function(demo, frames) {
            var engine = Matter.Demo._demo.engine,
                runner = Matter.Demo._demo.runner;

            for (var j = 0; j <= frames; j += 1) {
                Matter.Runner.tick(runner, engine, j * runner.delta);
            }

            return engine.world;
        }, demo, frames);

        worldEnd = JSON.parse(resurrect.stringify(worldEnd, precisionLimiter));
        worldStart = JSON.parse(resurrect.stringify(worldStart, precisionLimiter));

        if (fs.exists(worldStartPath)) {
            var worldStartRef = JSON.parse(fs.read(worldStartPath));
            var worldStartDiff = compare(worldStartRef, worldStart);

            if (worldStartDiff.length !== 0) {
                if (diff) {
                    fs.write(worldStartDiffPath, JSON.stringify(worldStartDiff, precisionLimiter, 2), 'w');
                }

                if (forceUpdate) {
                    hasCreated = true;
                    fs.write(worldStartPath, JSON.stringify(worldStart, precisionLimiter, 2), 'w');
                } else {
                    hasChanged = true; 
                }
            }
        } else {
            hasCreated = true;
            fs.write(worldStartPath, JSON.stringify(worldStart, precisionLimiter, 2), 'w');
        }

        if (fs.exists(worldEndPath)) {
            var worldEndRef = JSON.parse(fs.read(worldEndPath));
            var worldEndDiff = compare(worldEndRef, worldEnd);

            if (worldEndDiff.length !== 0) {
                if (diff) {
                    fs.write(worldEndDiffPath, JSON.stringify(worldEndDiff, precisionLimiter, 2), 'w');
                }

                if (forceUpdate) {
                    hasCreated = true;
                    fs.write(worldEndPath, JSON.stringify(worldEnd, precisionLimiter, 2), 'w');
                } else {
                    hasChanged = true;
                }
            }
        } else {
            hasCreated = true;
            fs.write(worldEndPath, JSON.stringify(worldEnd, precisionLimiter, 2), 'w');
        }

        if (hasChanged) {
            changed.push("'" + demo + "'");
            system.stdout.write('x');
        } else if (hasCreated) {
            created.push("'" + demo + "'");
            system.stdout.write('+');
        } else {
            system.stdout.write('.');
        }
    }

    if (created.length > 0) {
        console.log('\nupdated', created.join(', '));
    }

    var isOk = changed.length === 0 ? 1 : 0;

    console.log('');

    if (isOk) {
        console.log('ok');
    } else {
        console.log('\nchanges detected on:');
        console.log(changed.join(', '));
        console.log('\nreview, then --update [name] or --updateAll');
        console.log('use --diff for diff log');
    }

    phantom.exit(!isOk);
};

var precisionLimiter = function(key, value) {
    if (typeof value === 'number') {
        return parseFloat(value.toFixed(5));
    }
    return value;
};

function arg(name) {
    var index = system.args.indexOf(name);
    if (index >= 0) {
        return system.args[index + 1] || true;
    }
    return undefined;
}

page.onError = function(msg, trace) {
    setTimeout(function() {
        var msgStack = ['testing \'' + demo + '\'', msg];

        if (trace && trace.length) {
            trace.forEach(function(t) {
                msgStack.push(' at ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (fn: ' + t.function +')' : ''));
            });
        }

        console.log(msgStack.join('\n'));
        phantom.exit(1);
    }, 0);
};


page.onResourceReceived = function(res) {
    setTimeout(function() {
        if (res.stage === 'end'
            && (res.status !== 304 && res.status !== 200 && res.status !== null)) {
            console.log('error', res.status, res.url);
            phantom.exit(1);
        }
    }, 0);
};

phantom.onError = page.onError;

page.open(testUrl, test);