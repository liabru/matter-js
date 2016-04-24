(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Common = Matter.Common,
        Events = Matter.Events;

    Example.sensors = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents;

        var redColor = '#C44D58',
            greenColor = '#C7F464';

        var collider = Bodies.rectangle(400, 300, 500, 50, {
            isSensor: true,
            isStatic: true,
            render: {
                strokeStyle: redColor,
                fillStyle: 'transparent'
            }
        });

        World.add(world, collider);

        World.add(world,
            Bodies.circle(400, 40, 30, {
                render: {
                    strokeStyle: greenColor,
                    fillStyle: 'transparent'
                }
            })
        );

        sceneEvents.push(
            Events.on(engine, 'collisionStart', function(event) {
                var pairs = event.pairs;
                
                for (var i = 0, j = pairs.length; i != j; ++i) {
                    var pair = pairs[i];

                    if (pair.bodyA === collider) {
                        pair.bodyB.render.strokeStyle = redColor;
                    } else if (pair.bodyB === collider) {
                        pair.bodyA.render.strokeStyle = redColor;
                    }
                }
            }),
            Events.on(engine, 'collisionEnd', function(event) {
                var pairs = event.pairs;
                
                for (var i = 0, j = pairs.length; i != j; ++i) {
                    var pair = pairs[i];

                    if (pair.bodyA === collider) {
                        pair.bodyB.render.strokeStyle = greenColor;
                    } else if (pair.bodyB === collider) {
                        pair.bodyA.render.strokeStyle = greenColor;
                    }
                }
            })
        );

        var renderOptions = demo.render.options;
        renderOptions.wireframes = false;
        renderOptions.background = '#222';
        renderOptions.showAngleIndicator = false;
    };
})();