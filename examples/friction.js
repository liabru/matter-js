(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies;

    Example.friction = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        World.add(world, [
            Bodies.rectangle(300, 180, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
            Bodies.rectangle(300, 70, 40, 40, { friction: 0.001 })
        ]);

        World.add(world, [
            Bodies.rectangle(300, 350, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
            Bodies.rectangle(300, 250, 40, 40, { friction: 0.0005 })
        ]);

        World.add(world, [
            Bodies.rectangle(300, 520, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
            Bodies.rectangle(300, 430, 40, 40, { friction: 0 })
        ]);

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.showVelocity = true;
    };
    
})();