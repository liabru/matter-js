var Example = Example || {};

Example.substep = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Composite = Matter.Composite,
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
            wireframes: false,
            showDebug: true,
            background: '#000',
            pixelRatio: 2
        }
    });

    Render.run(render);

    // create runner with higher precision timestep (requires >= v0.20.0 beta)
    var runner = Runner.create({
        // 600Hz delta = 1.666ms = 10upf @ 60fps (i.e. 10x default precision)
        delta: 1000 / (60 * 10),
        // 50fps minimum performance target (i.e. budget allows up to ~20ms execution per frame)
        maxFrameTime: 1000 / 50
    });

    Runner.run(runner, engine);

    // demo substepping using very thin bodies (than is typically recommended)
    Composite.add(world, [
        Bodies.rectangle(250, 250, 300, 1.25, {
            frictionAir: 0, 
            friction: 0,
            restitution: 0.9,
            angle: 0.5,
            render: {
                lineWidth: 0.5,
                fillStyle: '#f55a3c'
            }
        }),
        Bodies.circle(200, 200, 2.25, {
            frictionAir: 0, 
            friction: 0,
            restitution: 0.9,
            angle: 0.5,
            render: {
                fillStyle: '#fff'
            }
        })
    ]);

    // add bodies
    Composite.add(world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: { visible: false } })
    ]);

    // scene animation
    Events.on(engine, 'afterUpdate', function(event) {
        engine.gravity.scale = 0.00035;
        engine.gravity.x = Math.cos(engine.timing.timestamp * 0.0005);
        engine.gravity.y = Math.sin(engine.timing.timestamp * 0.0005);
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

Example.substep.title = 'High Substeps (Low Delta)';
Example.substep.for = '>=0.20.0';

if (typeof module !== 'undefined') {
    module.exports = Example.substep;
}