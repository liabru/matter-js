(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Common = Matter.Common;

    Example.attractors = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        Matter.use(
            'matter-gravity', 
            'matter-wrap'
        );

        world.bodies = [];
        world.gravity.scale = 0;

        var G = 0.001;

        for (var i = 0; i < 200; i += 1) {
            var body = Bodies.circle(
                Common.random(10, 790), 
                Common.random(10, 590),
                Common.random(4, 10),
                {
                    mass: Common.random(10, 20),
                    gravity: G,
                    frictionAir: 0,
                    wrap: {
                        min: { x: 0, y: 0 },
                        max: { x: 800, y: 600 }
                    }
                }
            );

            Body.setVelocity(body, { 
                x: Common.random(-2, 2), 
                y: Common.random(-2, 2)
            });

            World.add(world, body);
        }
        
        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
    };

})();