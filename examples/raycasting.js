(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Events = Matter.Events,
        Vertices = Matter.Vertices,
        Query = Matter.Query;

    Example.raycasting = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents,
            mouseConstraint = demo.mouseConstraint;
        
        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y) {
            switch (Math.round(Common.random(0, 1))) {

            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 50), Common.random(20, 50));
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30));
                }
                break;
            case 1:
                var sides = Math.round(Common.random(1, 8));
                sides = (sides === 3) ? 4 : sides;
                return Bodies.polygon(x, y, sides, Common.random(20, 50));
            }
        });

        var star = Vertices.fromPath('50 0 63 38 100 38 69 59 82 100 50 75 18 100 31 59 0 38 37 38'),
            concave = Bodies.fromVertices(200, 200, star);
        
        World.add(world, [stack, concave]);

        sceneEvents.push(
            Events.on(demo.render, 'afterRender', function() {
                var mouse = mouseConstraint.mouse,
                    context = demo.render.context,
                    bodies = Composite.allBodies(engine.world),
                    startPoint = { x: 400, y: 100 },
                    endPoint = mouse.position;

                var collisions = Query.ray(bodies, startPoint, endPoint);

                context.beginPath();
                context.moveTo(startPoint.x, startPoint.y);
                context.lineTo(endPoint.x, endPoint.y);
                if (collisions.length > 0) {
                    context.strokeStyle = '#fff';
                } else {
                    context.strokeStyle = '#555';
                }
                context.lineWidth = 0.5;
                context.stroke();

                for (var i = 0; i < collisions.length; i++) {
                    var collision = collisions[i];
                    context.rect(collision.bodyA.position.x - 4.5, collision.bodyA.position.y - 4.5, 8, 8);
                }

                context.fillStyle = 'rgba(255,165,0,0.7)';
                context.fill();
            })
        );
    };

})();