var Example = Example || {};

Example.timescale = function() {
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
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var explosion = function(engine, delta) {
        var timeScale = (1000 / 60) / delta;
        var bodies = Composite.allBodies(engine.world);

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isStatic && body.position.y >= 500) {
                // scale force for mass and time applied
                var forceMagnitude = (0.05 * body.mass) * timeScale;

                // apply the force over a single update
                Body.applyForce(body, body.position, {
                    x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                    y: -forceMagnitude + Common.random() * -forceMagnitude
                });
            }
        }
    };

    var timeScaleTarget = 1,
        lastTime = Common.now();

    Events.on(engine, 'afterUpdate', function(event) {
        var timeScale = (event.delta || (1000 / 60)) / 1000;

        // tween the timescale for bullet time slow-mo
        engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 12 * timeScale;

        // every 2 sec (real time)
        if (Common.now() - lastTime >= 2000) {

            // flip the timescale
            if (timeScaleTarget < 1) {
                timeScaleTarget = 1;
            } else {
                timeScaleTarget = 0;
            }

            // create some random forces
            explosion(engine, event.delta);

            // update last time
            lastTime = Common.now();
        }
    });

    var bodyOptions = {
        frictionAir: 0, 
        friction: 0.0001,
        restitution: 0.8
    };
    
    Composite.add(world, Composites.stack(20, 100, 15, 3, 20, 40, function(x, y) {
        return Bodies.circle(x, y, Common.random(10, 20), bodyOptions);
    }));

    Composite.add(world, Composites.stack(50, 50, 8, 3, 0, 0, function(x, y) {
        switch (Math.round(Common.random(0, 1))) {

        case 0:
            if (Common.random() < 0.8) {
                return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50), bodyOptions);
            } else {
                return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), bodyOptions);
            }
        case 1:
            return Bodies.polygon(x, y, Math.round(Common.random(4, 8)), Common.random(20, 50), bodyOptions);

        }
    }));

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

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

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

Example.timescale.title = 'Time Scaling';
Example.timescale.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.timescale;
}