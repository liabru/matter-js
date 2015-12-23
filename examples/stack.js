(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.stack = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(100, 380, 10, 5, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.add(world, stack);
    };

})();
