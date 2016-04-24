(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common;

    Example.mixedSolid = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(50, 50, 12, 3, 0, 0, function(x, y) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.add(world, stack);
        
        var renderOptions = demo.render.options;
        renderOptions.wireframes = false;
        renderOptions.showAngleIndicator = false;
    };

})();