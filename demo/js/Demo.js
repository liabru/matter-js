(function() {

    var _isBrowser = typeof window !== 'undefined' && window.location,
        Matter = _isBrowser ? window.Matter : require('../../build/matter-dev.js');

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

    var _engine,
        _runner,
        _gui,
        _inspector,
        _sceneName,
        _mouseConstraint,
        _sceneEvents = [],
        _useInspector = _isBrowser && window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = _isBrowser && /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent),
        _isAutomatedTest = !_isBrowser || window._phantom;
    
    // initialise the demo

    Demo.create = function() {
        return {
            engine: _engine,
            runner: _runner,
            mouseConstraint: _mouseConstraint,
            sceneEvents: _sceneEvents,
            isMobile: _isMobile
        };
    };

    Demo.init = function() {
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
            _engine = Engine.create(container, options);

            // add a mouse controlled constraint
            _mouseConstraint = MouseConstraint.create(_engine);
            World.add(_engine.world, _mouseConstraint);
        } else {
            _engine = Engine.create(options);
            _engine.render = {};
            _engine.render.options = {};
        }

        // engine reference for external use
        Matter.Demo._engine = _engine;

        // skip runner when performing automated tests
        if (_isAutomatedTest) return;

        // run the engine
        _runner = Engine.run(_engine);

        // default scene function name
        _sceneName = 'mixed';
        
        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            _sceneName = window.location.hash.replace('#', '').replace('-inspect', '');

        // set up a scene with bodies
        Demo.reset();
        Example[_sceneName](Demo.create());

        // set up demo interface (see end of this file)
        Demo.initControls();
    };

    // call init when the page has loaded fully
    
    if (window.addEventListener) {
        window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
        window.attachEvent('load', Demo.init);
    }

    // the functions for the demo interface and controls below

    Demo.initControls = function() {
        var demoSelect = document.getElementById('demo-select'),
            demoReset = document.getElementById('demo-reset');

        // create a Matter.Gui
        if (!_isMobile && Gui) {
            _gui = Gui.create(_engine, _runner);

            // need to add mouse constraint back in after gui clear or load is pressed
            Events.on(_gui, 'clear load', function() {
                _mouseConstraint = MouseConstraint.create(_engine);
                World.add(_engine.world, _mouseConstraint);
            });

            // need to rebind mouse on render change
            Events.on(_gui, 'setRenderer', function() {
                Mouse.setElement(_mouseConstraint.mouse, _engine.render.canvas);
            });
        }

        // create a Matter.Inspector
        if (!_isMobile && Inspector && _useInspector) {
            _inspector = Inspector.create(_engine, _runner);

            Events.on(_inspector, 'import', function() {
                _mouseConstraint = MouseConstraint.create(_engine);
                World.add(_engine.world, _mouseConstraint);
            });

            Events.on(_inspector, 'play', function() {
                _mouseConstraint = MouseConstraint.create(_engine);
                World.add(_engine.world, _mouseConstraint);
            });

            Events.on(_inspector, 'selectStart', function() {
                _mouseConstraint.constraint.render.visible = false;
            });

            Events.on(_inspector, 'selectEnd', function() {
                _mouseConstraint.constraint.render.visible = true;
            });
        }

        // go fullscreen when using a mobile device
        if (_isMobile) {
            var body = document.body;

            body.className += ' is-mobile';
            _engine.render.canvas.addEventListener('touchstart', Demo.fullscreen);

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
        demoSelect.value = _sceneName;
        
        demoSelect.addEventListener('change', function(e) {
            Demo.reset();
            Example[_sceneName = e.target.value](Demo.create());
            Gui.update(_gui);
            
            var scrollY = window.scrollY;
            window.location.hash = _sceneName;
            window.scrollY = scrollY;
        });
        
        demoReset.addEventListener('click', function(e) {
            Demo.reset();
            Example[_sceneName](Demo.create());
            Gui.update(_gui);
        });
    };

    Demo.fullscreen = function(){
        var _fullscreenElement = _engine.render.canvas;
        
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
    
    Demo.reset = function() {
        var _world = _engine.world,
            i;
        
        World.clear(_world);
        Engine.clear(_engine);

        // clear scene graph (if defined in controller)
        if (_engine.render) {
            var renderController = _engine.render.controller;
            if (renderController && renderController.clear)
                renderController.clear(_engine.render);
        }

        // clear all scene events
        if (_engine.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_engine, _sceneEvents[i]);
        }

        if (_mouseConstraint && _mouseConstraint.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_mouseConstraint, _sceneEvents[i]);
        }

        if (_world.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_world, _sceneEvents[i]);
        }

        if (_runner && _runner.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_runner, _sceneEvents[i]);
        }

        if (_engine.render && _engine.render.events) {
            for (i = 0; i < _sceneEvents.length; i++)
                Events.off(_engine.render, _sceneEvents[i]);
        }

        _sceneEvents = [];

        // reset id pool
        Common._nextId = 0;

        // reset random seed
        Common._seed = 0;

        // reset mouse offset and scale (only required for Demo.views)
        if (_mouseConstraint) {
            Mouse.setScale(_mouseConstraint.mouse, { x: 1, y: 1 });
            Mouse.setOffset(_mouseConstraint.mouse, { x: 0, y: 0 });
        }

        _engine.enableSleeping = false;
        _engine.world.gravity.y = 1;
        _engine.world.gravity.x = 0;
        _engine.timing.timeScale = 1;

        var offset = 5;
        World.add(_world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
        ]);

        if (_mouseConstraint) {
            World.add(_world, _mouseConstraint);
        }
        
        if (_engine.render) {
            var renderOptions = _engine.render.options;
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
