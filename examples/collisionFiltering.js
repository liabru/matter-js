var Example = Example || {};

Example.collisionFiltering = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
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

    // define our categories (as bit fields, there are up to 32 available)
    var defaultCategory = 0x0001,
        redCategory = 0x0002,
        greenCategory = 0x0004,
        blueCategory = 0x0008;

    var redColor = '#C44D58',
        blueColor = '#4ECDC4',
        greenColor = '#C7F464';

    // add floor
    World.add(world, Bodies.rectangle(400, 600, 900, 50, { 
        isStatic: true,
        render: {
            fillStyle: 'transparent',
            lineWidth: 1
        } 
    }));

    // create a stack with varying body categories (but these bodies can all collide with each other)
    World.add(world,
        Composites.stack(275, 100, 5, 9, 10, 10, function(x, y, column, row) {
            var category = redCategory,
                color = redColor;

            if (row > 5) {
                category = blueCategory;
                color = blueColor;
            } else if (row > 2) {
                category = greenCategory;
                color = greenColor;
            }

            return Bodies.circle(x, y, 20, {
                collisionFilter: {
                    category: category
                },
                render: {
                    strokeStyle: color,
                    fillStyle: 'transparent',
                    lineWidth: 1
                }
            });
        })
    );

    // this body will only collide with the walls and the green bodies
    World.add(world,
        Bodies.circle(310, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | greenCategory
            },
            render: {
                fillStyle: greenColor
            }
        })
    );

    // this body will only collide with the walls and the red bodies
    World.add(world,
        Bodies.circle(400, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | redCategory
            },
            render: {
                fillStyle: redColor
            }
        })
    );

    // this body will only collide with the walls and the blue bodies
    World.add(world,
        Bodies.circle(480, 40, 30, {
            collisionFilter: {
                mask: defaultCategory | blueCategory
            },
            render: {
                fillStyle: blueColor
            }
        })
    );

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

    // red category objects should not be draggable with the mouse
    mouseConstraint.collisionFilter.mask = defaultCategory | blueCategory | greenCategory;

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