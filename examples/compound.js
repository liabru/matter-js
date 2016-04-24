(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Constraint = Matter.Constraint;

    Example.compound = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        var size = 200,
            x = 200,
            y = 200,
            partA = Bodies.rectangle(x, y, size, size / 5),
            partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

        var compoundBodyA = Body.create({
            parts: [partA, partB]
        });

        size = 150;
        x = 400;
        y = 300;

        var partC = Bodies.circle(x, y, 30),
            partD = Bodies.circle(x + size, y, 30),
            partE = Bodies.circle(x + size, y + size, 30),
            partF = Bodies.circle(x, y + size, 30);

        var compoundBodyB = Body.create({
            parts: [partC, partD, partE, partF]
        });

        var constraint = Constraint.create({
            pointA: { x: 400, y: 100 },
            bodyB: compoundBodyB,
            pointB: { x: 0, y: -50 }
        });

        World.add(world, [compoundBodyA, compoundBodyB, constraint]);
        
        var renderOptions = demo.render.options;
        renderOptions.showAxes = true;
        renderOptions.showPositions = true;
        renderOptions.showConvexHulls = true;
    };
    
})();