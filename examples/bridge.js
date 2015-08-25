(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint;

    Example.bridge = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            group = Body.nextGroup(true);
        
        var bridge = Composites.stack(150, 300, 9, 1, 10, 10, function(x, y) {
            return Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
        });
        
        Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.9 });
        
        var stack = Composites.stack(200, 40, 6, 3, 0, 0, function(x, y) {
            return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 40));
        });

        World.add(world, [
            bridge,
            Bodies.rectangle(80, 440, 120, 280, { isStatic: true }),
            Bodies.rectangle(720, 440, 120, 280, { isStatic: true }),
            Constraint.create({ pointA: { x: 140, y: 300 }, bodyB: bridge.bodies[0], pointB: { x: -25, y: 0 } }),
            Constraint.create({ pointA: { x: 660, y: 300 }, bodyB: bridge.bodies[8], pointB: { x: 25, y: 0 } }),
            stack
        ]);
    };
    
})();