var Example = Example || {};

Example.chains = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
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
            showAngleIndicator: true,
            showCollisions: true,
            showVelocity: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var group = Body.nextGroup(true);
        
    var ropeA = Composites.stack(200, 100, 4, 2, 10, 10, function(x, y) {
        return Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
    });
    
    Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });
    Composite.add(ropeA, Constraint.create({ 
        bodyB: ropeA.bodies[0],
        pointB: { x: -25, y: 0 },
        pointA: { x: 200, y: 100 },
        stiffness: 0.5
    }));
    
    World.add(world, ropeA);
    
    group = Body.nextGroup(true);
    
    var ropeB = Composites.stack(500, 100, 5, 2, 10, 10, function(x, y) {
        return Bodies.circle(x, y, 20, { collisionFilter: { group: group } });
    });
    
    Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });
    Composite.add(ropeB, Constraint.create({ 
        bodyB: ropeB.bodies[0],
        pointB: { x: -20, y: 0 },
        pointA: { x: 500, y: 100 },
        stiffness: 0.5
    }));
    
    World.add(world, ropeB);

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
        max: { x: 700, y: 600 }
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