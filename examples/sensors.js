var Example = Example || {};

Example.sensors = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
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
            wireframes: false,
            background: '#111'
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var redColor = '#C44D58',
        greenColor = '#C7F464';

    var collider = Bodies.rectangle(400, 300, 500, 50, {
        isSensor: true,
        isStatic: true,
        render: {
            strokeStyle: redColor,
            fillStyle: 'transparent',
            lineWidth: 1
        }
    });

    World.add(world, [
        collider,
        Bodies.rectangle(400, 620, 800, 50, { 
            isStatic: true,
            render: {
                fillStyle: 'transparent',
                lineWidth: 1
            }
        })
    ]);

    World.add(world,
        Bodies.circle(400, 40, 30, {
            render: {
                strokeStyle: greenColor,
                fillStyle: 'transparent',
                lineWidth: 1
            }
        })
    );

    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];

            if (pair.bodyA === collider) {
                pair.bodyB.render.strokeStyle = redColor;
            } else if (pair.bodyB === collider) {
                pair.bodyA.render.strokeStyle = redColor;
            }
        }
    });

    Events.on(engine, 'collisionEnd', function(event) {
        var pairs = event.pairs;
        
        for (var i = 0, j = pairs.length; i != j; ++i) {
            var pair = pairs[i];

            if (pair.bodyA === collider) {
                pair.bodyB.render.strokeStyle = greenColor;
            } else if (pair.bodyB === collider) {
                pair.bodyA.render.strokeStyle = greenColor;
            }
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