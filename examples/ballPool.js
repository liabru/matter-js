(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common;

    Example.ballPool = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var stack = Composites.stack(100, 50, 10, 15, 10, 10, function(x, y) {
            return Bodies.circle(x, y, Common.random(15, 30), { restitution: 0.6, friction: 0.1 });
        });
        
        World.add(world, [
            stack,
            Bodies.polygon(200, 560, 3, 60),
            Bodies.polygon(400, 560, 5, 60),
            Bodies.rectangle(600, 560, 80, 80)
        ]);
    };

})();