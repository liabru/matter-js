var Example = Example || {};

Example.events = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // an example of using composite events on the world
    Events.on(world, 'afterAdd', function(event) {
        console.log('added to world:', event.object);
    });

    // an example of using beforeUpdate event on an engine
    Events.on(engine, 'beforeUpdate', function(event) {
        var engine = event.source;

        // apply random forces every 5 secs
        if (event.timestamp % 5000 < 50)
            shakeScene(engine);
    });

    // an example of using collisionStart event on an engine
    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;

        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            pair.bodyA.render.fillStyle = '#333';
            pair.bodyB.render.fillStyle = '#333';
        }
    });

    // an example of using collisionActive event on an engine
    Events.on(engine, 'collisionActive', function(event) {
        var pairs = event.pairs;

        // change object colours to show those in an active collision (e.g. resting contact)
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            pair.bodyA.render.fillStyle = '#333';
            pair.bodyB.render.fillStyle = '#333';
        }
    });

    // an example of using collisionEnd event on an engine
    Events.on(engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;

        // change object colours to show those ending a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];

            pair.bodyA.render.fillStyle = '#222';
            pair.bodyB.render.fillStyle = '#222';
        }
    });

    var bodyStyle = { fillStyle: '#222' };

    // scene code
    World.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: bodyStyle }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: bodyStyle })
    ]);

    var stack = Composites.stack(70, 100, 9, 4, 50, 50, function(x, y) {
        return Bodies.circle(x, y, 15, { restitution: 1, render: bodyStyle });
    });
    
    World.add(world, stack);

    var shakeScene = function(engine) {
        var bodies = Composite.allBodies(engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isStatic && body.position.y >= 500) {
                var forceMagnitude = 0.02 * body.mass;

                Body.applyForce(body, body.position, { 
                    x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                    y: -forceMagnitude + Common.random() * -forceMagnitude
                });
            }
        }
    };

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'mousedown', function(event) {
        var mousePosition = event.mouse.position;
        console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
        shakeScene(engine);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'mouseup', function(event) {
        var mousePosition = event.mouse.position;
        console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'startdrag', function(event) {
        console.log('startdrag', event);
    });

    // an example of using mouse events on a mouse
    Events.on(mouseConstraint, 'enddrag', function(event) {
        console.log('enddrag', event);
    });

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};