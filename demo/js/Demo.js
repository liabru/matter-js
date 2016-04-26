/**
* The Matter.js demo page controller and example runner.
*
* NOTE: For the actual example code, refer to the source files in `/examples/`.
*
* @class Demo
*/

(function() {

    var _isBrowser = typeof window !== 'undefined' && window.location,
        _useInspector = _isBrowser && window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = _isBrowser && /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent),
        _isAutomatedTest = !_isBrowser || window._phantom;

    var Matter = _isBrowser ? window.Matter : require('../../build/matter-dev.js');

    var Demo = {};
    Matter.Demo = Demo;

    if (!_isBrowser) {
        module.exports = Demo;
        window = {};
    }

    // Matter aliases
    var Body = Matter.Body,
        Example = Matter.Example,
        Engine = Matter.Engine,
        World = Matter.World,
        Common = Matter.Common,
        Bodies = Matter.Bodies,
        Events = Matter.Events,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Runner = Matter.Runner,
        Render = Matter.Render;

    // MatterTools aliases
    if (window.MatterTools) {
        var Gui = MatterTools.Gui,
            Inspector = MatterTools.Inspector;
    }

    Demo.create = function(options) {
        var defaults = {
            isManual: false,
            sceneName: 'mixed',
            sceneEvents: []
        };

        return Common.extend(defaults, options);
    };

    Demo.init = function() {
        var demo = Demo.create();
        Matter.Demo._demo = demo;

        // get container element for the canvas
        demo.container = document.getElementById('canvas-container');

        // create an example engine (see /examples/engine.js)
        demo.engine = Example.engine(demo);

        // run the engine
        demo.runner = Engine.run(demo.engine);

        // create a debug renderer
        demo.render = Render.create({
            element: demo.container,
            engine: demo.engine
        });

        // run the renderer
        Render.run(demo.render);

        // add a mouse controlled constraint
        demo.mouseConstraint = MouseConstraint.create(demo.engine, {
            element: demo.render.canvas
        });
        
        World.add(demo.engine.world, demo.mouseConstraint);

        // pass mouse to renderer to enable showMousePosition
        demo.render.mouse = demo.mouseConstraint.mouse;

        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            demo.sceneName = window.location.hash.replace('#', '').replace('-inspect', '');

        // set up a scene with bodies
        Demo.reset(demo);
        Demo.setScene(demo, demo.sceneName);

        // set up demo interface (see end of this file)
        Demo.initControls(demo);

        // pass through runner as timing for debug rendering
        demo.engine.metrics.timing = demo.runner;

        return demo;
    };

    // call init when the page has loaded fully
    if (!_isAutomatedTest) {
        if (window.addEventListener) {
            window.addEventListener('load', Demo.init);
        } else if (window.attachEvent) {
            window.attachEvent('load', Demo.init);
        }
    }

    Demo.setScene = function(demo, sceneName) {
        Example[sceneName](demo);
    };

    // the functions for the demo interface and controls below
    Demo.initControls = function(demo) {
        var demoSelect = document.getElementById('demo-select'),
            demoReset = document.getElementById('demo-reset');

        // create a Matter.Gui
        if (!_isMobile && Gui) {
            demo.gui = Gui.create(demo.engine, demo.runner, demo.render);

            // need to add mouse constraint back in after gui clear or load is pressed
            Events.on(demo.gui, 'clear load', function() {
                demo.mouseConstraint = MouseConstraint.create(demo.engine, {
                    element: demo.render.canvas
                });

                World.add(demo.engine.world, demo.mouseConstraint);
            });
        }

        // create a Matter.Inspector
        if (!_isMobile && Inspector && _useInspector) {
            demo.inspector = Inspector.create(demo.engine, demo.runner, demo.render);

            Events.on(demo.inspector, 'import', function() {
                demo.mouseConstraint = MouseConstraint.create(demo.engine);
                World.add(demo.engine.world, demo.mouseConstraint);
            });

            Events.on(demo.inspector, 'play', function() {
                demo.mouseConstraint = MouseConstraint.create(demo.engine);
                World.add(demo.engine.world, demo.mouseConstraint);
            });

            Events.on(demo.inspector, 'selectStart', function() {
                demo.mouseConstraint.constraint.render.visible = false;
            });

            Events.on(demo.inspector, 'selectEnd', function() {
                demo.mouseConstraint.constraint.render.visible = true;
            });
        }

        // go fullscreen when using a mobile device
        if (_isMobile) {
            var body = document.body;

            body.className += ' is-mobile';
            demo.render.canvas.addEventListener('touchstart', Demo.fullscreen);

            var fullscreenChange = function() {
                var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

                // delay fullscreen styles until fullscreen has finished changing
                setTimeout(function() {
                    if (fullscreenEnabled) {
                        body.className += ' is-fullscreen';
                    } else {
                        body.className = body.className.replace('is-fullscreen', '');
                    }
                }, 2000);
            };

            document.addEventListener('webkitfullscreenchange', fullscreenChange);
            document.addEventListener('mozfullscreenchange', fullscreenChange);
            document.addEventListener('fullscreenchange', fullscreenChange);
        }

        // keyboard controls
        document.onkeypress = function(keys) {
            // shift + a = toggle manual
            if (keys.shiftKey && keys.keyCode === 65) {
                Demo.setManualControl(demo, !demo.isManual);
            }

            // shift + q = step
            if (keys.shiftKey && keys.keyCode === 81) {
                if (!demo.isManual) {
                    Demo.setManualControl(demo, true);
                }

                Runner.tick(demo.runner, demo.engine);
            }
        };

        // initialise demo selector
        demoSelect.value = demo.sceneName;
        Demo.setUpdateSourceLink(demo.sceneName);
        
        demoSelect.addEventListener('change', function(e) {
            Demo.reset(demo);
            Demo.setScene(demo,demo.sceneName = e.target.value);

            if (demo.gui) {
                Gui.update(demo.gui);
            }
            
            var scrollY = window.scrollY;
            window.location.hash = demo.sceneName;
            window.scrollY = scrollY;
            Demo.setUpdateSourceLink(demo.sceneName);
        });
        
        demoReset.addEventListener('click', function(e) {
            Demo.reset(demo);
            Demo.setScene(demo, demo.sceneName);

            if (demo.gui) {
                Gui.update(demo.gui);
            }

            Demo.setUpdateSourceLink(demo.sceneName);
        });
    };

    Demo.setUpdateSourceLink = function(sceneName) {
        var demoViewSource = document.getElementById('demo-view-source'),
            sourceUrl = 'https://github.com/liabru/matter-js/blob/master/examples';
        demoViewSource.setAttribute('href', sourceUrl + '/' + sceneName + '.js');
    };

    Demo.setManualControl = function(demo, isManual) {
        var engine = demo.engine,
            world = engine.world,
            runner = demo.runner;

        demo.isManual = isManual;

        if (demo.isManual) {
            Runner.stop(runner);

            // continue rendering but not updating
            (function render(time){
                runner.frameRequestId = window.requestAnimationFrame(render);
                Events.trigger(engine, 'beforeUpdate');
                Events.trigger(engine, 'tick');
                engine.render.controller.world(engine);
                Events.trigger(engine, 'afterUpdate');
            })();
        } else {
            Runner.stop(runner);
            Runner.start(runner, engine);
        }
    };

    Demo.fullscreen = function(demo) {
        var _fullscreenElement = demo.render.canvas;
        
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (_fullscreenElement.requestFullscreen) {
                _fullscreenElement.requestFullscreen();
            } else if (_fullscreenElement.mozRequestFullScreen) {
                _fullscreenElement.mozRequestFullScreen();
            } else if (_fullscreenElement.webkitRequestFullscreen) {
                _fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    };
    
    Demo.reset = function(demo) {
        var world = demo.engine.world,
            i;
        
        World.clear(world);
        Engine.clear(demo.engine);

        // clear scene graph (if defined in controller)
        if (demo.render) {
            var renderController = demo.render.controller;
            if (renderController && renderController.clear)
                renderController.clear(demo.render);
        }

        // clear all scene events
        if (demo.engine.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(demo.engine, demo.sceneEvents[i]);
        }

        if (demo.mouseConstraint && demo.mouseConstraint.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(demo.mouseConstraint, demo.sceneEvents[i]);
        }

        if (world.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(world, demo.sceneEvents[i]);
        }

        if (demo.runner && demo.runner.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(demo.runner, demo.sceneEvents[i]);
        }

        if (demo.render && demo.render.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(demo.render, demo.sceneEvents[i]);
        }

        demo.sceneEvents = [];

        // reset id pool
        Body._nextCollidingGroupId = 1;
        Body._nextNonCollidingGroupId = -1;
        Body._nextCategory = 0x0001;
        Common._nextId = 0;

        // reset random seed
        Common._seed = 0;

        // reset mouse offset and scale (only required for Demo.views)
        if (demo.mouseConstraint) {
            Mouse.setScale(demo.mouseConstraint.mouse, { x: 1, y: 1 });
            Mouse.setOffset(demo.mouseConstraint.mouse, { x: 0, y: 0 });
        }

        demo.engine.enableSleeping = false;
        demo.engine.world.gravity.y = 1;
        demo.engine.world.gravity.x = 0;
        demo.engine.timing.timeScale = 1;

        var offset = 5;
        World.add(world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
        ]);

        if (demo.mouseConstraint) {
            World.add(world, demo.mouseConstraint);
        }
        
        if (demo.render) {
            var renderOptions = demo.render.options;
            renderOptions.wireframes = true;
            renderOptions.hasBounds = false;
            renderOptions.showDebug = false;
            renderOptions.showBroadphase = false;
            renderOptions.showBounds = false;
            renderOptions.showVelocity = false;
            renderOptions.showCollisions = false;
            renderOptions.showAxes = false;
            renderOptions.showPositions = false;
            renderOptions.showAngleIndicator = true;
            renderOptions.showIds = false;
            renderOptions.showShadows = false;
            renderOptions.showVertexNumbers = false;
            renderOptions.showConvexHulls = false;
            renderOptions.showInternalEdges = false;
            renderOptions.showSeparations = false;
            renderOptions.background = '#fff';

            if (_isMobile) {
                renderOptions.showDebug = true;
            }
        }
    };

})();
