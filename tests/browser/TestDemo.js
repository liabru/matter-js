var page = require('webpage').create();
var fs = require('fs');
var Resurrect = require('./lib/resurrect');
var _ = require('./lib/lodash');

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onError = function(msg) {
    console.log(msg);
};

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

var log = function(msg) {
    console.log(JSON.stringify(msg));
}

var type = function(obj) {
    // https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
    if (obj === global) {
      return "global";
    }
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

var compare = function(objectA, objectB) {
    if (objectA === objectB) {
        return { equal: true };
    }

    if ((type(objectA) === 'undefined' && type(objectB) === 'null') 
        || (type(objectA) === 'null' && type(objectB) === 'undefined')) {
        return { equal: true };
    }

    if (type(objectA) !== type(objectB)) {
        return { equal: false, expected: type(objectA), actual: type(objectB) };
    }

    if (_.isNumber(objectA)) {
        if (objectA.toFixed(5) === objectB.toFixed(5)) {
            return { equal: true };
        } else {
            return { equal: false, expected: objectA, actual: objectB };
        }
    } 

    if (_.isArray(objectA)) {
        var arrayDelta = [],
            isEqual = true;
    
        for (var i = 0; i < Math.max(objectA.length, objectB.length); i++) {
            var diff = compare(objectA[i], objectB[i]);
            arrayDelta[i] = diff;

            if (diff.equal !== true) {
                isEqual = false;
            }
        }
        
        return isEqual ? { equal: true } : arrayDelta;
    }

    if (_.isObject(objectA)) {
        var keys = _.union(_.keys(objectA), _.keys(objectB)),
            objectDelta = { equal: true };

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i],
                diff = compare(objectA[key], objectB[key]);

            if (diff.equal !== true) {
                objectDelta[key] = diff;
                objectDelta.equal = false;
            }
        }

        return objectDelta.equal ? { equal: true } : objectDelta;
    }

    return { equal: false, expected: objectA, actual: objectB };
};

page.open('http://localhost:9000/demo/dev.html', function(status) {
    var demos = page.evaluate(function() {
        var options = Array.prototype.slice.call(document.getElementById('demo-select').options);
        return options.map(function(o) { return o.value });
    });

    var worldsPath = 'tests/browser/worlds',
        diffsPath = 'tests/browser/diffs'
        resurrect = new Resurrect({ cleanup: true }),
        frames = 10;

    fs.removeTree(diffsPath);
    fs.makeDirectory(diffsPath);

    console.log(demos);

    for (var i = 0; i < demos.length; i += 1) {
        var demo = demos[i],
            worldStartPath = worldsPath + '/' + demo + '/' + demo + '-0.json',
            worldEndPath = worldsPath + '/' + demo + '/' + demo + '-' + frames + '.json',
            worldStartDiffPath = diffsPath + '/' + demo + '/' + demo + '-0.json',
            worldEndDiffPath = diffsPath + '/' + demo + '/' + demo + '-' + frames + '.json';

        var worldStart = page.evaluate(function(demo) {
            var engine = Matter.Demo._engine;
            Matter.Runner.stop(engine);
            Matter.Demo[demo]();
            return engine.world;
        }, demo);

        var worldEnd = page.evaluate(function(demo, frames) {
            var engine = Matter.Demo._engine;
            for (var j = 0; j <= frames; j += 1) {
                Matter.Events.trigger(engine, 'tick', { timestamp: engine.timing.timestamp });
                Matter.Engine.update(engine, engine.timing.delta);
                Matter.Events.trigger(engine, 'afterTick', { timestamp: engine.timing.timestamp });
            }
            return engine.world;
        }, demo, frames);

        if (fs.exists(worldStartPath)) {
            var worldStartRef = resurrect.resurrect(fs.read(worldStartPath));
            var worldStartDiff = compare(worldStart, worldStartRef);

            if (!worldStartDiff.equal) {
                fs.write(worldStartDiffPath, JSON.stringify(worldStartDiff, null, 2), 'w');
                console.log(demo, 'start equal:', worldStartDiff.equal);
            }
        } else {
            console.warn('no existing start reference world for', demo);
            fs.write(worldStartPath, resurrect.stringify(worldStart), 'w');
            console.log('wrote', worldEndPath);
        }

        if (fs.exists(worldEndPath)) {
            var worldEndRef = resurrect.resurrect(fs.read(worldEndPath));
            var worldEndDiff = compare(worldEnd, worldEndRef);

            if (!worldEndDiff.equal) {
                fs.write(worldEndDiffPath, JSON.stringify(worldEndDiff, null, 2), 'w');
                console.log(demo, 'end equal:', worldEndDiff.equal);
            }
        } else {
            console.warn('no existing end reference world for', demo);
            fs.write(worldEndPath, resurrect.stringify(worldEnd), 'w');
            console.log('wrote', worldEndPath);
        }
    }

    console.log('done');

    phantom.exit();
});