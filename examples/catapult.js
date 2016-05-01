(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint;

    Example.catapult = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(250, 255, 1, 6, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 30, 30);
        });

        var catapult = Bodies.rectangle(400, 520, 320, 20, {  });

        World.add(world, [
            stack,
            catapult,
            Bodies.rectangle(250, 555, 20, 50, { isStatic: true }),
            Bodies.circle(560, 100, 50, { density: 0.005 }),
            Constraint.create({ bodyA: catapult, pointB: { x: 390, y: 580 } }),
            Constraint.create({ bodyA: catapult, pointB: { x: 410, y: 580 } })
        ]);
        
        var renderOptions = demo.render.options;
        renderOptions.showCollisions = true;
        renderOptions.showVelocity = true;
        renderOptions.showAngleIndicator = true;
    };

})();