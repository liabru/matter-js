/**
* A Matter.js version comparison testbed based on MatterTools.
*
* Tool to interactively compare engine results of 
* development version against the previous release.
*
* USAGE: [host]?compare[=frames]#[example]
*  e.g. http://localhost:8000/?compare=120#mixed
*
* @module Compare
*/

var MatterTools = require('matter-tools');
var MatterDev = require('MatterDev');
var MatterBuild = require('MatterBuild');

var compare = function(examples, isDev) {
    // create primary demo for dev build
    var demo = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js ・ ' + (isDev ? 'dev' : '') + ' ・ comparing to ' + MatterBuild.version,
            url: 'https://github.com/liabru/matter-js',
            reset: true,
            source: true,
            inspector: false,
            tools: false,
            fullscreen: true,
            exampleSelect: true
        },
        // tools disabled to keep sync between instances
        tools: {
            inspector: false,
            gui: false
        },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: true,
        startExample: false,
        examples: examples
    });

    // create secondary demo for release build
    var demoBuild = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js-compare-build',
            reset: false,
            source: false,
            inspector: false,
            tools: false,
            fullscreen: false,
            exampleSelect: false
        },
        // tools disabled to keep sync between instances
        tools: {
            inspector: false,
            gui: false
        },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: false,
        startExample: false,
        examples: examples.map(function(example) { 
            return Matter.Common.extend({}, example); 
        })
    });

    /**
     * NOTE: For the actual example code, refer to the source files in `/examples/`.
     * The code below is tooling for Matter.js maintainers to compare versions of Matter.
     */

    // build version should not run itself
    MatterBuild.Runner.run = function() {};
    MatterBuild.Render.run = function() {};

    // maintain original references to patched methods
    MatterDev.Runner._tick = MatterDev.Runner.tick;
    MatterDev.Render._world = MatterDev.Render.world;
    MatterBuild.Mouse._setElement = MatterBuild.Mouse.setElement;

    // patch MatterTools to control both demo versions simultaneously
    MatterTools.Demo._setExample = MatterTools.Demo.setExample;
    MatterTools.Demo.setExample = function(_demo, example) {
        MatterBuild.Common._nextId = MatterBuild.Common._seed = 0;
        MatterDev.Common._nextId = MatterDev.Common._seed = 0;

        MatterBuild.Plugin._registry = MatterDev.Plugin._registry;
        MatterBuild.use.apply(null, MatterDev.used);

        window.Matter = MatterDev;
        MatterTools.Demo._setExample(
            demo, demo.examples.find(function(e) { return e.name === example.name; })
        );

        var maxTicks = parseFloat(window.location.search.split('=')[1]);
        var ticks = 0;

        MatterDev.Runner.tick = function(runner, engine, time) {
            if (ticks === -1) {
                return;
            }

            if (ticks >= maxTicks) {
                console.info(
                    'Demo.Compare: ran ' + ticks + ' ticks, timestamp is now ' 
                        + engine.timing.timestamp.toFixed(2)
                );

                ticks = -1;
                    
                return;
            }

            ticks += 1;

            var demoBuildInstance = demoBuild.example.instance;
            runner.delta = demoBuildInstance.runner.delta = 1000 / 60;

            window.Matter = MatterBuild;
            MatterBuild.Runner.tick(demoBuildInstance.runner, demoBuildInstance.engine, time);
            window.Matter = MatterDev;
            return MatterDev.Runner._tick(runner, engine, time);
        };

        MatterDev.Render.world = function(render) {
            window.Matter = MatterBuild;
            MatterBuild.Render.world(demoBuild.example.instance.render);
            window.Matter = MatterDev;
            return MatterDev.Render._world(render);
        };

        MatterBuild.Mouse.setElement = function(mouse) {
            return MatterBuild.Mouse._setElement(mouse, demo.example.instance.render.canvas);
        };

        window.Matter = MatterBuild;
        MatterTools.Demo._setExample(
            demoBuild, demoBuild.examples.find(function(e) { return e.name === example.name; })
        );
            
        window.Matter = MatterDev;
    };

    // reset both engine versions simultaneously
    MatterTools.Demo._reset = MatterTools.Demo.reset;
    MatterTools.Demo.reset = function(_demo) {
        MatterBuild.Common._nextId = MatterBuild.Common._seed = 0;
        MatterDev.Common._nextId = MatterDev.Common._seed = 0;

        window.Matter = MatterBuild;
        MatterTools.Demo._reset(demoBuild);

        window.Matter = MatterDev;
        MatterTools.Demo._reset(demo);
    };

    document.body.appendChild(demo.dom.root);
    document.body.appendChild(demoBuild.dom.root);

    MatterTools.Demo.start(demo);

    document.title = 'Matter.js Compare' + (isDev ? ' ・ Dev' : '');

    console.info(
        'Demo.Compare: matter-js@' + MatterDev.version + 
        ' with matter-js@' + MatterBuild.version
    );
};

module.exports = { compare: compare };
