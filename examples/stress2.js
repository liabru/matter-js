(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.stress2 = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(100, 120, 25, 18, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 25, 25);
        });
        
        World.add(world, stack);
        
        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
    };

})();