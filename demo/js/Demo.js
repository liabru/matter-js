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
    var Example = Matter.Example,
        Engine = Matter.Engine,
        World = Matter.World,
        Common = Matter.Common,
        Bodies = Matter.Bodies,
        Events = Matter.Events,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

    // MatterTools aliases
    if (window.MatterTools) {
        var Gui = MatterTools.Gui,
            Inspector = MatterTools.Inspector;
    }

    // initialise the demo

    Demo.create = function() {
        return {
            isMobile: _isMobile,
            sceneEvents: []
        };
    };

    Demo.init = function() {
        var demo = Demo.create();

        // some example engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false,
            metrics: { extended: true }
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        if (_isBrowser) {
            var container = document.getElementById('canvas-container');
            demo.engine = Engine.create(container, options);

            // add a mouse controlled constraint
            demo.mouseConstraint = MouseConstraint.create(demo.engine);
            World.add(demo.engine.world, demo.mouseConstraint);
        } else {
            demo.engine = Engine.create(options);
            demo.engine.render = {};
            demo.engine.render.options = {};
        }

        // demo instance reference for external use
        Matter.Demo._demo = demo;

        // skip runner when performing automated tests
        if (_isAutomatedTest) return;

        // run the engine
        demo.runner = Engine.run(demo.engine);

        // default scene function name
        demo.sceneName = 'mixed';
        
        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            demo.sceneName = window.location.hash.replace('#', '').replace('-inspect', '');

        // set up a scene with bodies
        Demo.reset(demo);
        Example[demo.sceneName](demo);

        // set up demo interface (see end of this file)
        Demo.initControls(demo);
    };

    // call init when the page has loaded fully
    
    if (window.addEventListener) {
        window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
        window.attachEvent('load', Demo.init);
    }

    // the functions for the demo interface and controls below

    Demo.initControls = function(demo) {
        var demoSelect = document.getElementById('demo-select'),
            demoReset = document.getElementById('demo-reset');

        // create a Matter.Gui
        if (!_isMobile && Gui) {
            demo.gui = Gui.create(demo.engine, demo.runner);

            // need to add mouse constraint back in after gui clear or load is pressed
            Events.on(demo.gui, 'clear load', function() {
                demo.mouseConstraint = MouseConstraint.create(demo.engine);
                World.add(demo.engine.world, demo.mouseConstraint);
            });

            // need to rebind mouse on render change
            Events.on(demo.gui, 'setRenderer', function() {
                Mouse.setElement(demo.mouseConstraint.mouse, demo.engine.render.canvas);
            });
        }

        // create a Matter.Inspector
        if (!_isMobile && Inspector && _useInspector) {
            demo.inspector = Inspector.create(demo.engine, demo.runner);

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
            demo.engine.render.canvas.addEventListener('touchstart', Demo.fullscreen);

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

        // initialise demo selector
        demoSelect.value = demo.sceneName;
        
        demoSelect.addEventListener('change', function(e) {
            Demo.reset(demo);
            Example[demo.sceneName = e.target.value](demo);
            Gui.update(demo.gui);
            
            var scrollY = window.scrollY;
            window.location.hash = demo.sceneName;
            window.scrollY = scrollY;
        });
        
        demoReset.addEventListener('click', function(e) {
            Demo.reset(demo);
            Example[demo.sceneName](demo);
            Gui.update(demo.gui);
        });
    };

    Demo.fullscreen = function(demo) {
        var _fullscreenElement = demo.engine.render.canvas;
        
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
        if (demo.engine.render) {
            var renderController = demo.engine.render.controller;
            if (renderController && renderController.clear)
                renderController.clear(demo.engine.render);
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

        if (demo.engine.render && demo.engine.render.events) {
            for (i = 0; i < demo.sceneEvents.length; i++)
                Events.off(demo.engine.render, demo.sceneEvents[i]);
        }

        demo.sceneEvents = [];

        // reset id pool
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
        
        if (demo.engine.render) {
            var renderOptions = demo.engine.render.options;
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
