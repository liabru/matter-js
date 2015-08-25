(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composites = Matter.Composites;

    Example.cloth = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var group = Body.nextGroup(true),
            particleOptions = { friction: 0.00001, collisionFilter: { group: group }, render: { visible: false }},
            cloth = Composites.softBody(200, 200, 20, 12, 5, 5, false, 8, particleOptions);

        for (var i = 0; i < 20; i++) {
            cloth.bodies[i].isStatic = true;
        }

        World.add(world, [
            cloth,
            Bodies.circle(300, 500, 80, { isStatic: true }),
            Bodies.rectangle(500, 480, 80, 80, { isStatic: true })
        ]);
    };

})();