(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint,
        Events = Matter.Events;

    Example.slingshot = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            mouseConstraint = demo.mouseConstraint;

        world.bodies = [];

        var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true, render: { visible: false } }),
            rockOptions = { density: 0.004, render: { sprite: { texture: './img/rock.png' } } },
            rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
            anchor = { x: 170, y: 450 },
            elastic = Constraint.create({ 
                pointA: anchor, 
                bodyB: rock, 
                stiffness: 0.05, 
                render: { 
                    lineWidth: 5, 
                    strokeStyle: '#dfa417' 
                } 
            });

        var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y, column) {
            var texture = column % 2 === 0 ? './img/block.png' : './img/block-2.png';
            return Bodies.rectangle(x, y, 25, 40, { render: { sprite: { texture: texture } } });
        });

        var ground2 = Bodies.rectangle(610, 250, 200, 20, { 
            isStatic: true, 
            render: { 
                fillStyle: '#edc51e', 
                strokeStyle: '#b5a91c' 
            } 
        });

        var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y, column) {
            var texture = column % 2 === 0 ? './img/block.png' : './img/block-2.png';
            return Bodies.rectangle(x, y, 25, 40, { render: { sprite: { texture: texture } } });
        });

        World.add(engine.world, [ground, pyramid, ground2, pyramid2, rock, elastic]);

        Events.on(engine, 'afterUpdate', function() {
            if (mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
                rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
                World.add(engine.world, rock);
                elastic.bodyB = rock;
            }
        });
        
        var renderOptions = demo.render.options;
        renderOptions.wireframes = false;
        renderOptions.showAngleIndicator = false;
        renderOptions.background = './img/background.png';
    };

})();