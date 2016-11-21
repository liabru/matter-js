var Example = Example || {};

Example.attractors = function() {
    Matter.use(
        'matter-gravity', 
        'matter-wrap'
    );

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composite = Matter.Composite,
        Body = Matter.Body,
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
            width: Math.min(document.body.clientWidth, 1024),
            height: Math.min(document.body.clientHeight, 1024)
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    world.bodies = [];
    world.gravity.scale = 0;

    var G = 0.001;

    for (var i = 0; i < 200; i += 1) {
        var body = Bodies.circle(
            Common.random(10, render.options.width), 
            Common.random(10, render.options.height),
            Common.random(4, 10),
            {
                mass: Common.random(10, 20),
                gravity: G,
                frictionAir: 0,
                wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: render.options.width, y: render.options.height }
                }
            }
        );

        Body.setVelocity(body, { 
            x: Common.random(-2, 2), 
            y: Common.random(-2, 2)
        });

        World.add(world, body);
    }

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