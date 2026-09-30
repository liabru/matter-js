var Example = Example || {};

Example.stress5 = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create({
        velocityIterations: 6,
    });

    var world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showStats: true,
            showPerformance: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create({
        delta: 1000 / (60 * 3)
    });
    
    Runner.run(runner, engine);

    // add bodies
    let scale = 0.2;

    var opts = {
        friction: 0.2,
        frictionStatic: 0.4
    };

    for (var i = 0; i < 2; i += 1) {
        var stack = Composites.stack(40, 40, 62, 28, 0, 0, function(x, y) {
            var sides = Math.round(Common.random(1, 8));
    
            switch (Math.round(Common.random(0, 1))) {
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(
                        x, y, Common.random(25, 50) * scale, Common.random(25, 50) * scale, opts);
                } else {
                    return Bodies.rectangle(
                        x, y, Common.random(80, 120) * scale, Common.random(25, 30) * scale, opts);
                }
            case 1:
                return Bodies.polygon(x, y, sides, Common.random(25, 50) * scale, opts);
            }
        });
    
        Composite.add(world, stack);
    }

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, -25, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 625, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
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

Example.stress5.title = 'Stress 5';
Example.stress5.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.stress5;
}
