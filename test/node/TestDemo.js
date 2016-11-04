var fs = require('fs');
var mkdirp = require('mkdirp').sync;
var removeDir = require('rimraf').sync;
var Resurrect = require('../lib/resurrect');
var compare = require('fast-json-patch').compare;
var path = require('path');
var $ = require('cheerio');
var Matter = require('../../build/matter-dev.js');
Matter.Example = require('../../demo/js/Examples.js');
Matter.Demo = require('../../demo/js/Demo.js');

var demo,
    frames = 10,
    refsPath = 'test/node/refs',
    diffsPath = 'test/node/diffs';

var update = arg('--update'),
    updateAll = typeof arg('--updateAll') !== 'undefined',
    diff = arg('--diff');

var resurrect = new Resurrect({ cleanup: true, revive: false }),
    created = [],
    changed = [];

var test = function() {
    var demos = getDemoNames();

    removeDir(diffsPath);

    if (diff) {
        mkdirp(diffsPath);
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

        var _demo = Matter.Demo.create(),
            engine = Matter.Example.engine(_demo),
            runner = Matter.Runner.create();

        _demo.engine = engine;
        _demo.engine.render = {};
        _demo.engine.render.options = {};
        _demo.runner = runner;
        _demo.render = { options: {} };

        if (!(demo in Matter.Example)) {
            throw '\'' + demo + '\' is not defined in Matter.Example';
        }

        Matter.Demo.reset(_demo);
        Matter.Example[demo](_demo);

        var worldStart = JSON.parse(resurrect.stringify(engine.world, precisionLimiter));

        for (var j = 0; j <= frames; j += 1) {
            Matter.Runner.tick(runner, engine, j * runner.delta);
        }

        var worldEnd = JSON.parse(resurrect.stringify(engine.world, precisionLimiter));

        if (fs.existsSync(worldStartPath)) {
            var worldStartRef = JSON.parse(fs.readFileSync(worldStartPath));
            var worldStartDiff = compare(worldStartRef, worldStart);

            if (worldStartDiff.length !== 0) {
                if (diff) {
                    writeFile(worldStartDiffPath, JSON.stringify(worldStartDiff, precisionLimiter, 2));
                }

                if (forceUpdate) {
                    hasCreated = true;
                    writeFile(worldStartPath, JSON.stringify(worldStart, precisionLimiter, 2));
                } else {
                    hasChanged = true; 
                }
            }
        } else {
            hasCreated = true;
            writeFile(worldStartPath, JSON.stringify(worldStart, precisionLimiter, 2));
        }

        if (fs.existsSync(worldEndPath)) {
            var worldEndRef = JSON.parse(fs.readFileSync(worldEndPath));
            var worldEndDiff = compare(worldEndRef, worldEnd);

            if (worldEndDiff.length !== 0) {
                if (diff) {
                    writeFile(worldEndDiffPath, JSON.stringify(worldEndDiff, precisionLimiter, 2));
                }

                if (forceUpdate) {
                    hasCreated = true;
                    writeFile(worldEndPath, JSON.stringify(worldEnd, precisionLimiter, 2));
                } else {
                    hasChanged = true;
                }
            }
        } else {
            hasCreated = true;
            writeFile(worldEndPath, JSON.stringify(worldEnd, precisionLimiter, 2));
        }

        if (hasChanged) {
            changed.push("'" + demo + "'");
            process.stdout.write('x');
        } else if (hasCreated) {
            created.push("'" + demo + "'");
            process.stdout.write('+');
        } else {
            process.stdout.write('.');
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

    setTimeout(function() {
        process.exit(!isOk);
    }, 100);
};

var precisionLimiter = function(key, value) {
    if (typeof value === 'number') {
        return parseFloat(value.toFixed(5));
    }
    return value;
};

function arg(name) {
    var index = process.argv.indexOf(name);
    if (index >= 0) {
        return process.argv[index + 1] || true;
    }
    return undefined;
}

var getDemoNames = function() {
    var demos = [],
        skip = [
            'terrain', 'svg', 'concave', 
            'slingshot', 'views', 'raycasting', 
            'events', 'collisionFiltering', 'sleeping', 
            'attractors'
        ];

    $('#demo-select option', fs.readFileSync('demo/index.html').toString())
        .each(function() { 
            var name = $(this).val();
            if (skip.indexOf(name) === -1) {
                demos.push(name); 
            }
        });

    return demos;
};

var writeFile = function(filePath, string) {
    mkdirp(path.dirname(filePath));
    fs.writeFileSync(filePath, string);
};

test();