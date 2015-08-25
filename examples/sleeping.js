(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Events = Matter.Events;

    Example.sleeping = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var stack = Composites.stack(50, 50, 12, 3, 0, 0, function(x, y) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(1, 8)), Common.random(20, 50));

            }
        });
        
        World.add(world, stack);

        for (var i = 0; i < stack.bodies.length; i++) {
            Events.on(stack.bodies[i], 'sleepStart sleepEnd', function(event) {
                var body = this;
                console.log('body id', body.id, 'sleeping:', body.isSleeping);
            });
        }

        engine.enableSleeping = true;
    };
    
})();