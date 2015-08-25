(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.pyramid = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var stack = Composites.pyramid(100, 258, 15, 10, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 40, 40);
        });
        
        World.add(world, stack);
    };

})();