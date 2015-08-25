(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common;

    Example.mixed = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y) {
            var sides = Math.round(Common.random(1, 8));

            // triangles can be a little unstable, so avoid until fixed
            sides = (sides === 3) ? 4 : sides;

            // round the edges of some bodies
            var chamfer = null;
            if (sides > 2 && Common.random() > 0.7) {
                chamfer = {
                    radius: 10
                };
            }

            switch (Math.round(Common.random(0, 1))) {
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(25, 50), Common.random(25, 50), { chamfer: chamfer });
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(25, 30), { chamfer: chamfer });
                }
                break;
            case 1:
                return Bodies.polygon(x, y, sides, Common.random(25, 50), { chamfer: chamfer });
            }
        });

        World.add(world, stack);
    };
    
})();