var Example = Example || {};

Example.bridge = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
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
            width: Math.min(document.documentElement.clientWidth, 800),
            height: Math.min(document.documentElement.clientHeight, 600),
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var group = Body.nextGroup(true);

    var bridge = Composites.stack(150, 300, 9, 1, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
    });
    
    Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.9 });
    
    var stack = Composites.stack(200, 40, 6, 3, 0, 0, function(x, y) {
        return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 40));
    });

    World.add(world, [
        bridge,
        Bodies.rectangle(80, 440, 120, 280, { isStatic: true }),
        Bodies.rectangle(720, 440, 120, 280, { isStatic: true }),
        Constraint.create({ pointA: { x: 140, y: 300 }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 } }),
        Constraint.create({ pointA: { x: 660, y: 300 }, bodyB: bridge.bodies[8], pointB: { x: 25, y: 0 } }),
        stack
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