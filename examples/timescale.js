(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Events = Matter.Events;

    Example.timescale = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents;
        
        var explosion = function(engine) {
            var bodies = Composite.allBodies(engine.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];

                if (!body.isStatic && body.position.y >= 500) {
                    var forceMagnitude = 0.05 * body.mass;

                    Body.applyForce(body, body.position, {
                        x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                        y: -forceMagnitude + Common.random() * -forceMagnitude
                    });
                }
            }
        };

        var timeScaleTarget = 1,
            counter = 0;

        sceneEvents.push(
            Events.on(engine, 'afterUpdate', function(event) {
                // tween the timescale for bullet time slow-mo
                engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.05;

                counter += 1;

                // every 1.5 sec
                if (counter >= 60 * 1.5) {

                    // flip the timescale
                    if (timeScaleTarget < 1) {
                        timeScaleTarget = 1;
                    } else {
                        timeScaleTarget = 0.05;
                    }

                    // create some random forces
                    explosion(engine);

                    // reset counter
                    counter = 0;
                }
            })
        );

        var bodyOptions = {
            frictionAir: 0, 
            friction: 0.0001,
            restitution: 0.8
        };
        
        // add some small bouncy circles... remember Swordfish?
        World.add(world, Composites.stack(20, 100, 15, 3, 20, 40, function(x, y) {
            return Bodies.circle(x, y, Common.random(10, 20), bodyOptions);
        }));

        // add some larger random bouncy objects
        World.add(world, Composites.stack(50, 50, 8, 3, 0, 0, function(x, y) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50), bodyOptions);
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), bodyOptions);
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(4, 8)), Common.random(20, 50), bodyOptions);

            }
        }));
    };

})();
