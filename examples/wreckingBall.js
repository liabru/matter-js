(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint;

    Example.wreckingBall = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var rows = 10,
            yy = 600 - 21 - 40 * rows;
        
        var stack = Composites.stack(400, yy, 5, rows, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.add(world, stack);
        
        var ball = Bodies.circle(100, 400, 50, { density: 0.04, frictionAir: 0.005});
        
        World.add(world, ball);
        World.add(world, Constraint.create({
            pointA: { x: 300, y: 100 },
            bodyB: ball
        }));
    };

})();