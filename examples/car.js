(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites;

    Example.car = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            scale;
        
        scale = 0.9;
        World.add(world, Composites.car(150, 100, 100 * scale, 40 * scale, 30 * scale));
        
        scale = 0.8;
        World.add(world, Composites.car(350, 300, 100 * scale, 40 * scale, 30 * scale));
        
        World.add(world, [
            Bodies.rectangle(200, 150, 650, 20, { isStatic: true, angle: Math.PI * 0.06 }),
            Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
            Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04 })
        ]);
        
        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = true;
        renderOptions.showCollisions = true;
    };
    
})();