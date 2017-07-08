var Example = Example || {};

Example.constraints = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
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
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add stiff global constraint
    var body = Bodies.polygon(150, 200, 5, 30);

    var constraint = Constraint.create({
        pointA: { x: 150, y: 100 },
        bodyB: body,
        pointB: { x: -10, y: -10 }
    });

    World.add(world, [body, constraint]);

    // add soft global constraint
    var body = Bodies.polygon(280, 100, 3, 30);

    var constraint = Constraint.create({
        pointA: { x: 280, y: 120 },
        bodyB: body,
        pointB: { x: -10, y: -7 },
        stiffness: 0.001
    });

    World.add(world, [body, constraint]);

    // add damped soft global constraint
    var body = Bodies.polygon(400, 100, 4, 30);

    var constraint = Constraint.create({
        pointA: { x: 400, y: 120 },
        bodyB: body,
        pointB: { x: -10, y: -10 },
        stiffness: 0.001,
        damping: 0.05
    });

    World.add(world, [body, constraint]);

    // add revolute constraint
    var body = Bodies.rectangle(600, 200, 200, 20);
    var ball = Bodies.circle(550, 150, 20);

    var constraint = Constraint.create({
        pointA: { x: 600, y: 200 },
        bodyB: body,
        length: 0
    });

    World.add(world, [body, ball, constraint]);

    // add revolute multi-body constraint
    var body = Bodies.rectangle(500, 400, 100, 20, { collisionFilter: { group: -1 } });
    var ball = Bodies.circle(600, 400, 20, { collisionFilter: { group: -1 } });

    var constraint = Constraint.create({
        bodyA: body,
        bodyB: ball
    });

    World.add(world, [body, ball, constraint]);

    // add stiff multi-body constraint
    var bodyA = Bodies.polygon(100, 400, 6, 20);
    var bodyB = Bodies.polygon(200, 400, 1, 50);

    var constraint = Constraint.create({
        bodyA: bodyA,
        pointA: { x: -10, y: -10 },
        bodyB: bodyB,
        pointB: { x: -10, y: -10 }
    });

    World.add(world, [bodyA, bodyB, constraint]);

    // add soft global constraint
    var bodyA = Bodies.polygon(300, 400, 4, 20);
    var bodyB = Bodies.polygon(400, 400, 3, 30);

    var constraint = Constraint.create({
        bodyA: bodyA,
        pointA: { x: -10, y: -10 },
        bodyB: bodyB,
        pointB: { x: -10, y: -7 },
        stiffness: 0.001
    });

    World.add(world, [bodyA, bodyB, constraint]);

    // add damped soft global constraint
    var bodyA = Bodies.polygon(500, 400, 6, 30);
    var bodyB = Bodies.polygon(600, 400, 7, 60);

    var constraint = Constraint.create({
        bodyA: bodyA,
        pointA: { x: -10, y: -10 },
        bodyB: bodyB,
        pointB: { x: -10, y: -10 },
        stiffness: 0.001,
        damping: 0.1
    });

    World.add(world, [bodyA, bodyB, constraint]);

    World.add(world, [
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
                // allow bodies on mouse to rotate
                angularStiffness: 0,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);

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