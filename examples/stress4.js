var Example = Example || {};

Example.stress4 = function() {
    var Engine = Matter.Engine,
        Events = Matter.Events,
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
        positionIterations: 25,
        velocityIterations: 35
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
    var runner = Runner.create();

    Runner.run(runner, engine);

    // add bodies
    var stack = function(scale, columns, rows) {
        return Composites.stack(40, 40, columns, rows, 0, 0, function(x, y) {
            var sides = Math.round(Common.random(1, 8));

            switch (Math.round(Common.random(0, 1))) {
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(25, 50) * scale, Common.random(25, 50) * scale);
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120) * scale, Common.random(25, 30) * scale);
                }
            case 1:
                return Bodies.polygon(x, y, sides, Common.random(25, 50) * scale);
            }
        });
    };

    Composite.add(world, [
        stack(0.2, 61, 15), 
        stack(0.3, 31, 12),
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, render: { visible: false } })
    ]);

    // scene animation
    engine.timing.timeScale = 0.9;
    engine.gravity.scale = 0.0007;

    Events.on(engine, 'beforeUpdate', function() {
        engine.gravity.x = Math.cos(engine.timing.timestamp * 0.0005);
        engine.gravity.y = Math.sin(engine.timing.timestamp * 0.0005);
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

Example.stress4.title = 'Stress 4';
Example.stress4.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.stress4;
}
