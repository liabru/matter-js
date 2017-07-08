var Example = Example || {};

Example.manipulation = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
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
            showAxes: true,
            showCollisions: true,
            showConvexHulls: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var bodyA = Bodies.rectangle(100, 200, 50, 50, { isStatic: true }),
        bodyB = Bodies.rectangle(200, 200, 50, 50),
        bodyC = Bodies.rectangle(300, 200, 50, 50),
        bodyD = Bodies.rectangle(400, 200, 50, 50),
        bodyE = Bodies.rectangle(550, 200, 50, 50),
        bodyF = Bodies.rectangle(700, 200, 50, 50),
        bodyG = Bodies.circle(400, 100, 25),
        partA = Bodies.rectangle(600, 200, 120, 50),
        partB = Bodies.rectangle(660, 200, 50, 190),
        compound = Body.create({
            parts: [partA, partB],
            isStatic: true
        });

    World.add(world, [bodyA, bodyB, bodyC, bodyD, bodyE, bodyF, bodyG, compound]);

    World.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var counter = 0,
        scaleFactor = 1.01;

    Events.on(engine, 'beforeUpdate', function(event) {
        counter += 1;

        if (counter === 40)
            Body.setStatic(bodyG, true);

        if (scaleFactor > 1) {
            Body.scale(bodyF, scaleFactor, scaleFactor);
            Body.scale(compound, 0.995, 0.995);

            // modify bodyE vertices
            bodyE.vertices[0].x -= 0.2;
            bodyE.vertices[0].y -= 0.2;
            bodyE.vertices[1].x += 0.2;
            bodyE.vertices[1].y -= 0.2;
            Body.setVertices(bodyE, bodyE.vertices);
        }

        // make bodyA move up and down
        // body is static so must manually update velocity for friction to work
        var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);
        Body.setVelocity(bodyA, { x: 0, y: py - bodyA.position.y });
        Body.setPosition(bodyA, { x: 100, y: py });

        // make compound body move up and down and rotate constantly
        Body.setVelocity(compound, { x: 0, y: py - compound.position.y });
        Body.setAngularVelocity(compound, 0.02);
        Body.setPosition(compound, { x: 600, y: py });
        Body.rotate(compound, 0.02);

        // every 1.5 sec
        if (counter >= 60 * 1.5) {
            Body.setVelocity(bodyB, { x: 0, y: -10 });
            Body.setAngle(bodyC, -Math.PI * 0.26);
            Body.setAngularVelocity(bodyD, 0.2);

            // reset counter
            counter = 0;
            scaleFactor = 1;
        }
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