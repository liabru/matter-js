/**
* A Matter.js build comparison testbed.
*
* Tool for Matter.js maintainers to compare results of 
* the current source build with the release build in the browser.
*
* USAGE: open http://localhost:8000/?compare=120#mixed
*
* NOTE: For the actual example code, refer to the source files in `/examples/`.
*
* @class Compare
*/

(function() {
    // maintain reference to dev version of Matter already loaded
    var MatterDev = window.Matter;

    // load the build version of Matter
    var matterBuildScript = document.createElement('script');
    matterBuildScript.src = '../build/matter.min.js';

    // wait for load
    matterBuildScript.addEventListener('load', function() {
        var examples = window.MatterDemo.examples;

        // maintain reference of build version and set dev version as main
        var MatterBuild = window.Matter;
        window.Matter = MatterDev;

        var demo = MatterTools.Demo.create({
            toolbar: {
                title: 'matter-js',
                url: 'https://github.com/liabru/matter-js',
                reset: true,
                source: true,
                inspector: true,
                tools: true,
                fullscreen: true,
                exampleSelect: true
            },
            tools: {
                inspector: true,
                gui: true
            },
            inline: false,
            preventZoom: true,
            resetOnOrientation: true,
            routing: true,
            startExample: 'mixed',
            examples: examples
        });

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
            tools: {
                inspector: false,
                gui: false
            },
            inline: false,
            preventZoom: true,
            resetOnOrientation: true,
            routing: false,
            startExample: 'mixed',
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
                runner.isFixed = demoBuildInstance.runner.isFixed = true;
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

        console.info(
            'Demo.Compare: comparing matter-js@' + MatterDev.version + ' with matter-js@' + MatterBuild.version
        );
    });

    document.body.append(matterBuildScript);
})();
