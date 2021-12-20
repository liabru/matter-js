var Example = Example || {};

Example.compositeManipulation = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
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
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var stack = Composites.stack(200, 200, 4, 4, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 40, 40);
    });

    Composite.add(world, stack);

    engine.gravity.y = 0;

    Events.on(engine, 'afterUpdate', function(event) {
        var time = engine.timing.timestamp,
            timeScale = (event.delta || (1000 / 60)) / 1000;

        Composite.translate(stack, {
            x: Math.sin(time * 0.001) * 10 * timeScale,
            y: 0
        });

        Composite.rotate(stack, Math.sin(time * 0.001) * 0.75 * timeScale, {
            x: 300,
            y: 300
        });

        var scale = 1 + (Math.sin(time * 0.001) * 0.75 * timeScale);

        Composite.scale(stack, scale, scale, {
            x: 300,
            y: 300
        });
    });

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

Example.compositeManipulation.title = 'Composite Manipulation';
Example.compositeManipulation.for = '>0.16.1';

if (typeof module !== 'undefined') {
    module.exports = Example.compositeManipulation;
}
