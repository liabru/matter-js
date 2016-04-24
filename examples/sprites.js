(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common;

    Example.sprites = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            offset = 10,
            options = { 
                isStatic: true,
                render: {
                    visible: false
                }
            };

        world.bodies = [];

        // these static walls will not be rendered in this sprites example, see options
        World.add(world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, options),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, options),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, options),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, options)
        ]);

        var stack = Composites.stack(20, 20, 10, 4, 0, 0, function(x, y) {
            if (Common.random() > 0.35) {
                return Bodies.rectangle(x, y, 64, 64, {
                    render: {
                        strokeStyle: '#ffffff',
                        sprite: {
                            texture: './img/box.png'
                        }
                    }
                });
            } else {
                return Bodies.circle(x, y, 46, {
                    density: 0.0005,
                    frictionAir: 0.06,
                    restitution: 0.3,
                    friction: 0.01,
                    render: {
                        sprite: {
                            texture: './img/ball.png'
                        }
                    }
                });
            }
        });

        World.add(world, stack);

        var renderOptions = demo.render.options;
        renderOptions.background = './img/wall-bg.jpg';
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
    };

})();