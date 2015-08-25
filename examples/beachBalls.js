(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.beachBalls = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var stack = Composites.stack(0, 100, 5, 1, 20, 0, function(x, y) {
            return Bodies.circle(x, y, 75, { restitution: 0.9 });
        });
        
        World.add(world, stack);
    };

})();