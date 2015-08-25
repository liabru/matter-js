(function() {

    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Query = Matter.Query,
        Svg = Matter.Svg;

    Example.wreckingBall = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            mouseConstraint = demo.mouseConstraint;
        
        var rows = 10,
            yy = 600 - 21 - 40 * rows;
        
        var stack = Composites.stack(400, yy, 5, rows, 0, 0, function(x, y, column, row) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.add(world, stack);
        
        var ball = Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005});
        
        World.add(world, ball);
        World.add(world, Constraint.create({
            pointA: { x: 300, y: 100 },
            bodyB: ball
        }));
        
        if (!demo.isMobile) {
            var renderOptions = engine.render.options;
            renderOptions.showCollisions = true;
            renderOptions.showVelocity = true;
        }
    };

})();