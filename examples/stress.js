(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.stress = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(90, 50, 18, 15, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 35, 35);
        });
        
        World.add(world, stack);

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
    };

})();