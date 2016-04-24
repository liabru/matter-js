(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Events = Matter.Events;

    Example.compositeManipulation = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents;

        var stack = Composites.stack(200, 200, 4, 4, 0, 0, function(x, y) {
            return Bodies.rectangle(x, y, 40, 40);
        });

        World.add(world, stack);

        world.gravity.y = 0;

        sceneEvents.push(
            Events.on(engine, 'afterUpdate', function(event) {
                var time = engine.timing.timestamp;

                Composite.translate(stack, {
                    x: Math.sin(time * 0.001) * 2,
                    y: 0
                });

                Composite.rotate(stack, Math.sin(time * 0.001) * 0.01, {
                    x: 300,
                    y: 300
                });

                var scale = 1 + (Math.sin(time * 0.001) * 0.01);

                Composite.scale(stack, scale, scale, {
                    x: 300,
                    y: 300
                });
            })
        );

        var renderOptions = demo.render.options;
        renderOptions.wireframes = false;
        renderOptions.showAxes = true;
        renderOptions.showCollisions = true;
    };

})();