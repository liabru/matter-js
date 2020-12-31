var Example = Example || {};

Example.rounded = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
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
            showAxes: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    World.add(world, [
        // walls
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    World.add(world, [
        Bodies.rectangle(200, 200, 100, 100, { 
            chamfer: { radius: 20 }
        }),

        Bodies.rectangle(300, 200, 100, 100, { 
            chamfer: { radius: [90, 0, 0, 0] }
        }),

        Bodies.rectangle(400, 200, 200, 200, { 
            chamfer: { radius: [150, 20, 40, 20] }
        }),

        Bodies.rectangle(200, 200, 200, 200, { 
            chamfer: { radius: [150, 20, 150, 20] }
        }),

        Bodies.rectangle(300, 200, 200, 50, { 
            chamfer: { radius: [25, 25, 0, 0] }
        }),

        Bodies.polygon(200, 100, 8, 80, { 
            chamfer: { radius: 30 }
        }),

        Bodies.polygon(300, 100, 5, 80, { 
            chamfer: { radius: [10, 40, 20, 40, 10] }
        }),

        Bodies.polygon(400, 200, 3, 50, { 
            chamfer: { radius: [20, 0, 20] }
        })
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

Example.rounded.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.rounded;
}
