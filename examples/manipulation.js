var Example = Example || {};

Example.manipulation = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
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
    var bodyA = Bodies.rectangle(100, 300, 50, 50, { isStatic: true, render: { fillStyle: '#060a19' } }),
        bodyB = Bodies.rectangle(200, 200, 50, 50),
        bodyC = Bodies.rectangle(300, 200, 50, 50),
        bodyD = Bodies.rectangle(400, 200, 50, 50),
        bodyE = Bodies.rectangle(550, 200, 50, 50),
        bodyF = Bodies.rectangle(700, 200, 50, 50),
        bodyG = Bodies.circle(400, 100, 25, { render: { fillStyle: '#060a19' } });

    // add compound body
    var partA = Bodies.rectangle(600, 200, 120 * 0.8, 50 * 0.8, { render: { fillStyle: '#060a19' } }),
        partB = Bodies.rectangle(660, 200, 50 * 0.8, 190 * 0.8, { render: { fillStyle: '#060a19' } }),
        compound = Body.create({
            parts: [partA, partB],
            isStatic: true
        });

    Body.setPosition(compound, { x: 600, y: 300 });

    Composite.add(world, [bodyA, bodyB, bodyC, bodyD, bodyE, bodyF, bodyG, compound]);

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var lastTime = 0,
        scaleRate = 0.6;

    Events.on(engine, 'beforeUpdate', function(event) {
        var timeScale = (event.delta || (1000 / 60)) / 1000;

        if (scaleRate > 0) {
            Body.scale(bodyF, 1 + (scaleRate * timeScale), 1 + (scaleRate * timeScale));

            // modify bodyE vertices
            bodyE.vertices[0].x -= 0.2 * timeScale;
            bodyE.vertices[0].y -= 0.2 * timeScale;
            bodyE.vertices[1].x += 0.2 * timeScale;
            bodyE.vertices[1].y -= 0.2 * timeScale;
            Body.setVertices(bodyE, bodyE.vertices);
        }

        // make bodyA move up and down
        var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);

        // manual update velocity required for older releases
        if (Matter.version === '0.18.0') {
            Body.setVelocity(bodyA, { x: 0, y: py - bodyA.position.y });
            Body.setVelocity(compound, { x: 0, y: py - compound.position.y });
            Body.setAngularVelocity(compound, 1 * Math.PI * timeScale);
        }

        // move body and update velocity
        Body.setPosition(bodyA, { x: 100, y: py }, true);

        // move compound body move up and down and update velocity
        Body.setPosition(compound, { x: 600, y: py }, true);

        // rotate compound body and update angular velocity
        Body.rotate(compound, 1 * Math.PI * timeScale, null, true);

        // after first 0.8 sec (simulation time)
        if (engine.timing.timestamp >= 800)
            Body.setStatic(bodyG, true);

        // every 1.5 sec (simulation time)
        if (engine.timing.timestamp - lastTime >= 1500) {
            Body.setVelocity(bodyB, { x: 0, y: -10 });
            Body.setAngle(bodyC, -Math.PI * 0.26);
            Body.setAngularVelocity(bodyD, 0.2);

            // stop scaling
            scaleRate = 0;
            
            // update last time
            lastTime = engine.timing.timestamp;
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

Example.manipulation.title = 'Manipulation';
Example.manipulation.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.manipulation;
}
