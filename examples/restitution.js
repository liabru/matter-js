(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies;

    Example.restitution = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var rest = 0.9, 
            space = 600 / 5;
        
        World.add(world, [
            Bodies.rectangle(100 + space * 0, 150, 50, 50, { restitution: rest }),
            Bodies.rectangle(100 + space * 1, 150, 50, 50, { restitution: rest, angle: -Math.PI * 0.15 }),
            Bodies.rectangle(100 + space * 2, 150, 50, 50, { restitution: rest, angle: -Math.PI * 0.25 }),
            Bodies.circle(100 + space * 3, 150, 25, { restitution: rest }),
            Bodies.rectangle(100 + space * 5, 150, 180, 20, { restitution: rest, angle: -Math.PI * 0.5 })
        ]);
        
        var renderOptions = demo.render.options;
        renderOptions.showCollisions = true;
        renderOptions.showVelocity = true;
        renderOptions.showAngleIndicator = true;
    };

})();