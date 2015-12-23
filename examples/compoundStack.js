(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composites = Matter.Composites;

    Example.compoundStack = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            size = 50;

        var stack = Composites.stack(100, 280, 12, 6, 0, 0, function(x, y) {
            var partA = Bodies.rectangle(x, y, size, size / 5),
                partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

            return Body.create({
                parts: [partA, partB]
            });
        });

        World.add(world, stack);
    };

})();
