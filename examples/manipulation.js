(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events;

    Example.manipulation = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            sceneEvents = demo.sceneEvents;

        var bodyA = Bodies.rectangle(100, 200, 50, 50, { isStatic: true }),
            bodyB = Bodies.rectangle(200, 200, 50, 50),
            bodyC = Bodies.rectangle(300, 200, 50, 50),
            bodyD = Bodies.rectangle(400, 200, 50, 50),
            bodyE = Bodies.rectangle(550, 200, 50, 50),
            bodyF = Bodies.rectangle(700, 200, 50, 50),
            bodyG = Bodies.circle(400, 100, 25),
            partA = Bodies.rectangle(600, 200, 120, 50),
            partB = Bodies.rectangle(660, 200, 50, 190),
            compound = Body.create({
                parts: [partA, partB],
                isStatic: true
            });

        World.add(world, [bodyA, bodyB, bodyC, bodyD, bodyE, bodyF, bodyG, compound]);

        var counter = 0,
            scaleFactor = 1.01;

        sceneEvents.push(
            Events.on(engine, 'beforeUpdate', function(event) {
                counter += 1;

                if (counter === 40)
                    Body.setStatic(bodyG, true);

                if (scaleFactor > 1) {
                    Body.scale(bodyF, scaleFactor, scaleFactor);
                    Body.scale(compound, 0.995, 0.995);

                    // modify bodyE vertices
                    bodyE.vertices[0].x -= 0.2;
                    bodyE.vertices[0].y -= 0.2;
                    bodyE.vertices[1].x += 0.2;
                    bodyE.vertices[1].y -= 0.2;
                    Body.setVertices(bodyE, bodyE.vertices);
                }

                // make bodyA move up and down
                // body is static so must manually update velocity for friction to work
                var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);
                Body.setVelocity(bodyA, { x: 0, y: py - bodyA.position.y });
                Body.setPosition(bodyA, { x: 100, y: py });

                // make compound body move up and down and rotate constantly
                Body.setVelocity(compound, { x: 0, y: py - compound.position.y });
                Body.setAngularVelocity(compound, 0.02);
                Body.setPosition(compound, { x: 600, y: py });
                Body.rotate(compound, 0.02);

                // every 1.5 sec
                if (counter >= 60 * 1.5) {
                    Body.setVelocity(bodyB, { x: 0, y: -10 });
                    Body.setAngle(bodyC, -Math.PI * 0.26);
                    Body.setAngularVelocity(bodyD, 0.2);

                    // reset counter
                    counter = 0;
                    scaleFactor = 1;
                }
            })
        );

        var renderOptions = demo.render.options;
        renderOptions.showAxes = true;
        renderOptions.showCollisions = true;
        renderOptions.showPositions = true;
        renderOptions.showConvexHulls = true;
    };

})();