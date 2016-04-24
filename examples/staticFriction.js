(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composites = Matter.Composites,
        Events = Matter.Events;

    Example.staticFriction = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents;

        var body = Bodies.rectangle(400, 500, 200, 60, { isStatic: true, chamfer: 10 }),
            size = 50,
            counter = -1;

        var stack = Composites.stack(350, 470 - 6 * size, 1, 6, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, size * 2, size, {
                slop: 0.5,
                friction: 1,
                frictionStatic: Infinity
            });
        });
        
        World.add(world, [body, stack]);

        sceneEvents.push(
            Events.on(engine, 'beforeUpdate', function(event) {
                counter += 0.014;

                if (counter < 0) {
                    return;
                }

                var px = 400 + 100 * Math.sin(counter);

                // body is static so must manually update velocity for friction to work
                Body.setVelocity(body, { x: px - body.position.x, y: 0 });
                Body.setPosition(body, { x: px, y: body.position.y });
            })
        );

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.showVelocity = true;
    };
    
})();