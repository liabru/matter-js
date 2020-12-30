var Example = Example || {};

Example.angleConstraints = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
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
        pointB: { x: 0, y: -10 },

        angleAStiffness: 1
    });

    World.add(world, [body, constraint]);

    // add soft global constraint
    var body = Bodies.polygon(280, 200, 3, 30);

    var constraint = Constraint.create({
        pointA: { x: 280, y: 120 },
        bodyB: body,
        pointB: { x: 0, y: -7 },
        stiffness: 0.001,

        angleA: 0,
        angleAStiffness: 0.01
    });

    World.add(world, [body, constraint]);

    // add damped soft global constraint
    var body = Bodies.polygon(400, 100, 4, 30);

    var constraint = Constraint.create({
        bodyA: body,
        pointA: { x: -10, y: -10 },
        pointB: { x: 400, y: 120 },
        stiffness: 0.001,
        damping: 0.05,

        angleBStiffness: 1,
        angleB: 0,
        angleBMin: -1,
        angleBMax: 1
    });

    World.add(world, [body, constraint]);

    // add revolute constraint
    var body = Bodies.rectangle(600, 200, 200, 20);
    var ball = Bodies.circle(550, 150, 20);

    var constraintR = Constraint.create({
        bodyA: body,
        pointB: { x: 600, y: 200 },
        length: 0,

        angleAStiffness: 1,
        angleAMin: -0.5,
        angleAMax: 0.5
    });

    World.add(world, [body, ball, constraintR]);

    // add revolute multi-body constraint
    var body = Bodies.rectangle(400, 400, 100, 20);
    var ball = Bodies.circle(500, 400, 20);

    var constraint = Constraint.create({
        bodyA: body,
        bodyB: ball,

        angleAStiffness: 0.9,
        angleBMin: -0.5,
        angleBMax: 0.5,
        angleBStiffness: 1
    });

    World.add(world, [body, ball, constraint]);

    // add stiff multi-body constraint
    var bodyA = Bodies.polygon(100, 400, 6, 20);
    var bodyB = Bodies.polygon(200, 400, 1, 50, { angle: -0.05 });

    var constraint = Constraint.create({
        bodyA: bodyA,
        pointA: { x: -10, y: -10 },
        bodyB: bodyB,
        pointB: { x: -10, y: -10 },

        angleAStiffness: 1,
        angleBMin: -0.5 - Math.PI,
        angleBMax: 0.5 - Math.PI,
        angleBStiffness: 1
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
        stiffness: 0.01,

        angleAMin: Math.PI * 0.1,
        angleAMax: Math.PI * 0.5,
        angleAStiffness: 0.1,
        angleBMin: -0.5 - Math.PI,
        angleBMax: 0.5 - Math.PI,
        angleBStiffness: 0.1
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
        damping: 0.1,

        angleAMin: Math.PI * 0.1,
        angleAMax: Math.PI * 0.5,
        angleAStiffness: 1,
        angleBMin: -0.5 - Math.PI,
        angleBMax: 0.5 - Math.PI,
        angleBStiffness: 0.01
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

if (typeof module !== 'undefined') {
    module.exports = Example[Object.keys(Example)[0]];
}