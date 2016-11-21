var Example = Example || {};

Example.terrain = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Vertices = Matter.Vertices,
        Query = Matter.Query,
        Svg = Matter.Svg,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: Math.min(document.body.clientWidth, 1024),
            height: Math.min(document.body.clientHeight, 1024)
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var terrain;

    $.get('./svg/terrain.svg').done(function(data) {
        var vertexSets = [],
            color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

        $(data).find('path').each(function(i, path) {
            vertexSets.push(Svg.pathToVertices(path, 30));
        });

        terrain = Bodies.fromVertices(400, 350, vertexSets, {
            isStatic: true,
            render: {
                fillStyle: color,
                strokeStyle: color
            }
        }, true);

        World.add(world, terrain);

        var bodyOptions = {
            frictionAir: 0, 
            friction: 0.0001,
            restitution: 0.6
        };
        
        World.add(world, Composites.stack(80, 100, 20, 20, 10, 10, function(x, y) {
            if (Query.point([terrain], { x: x, y: y }).length === 0) {
                return Bodies.polygon(x, y, 5, 12, bodyOptions);
            }
        }));
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