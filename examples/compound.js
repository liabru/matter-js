var Example = Example || {};

Example.compound = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
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
            showAxes: true,
            showConvexHulls: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var size = 200,
        x = 200,
        y = 200,
        partA = Bodies.rectangle(x, y, size, size / 5),
        partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    var compoundBodyA = Body.create({
        parts: [partA, partB]
    });

    size = 150;
    x = 400;
    y = 300;

    var partC = Bodies.circle(x, y, 30),
        partD = Bodies.circle(x + size, y, 30),
        partE = Bodies.circle(x + size, y + size, 30),
        partF = Bodies.circle(x, y + size, 30);

    var compoundBodyB = Body.create({
        parts: [partC, partD, partE, partF]
    });

    var constraint = Constraint.create({
        pointA: { x: 400, y: 100 },
        bodyB: compoundBodyB,
        pointB: { x: 0, y: 0 }
    });

    World.add(world, [
        compoundBodyA, 
        compoundBodyB, 
        constraint,
        Bodies.rectangle(400, 600, 800, 50.5, { isStatic: true })
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

Example.compound.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.compound;
}
