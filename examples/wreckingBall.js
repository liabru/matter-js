var Example = Example || {};

Example.wreckingBall = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Constraint = Matter.Constraint,
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
            height: Math.min(document.body.clientHeight, 1024),
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var rows = 10,
        yy = 600 - 21 - 40 * rows;
    
    var stack = Composites.stack(400, yy, 5, rows, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, 40, 40);
    });
    
    World.add(world, [
        stack,
        Bodies.rectangle(400, 600, 800, 50.5, { isStatic: true })
    ]);
    
    var ball = Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005});
    
    World.add(world, ball);
    World.add(world, Constraint.create({
        pointA: { x: 300, y: 100 },
        bodyB: ball
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

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, Composite.allBodies(world));

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