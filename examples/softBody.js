(function() {

    var World = Matter.World,
        Composites = Matter.Composites;

    Example.softBody = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var particleOptions = { 
            friction: 0.05,
            frictionStatic: 0.1,
            render: { visible: true } 
        };

        World.add(world, [
            Composites.softBody(250, 100, 5, 5, 0, 0, true, 18, particleOptions),
            Composites.softBody(400, 300, 8, 3, 0, 0, true, 15, particleOptions),
            Composites.softBody(250, 400, 4, 4, 0, 0, true, 15, particleOptions)
        ]);

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
    };

})();
