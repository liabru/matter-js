(function() {

    // Matter aliases
    var Engine = Matter.Engine,
        Gui = Matter.Gui,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        RenderPixi = Matter.RenderPixi,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices;

    var Demo = {};

    var _engine,
        _gui,
        _sceneName,
        _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);
    
    Demo.init = function() {
        var container = document.getElementById('canvas-container');

        // engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);

        // run the engine
        Engine.run(_engine);

        // default scene function name
        _sceneName = 'mixed';
        
        // get the scene function name from hash
        if (window.location.hash.length !== 0) 
            _sceneName = window.location.hash.replace('#', '');

        // set up a scene with bodies
        Demo[_sceneName]();

        // set up demo interface
        Demo.initControls();
    };

    if (window.addEventListener) {
        window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
        window.attachEvent('load', Demo.init);
    }

    Demo.initControls = function() {
        var demoSelect = document.getElementById('demo-select'),
            demoReset = document.getElementById('demo-reset');

        // create a dat.gui using Matter helper
        if (!_isMobile)
            _gui = Gui.create(_engine);

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
            Demo[_sceneName = e.target.value]();
            Gui.update(_gui);
            
            var scrollY = window.scrollY;
            window.location.hash = _sceneName;
            window.scrollY = scrollY;
        });
        
        demoReset.addEventListener('click', function(e) {
            Demo[_sceneName]();
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
        var _world = _engine.world;
        
        World.clear(_world);
        Engine.clear(_engine);

        // clear scene graph (if defined in controller)
        var renderController = _engine.render.controller;
        if (renderController.clear)
            renderController.clear(_engine.render);

        if (Events) {

            // clear all events
            Events.off(_engine);

            // add event for deleting bodies and constraints with right mouse button
            Events.on(_engine, 'mousedown', function(event) {
                var mouse = event.mouse,
                    engine = event.source,
                    bodies = Composite.allBodies(engine.world),
                    constraints = Composite.allConstraints(engine.world),
                    i;

                if (mouse.button === 2) {

                    // find if a body was clicked on
                    for (i = 0; i < bodies.length; i++) {
                        var body = bodies[i];
                        if (Bounds.contains(body.bounds, mouse.position) 
                                && Vertices.contains(body.vertices, mouse.position)) {

                            // remove the body that was clicked on
                            Composite.removeBody(engine.world, body, true);
                        }
                    }

                    // find if a constraint anchor was clicked on
                    for (i = 0; i < constraints.length; i++) {
                        var constraint = constraints[i],
                            bodyA = constraint.bodyA,
                            bodyB = constraint.bodyB;

                        // we need to account for different types of constraint anchor
                        var pointAWorld = constraint.pointA,
                            pointBWorld = constraint.pointB;
                        if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                        if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                        // if the constraint does not have two valid anchors, skip it
                        if (!pointAWorld || !pointBWorld)
                            continue;

                        // find distance between mouse and anchor points
                        var distA = Vector.magnitudeSquared(Vector.sub(mouse.position, pointAWorld)),
                            distB = Vector.magnitudeSquared(Vector.sub(mouse.position, pointBWorld));

                        // if mouse was close, remove the constraint
                        if (distA < 100 || distB < 100) {
                            Composite.removeConstraint(engine.world, constraint, true);
                        }
                    }
                }
            });
        }

        _engine.enableSleeping = false;
        _engine.world.gravity.y = 1;

        var offset = 5;
        World.addBody(_world, Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }));
        
        var renderOptions = _engine.render.options;
        renderOptions.wireframes = true;
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
        renderOptions.background = '#fff';

        if (_isMobile) {
            renderOptions.showAngleIndicator = false;
            renderOptions.showDebug = true;
        }
    };

    // all functions below are for setting up scenes

    Demo.mixed = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                var sides = Math.round(Common.random(1, 8));

                // triangles can be a little unstable, so avoid until fixed
                // TODO: make triangles more stable
                sides = (sides === 3) ? 4 : sides;

                return Bodies.polygon(x, y, sides, Common.random(20, 50));
            }
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
    };

    Demo.mixedSolid = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(50, 50, 12, 3, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
        renderOptions.wireframes = false;
        renderOptions.showAngleIndicator = false;

        if (window.chrome)
            renderOptions.showShadows = true;
    };
    
    Demo.chains = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var groupId = Body.nextGroupId();
                
        var ropeA = Composites.stack(200, 100, 5, 2, 10, 10, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 50, 20, { groupId: groupId });
        });
        
        Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });
        Composite.addConstraint(ropeA, Constraint.create({ 
            bodyB: ropeA.bodies[0],
            pointB: { x: -25, y: 0 },
            pointA: { x: 200, y: 100 },
            stiffness: 0.5
        }));
        
        World.addComposite(_world, ropeA);
        
        groupId = Body.nextGroupId();
        
        var ropeB = Composites.stack(500, 100, 5, 2, 10, 10, function(x, y, column, row) {
            return Bodies.circle(x, y, 20, { groupId: groupId });
        });
        
        Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });
        Composite.addConstraint(ropeB, Constraint.create({ 
            bodyB: ropeB.bodies[0],
            pointB: { x: -20, y: 0 },
            pointA: { x: 500, y: 100 },
            stiffness: 0.5
        }));
        
        World.addComposite(_world, ropeB);
    };
    
    Demo.car = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var scale;
        
        scale = 0.8;
        World.addComposite(_world, Composites.car(150, 100, 100 * scale, 40 * scale, 30 * scale));
        
        scale = 0.7;
        World.addComposite(_world, Composites.car(350, 300, 100 * scale, 40 * scale, 30 * scale));
        
        World.addBody(_world, Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(500, 350, 700, 20, { isStatic: true, angle: -Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04 }));
        
        var renderOptions = _engine.render.options;
        renderOptions.showAngleIndicator = true;
        renderOptions.showCollisions = true;
    };

    Demo.friction = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        World.addBody(_world, Bodies.rectangle(300, 180, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(300, 70, 40, 40, { friction: 0.001 }));

        World.addBody(_world, Bodies.rectangle(300, 350, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(300, 250, 40, 40, { friction: 0.0005 }));

        World.addBody(_world, Bodies.rectangle(300, 520, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(300, 430, 40, 40, { friction: 0 }));

        var renderOptions = _engine.render.options;
        renderOptions.showAngleIndicator = true;
        renderOptions.showCollisions = true;
    };

    Demo.airFriction = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        World.addBody(_world, Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }));

        World.addBody(_world, Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }));

        World.addBody(_world, Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }));

        var renderOptions = _engine.render.options;
        renderOptions.showAngleIndicator = true;
        renderOptions.showCollisions = true;
    };

    Demo.sleeping = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(50, 50, 12, 3, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.addComposite(_world, stack);

        _engine.enableSleeping = true;
        
        var renderOptions = _engine.render.options;
    };

    Demo.broadphase = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(20, 20, 20, 5, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
        renderOptions.showBroadphase = true;
    };

    Demo.gravity = function() {
        var _world = _engine.world;
        
        Demo.reset();

        _engine.world.gravity.y = -1;
        
        var stack = Composites.stack(20, 20, 20, 5, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
    };
    
    Demo.avalanche = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(20, 20, 20, 5, 0, 0, function(x, y, column, row) {
            return Bodies.circle(x, y, Common.random(10, 20), { friction: 0.00001, restitution: 0.5, density: 0.001 });
        });
        
        World.addComposite(_world, stack);
        
        World.addBody(_world, Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(500, 350, 700, 20, { isStatic: true, angle: -Math.PI * 0.06 }));
        World.addBody(_world, Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04 }));
    };
    
    Demo.newtonsCradle = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var cradle = Composites.newtonsCradle(300, 100, 5, 30, 200);
        World.addComposite(_world, cradle);
        Body.translate(cradle.bodies[0], { x: -180, y: -100 });
        
        cradle = Composites.newtonsCradle(250, 400, 7, 20, 140);
        World.addComposite(_world, cradle);
        Body.translate(cradle.bodies[0], { x: -140, y: -100 });
        
        var renderOptions = _engine.render.options;
        renderOptions.showVelocity = true;
        renderOptions.showAngleIndicator = false;
    };
    
    Demo.stack = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(100, 100, 10, 5, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
    };
    
    Demo.circleStack = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(100, 100, 10, 10, 20, 0, function(x, y, column, row) {
            return Bodies.circle(x, y, 20);
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
    };
    
    Demo.wreckingBall = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var rows = 10,
            yy = 600 - 21 - 40 * rows;
        
        var stack = Composites.stack(400, yy, 5, rows, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 40, 40, { friction: 0.9, restitution: 0.1 });
        });
        
        World.addComposite(_world, stack);
        
        var ball = Bodies.circle(100, 400, 50, { density: 0.07, frictionAir: 0.001});
        
        World.addBody(_world, ball);
        World.addConstraint(_world, Constraint.create({
            pointA: { x: 300, y: 100 },
            bodyB: ball
        }));
        
        if (!_isMobile) {
            var renderOptions = _engine.render.options;
            renderOptions.showCollisions = true;
            renderOptions.showVelocity = true;
        }
    };
    
    Demo.ballPool = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(100, 50, 10, 15, 10, 10, function(x, y, column, row) {
            return Bodies.circle(x, y, Common.random(15, 30), { restitution: 0.6, friction: 0.1 });
        });
        
        World.addComposite(_world, stack);
        World.addBody(_world, Bodies.polygon(200, 560, 3, 60));
        World.addBody(_world, Bodies.polygon(400, 560, 5, 60));
        World.addBody(_world, Bodies.rectangle(600, 560, 80, 80));
        
        var renderOptions = _engine.render.options;
    };
    
    Demo.stress = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(90, 30, 18, 15, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 35, 35);
        });
        
        World.addComposite(_world, stack);

        var renderOptions = _engine.render.options;
        renderOptions.showAngleIndicator = false;
    };
    
    Demo.stress2 = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(100, 120, 25, 18, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 25, 25);
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
        renderOptions.showAngleIndicator = false;
    };
    
    Demo.pyramid = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.pyramid(100, 100, 15, 10, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.addComposite(_world, stack);
        
        var renderOptions = _engine.render.options;
    };
    
    Demo.restitution = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var rest = 0.9, 
            space = 600 / 5;
    
        World.addBody(_world, Bodies.rectangle(100 + space * 0, 150, 50, 50, { restitution: rest }));
        World.addBody(_world, Bodies.rectangle(100 + space * 1, 150, 50, 50, { restitution: rest, angle: -Math.PI * 0.15 }));
        World.addBody(_world, Bodies.rectangle(100 + space * 2, 150, 50, 50, { restitution: rest, angle: -Math.PI * 0.25 }));
        World.addBody(_world, Bodies.circle(100 + space * 3, 150, 25, { restitution: rest }));
        World.addBody(_world, Bodies.rectangle(100 + space * 5, 150, 180, 20, { restitution: rest, angle: -Math.PI * 0.5 }));
        
        var renderOptions = _engine.render.options;
        renderOptions.showCollisions = true;
        renderOptions.showVelocity = true;
        renderOptions.showAngleIndicator = true;
    };

    Demo.beachBalls = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(0, 100, 5, 1, 20, 0, function(x, y, column, row) {
            return Bodies.circle(x, y, 75, { restitution: 0.9 });
        });
        
        World.addComposite(_world, stack);
    };

    Demo.events = function() {
        var _world = _engine.world;
        
        Demo.reset();
        
        var stack = Composites.stack(50, 100, 8, 4, 50, 50, function(x, y, column, row) {
            return Bodies.circle(x, y, 15, { restitution: 1, render: { strokeStyle: '#777' } });
        });
        
        World.addComposite(_world, stack);

        var shakeScene = function(engine) {
            var bodies = Composite.allBodies(engine.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];

                if (!body.isStatic && body.position.y >= 500) {
                    var forceMagnitude = 0.01 * body.mass;

                    Body.applyForce(body, { x: 0, y: 0 }, { 
                        x: (forceMagnitude + Math.random() * forceMagnitude) * Common.choose([1, -1]), 
                        y: -forceMagnitude + Math.random() * -forceMagnitude
                    });
                }
            }
        };

        // an example of using beforeUpdate event on an engine
        Events.on(_engine, 'beforeUpdate', function(event) {
            var engine = event.source;

            // apply random forces every 5 secs
            if (event.timestamp % 5000 < 50)
                shakeScene(engine);
        });

        // an example of using collisionStart event on an engine
        Events.on(_engine, 'collisionStart', function(event) {
            var pairs = event.pairs;

            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                pair.bodyA.render.fillStyle = '#bbbbbb';
                pair.bodyB.render.fillStyle = '#bbbbbb';
            }
        });

        // an example of using collisionActive event on an engine
        Events.on(_engine, 'collisionActive', function(event) {
            var pairs = event.pairs;

            // change object colours to show those in an active collision (e.g. resting contact)
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                pair.bodyA.render.fillStyle = '#aaaaaa';
                pair.bodyB.render.fillStyle = '#aaaaaa';
            }
        });

        // an example of using collisionEnd event on an engine
        Events.on(_engine, 'collisionEnd', function(event) {
            var pairs = event.pairs;

            // change object colours to show those ending a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                pair.bodyA.render.fillStyle = '#999999';
                pair.bodyB.render.fillStyle = '#999999';
            }
        });

        // an example of using mouse events on an engine.input.mouse
        Events.on(_engine, 'mousedown', function(event) {
            var mousePosition = event.mouse.position;
            console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
            _engine.render.options.background = 'cornsilk';
            shakeScene(_engine);
        });

        // an example of using mouse events on an engine.input.mouse
        Events.on(_engine, 'mouseup', function(event) {
            var mousePosition = event.mouse.position;
            _engine.render.options.background = "white";
            console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);
        });

        var renderOptions = _engine.render.options;
        renderOptions.wireframes = false;
    };

    Demo.sprites = function() {
        var _world = _engine.world,
            offset = 10,
            options = { 
                isStatic: true,
                render: {
                    visible: false
                }
            };

        Demo.reset();
        _world.bodies = [];

        // these static walls will not be rendered in this sprites example, see options
        World.addBody(_world, Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, options));
        World.addBody(_world, Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, options));
        World.addBody(_world, Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, options));
        World.addBody(_world, Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, options));

        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y, column, row) {
            if (Math.random() > 0.35) {
                return Bodies.rectangle(x, y, 64, 64, {
                    render: {
                        strokeStyle: '#ffffff',
                        sprite: {
                            texture: './img/box.png',
                            xScale: 1,
                            yScale: 1
                        }
                    }
                });
            } else {
                return Bodies.circle(x, y, 46, {
                    density: 0.0005,
                    frictionAir: 0.06,
                    restitution: 0.3,
                    friction: 0.01,
                    render: {
                        sprite: {
                            texture: './img/ball.png',
                            xScale: 1,
                            yScale: 1
                        }
                    }
                });
            }
        });

        World.addComposite(_world, stack);

        var renderOptions = _engine.render.options;
        renderOptions.background = './img/wall-bg.jpg';
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
    };

})();