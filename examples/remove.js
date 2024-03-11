var Example = Example || {};

Example.remove = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies,
        Events = Matter.Events;

    // create engine
    var engine = Engine.create({
        enableSleeping: true
    });

    var world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true,
            showSleeping: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    var createStack = function() {
        return Composites.stack(20, 20, 10, 5, 0, 0, function(x, y) {
            var sides = Math.round(Common.random(1, 8));

            // round the edges of some bodies
            var chamfer = null;
            if (sides > 2 && Common.random() > 0.7) {
                chamfer = {
                    radius: 10
                };
            }

            switch (Math.round(Common.random(0, 1))) {
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer });
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer });
                }
            case 1:
                return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer });
            }
        });
    };

    var stack = null,
        bottomStack = createStack(),
        lastTimestamp = 0;

    // add and remove bodies and composites every few updates
    Events.on(engine, 'afterUpdate', function(event) {
        // limit rate
        if (event.timestamp - lastTimestamp < 800) {
            return;
        }

        lastTimestamp = event.timestamp;

        // remove an old body
        Composite.remove(bottomStack, bottomStack.bodies[0]);

        // add a new body
        Composite.add(
            bottomStack, 
            Bodies.rectangle(Common.random(100, 500), 50, Common.random(25, 50), Common.random(25, 50))
        );

        // remove last stack
        if (stack) {
            Composite.remove(world, stack);
        }

        // create a new stack
        stack = createStack();

        // add the new stack
        Composite.add(world, stack);
    });

    Composite.add(world, [
        bottomStack,

        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

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

Example.remove.title = 'Composite Remove';
Example.remove.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.remove;
}
