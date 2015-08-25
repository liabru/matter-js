(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common;

    Example.avalanche = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var stack = Composites.stack(20, 20, 20, 5, 0, 0, function(x, y) {
            return Bodies.circle(x, y, Common.random(10, 20), { friction: 0.00001, restitution: 0.5, density: 0.001 });
        });
        
        World.add(world, stack);
        
        World.add(world, [
            Bodies.rectangle(200, 150, 700, 20, { isStatic: true, angle: Math.PI * 0.06 }),
            Bodies.rectangle(500, 350, 700, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
            Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04 })
        ]);
    };

})();