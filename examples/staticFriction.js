var Example = Example || {};

Example.staticFriction = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composites = Matter.Composites,
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
            showVelocity: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var body = Bodies.rectangle(400, 500, 200, 60, { isStatic: true, chamfer: 10 }),
        size = 50,
        counter = -1;

    var stack = Composites.stack(350, 470 - 6 * size, 1, 6, 0, 0, function(x, y) {
        return Bodies.rectangle(x, y, size * 2, size, {
            slop: 0.5,
            friction: 1,
            frictionStatic: Infinity
        });
    });
    
    World.add(world, [
        body, 
        stack,
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    Events.on(engine, 'beforeUpdate', function(event) {
        counter += 0.014;

        if (counter < 0) {
            return;
        }

        var px = 400 + 100 * Math.sin(counter);

        // body is static so must manually update velocity for friction to work
        Body.setVelocity(body, { x: px - body.position.x, y: 0 });
        Body.setPosition(body, { x: px, y: body.position.y });
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