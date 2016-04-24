(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Events = Matter.Events;

    Example.events = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            mouseConstraint = demo.mouseConstraint,
            sceneEvents = demo.sceneEvents;
        
        // bind events (sceneEvents is only used for this demo)

        sceneEvents.push(

            // an example of using composite events on the world
            Events.on(world, 'afterAdd', function(event) {
                console.log('added to world:', event.object);
            })

        );

        sceneEvents.push(

            // an example of using beforeUpdate event on an engine
            Events.on(engine, 'beforeUpdate', function(event) {
                var engine = event.source;

                // apply random forces every 5 secs
                if (event.timestamp % 5000 < 50)
                    shakeScene(engine);
            })

        );

        sceneEvents.push(

            // an example of using collisionStart event on an engine
            Events.on(engine, 'collisionStart', function(event) {
                var pairs = event.pairs;

                // change object colours to show those starting a collision
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    pair.bodyA.render.fillStyle = '#bbbbbb';
                    pair.bodyB.render.fillStyle = '#bbbbbb';
                }
            })

        );

        sceneEvents.push(

            // an example of using collisionActive event on an engine
            Events.on(engine, 'collisionActive', function(event) {
                var pairs = event.pairs;

                // change object colours to show those in an active collision (e.g. resting contact)
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    pair.bodyA.render.fillStyle = '#aaaaaa';
                    pair.bodyB.render.fillStyle = '#aaaaaa';
                }
            })

        );

        sceneEvents.push(

            // an example of using collisionEnd event on an engine
            Events.on(engine, 'collisionEnd', function(event) {
                var pairs = event.pairs;

                // change object colours to show those ending a collision
                for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    pair.bodyA.render.fillStyle = '#999999';
                    pair.bodyB.render.fillStyle = '#999999';
                }
            })

        );

        sceneEvents.push(

            // an example of using mouse events on a mouse
            Events.on(mouseConstraint, 'mousedown', function(event) {
                var mousePosition = event.mouse.position;
                console.log('mousedown at ' + mousePosition.x + ' ' + mousePosition.y);
                demo.render.options.background = 'cornsilk';
                shakeScene(engine);
            })

        );

        sceneEvents.push(

            // an example of using mouse events on a mouse
            Events.on(mouseConstraint, 'mouseup', function(event) {
                var mousePosition = event.mouse.position;
                demo.render.options.background = "white";
                console.log('mouseup at ' + mousePosition.x + ' ' + mousePosition.y);
            })

        );

        sceneEvents.push(

            // an example of using mouse events on a mouse
            Events.on(mouseConstraint, 'startdrag', function(event) {
                console.log('startdrag', event);
            })

        );

        sceneEvents.push(

            // an example of using mouse events on a mouse
            Events.on(mouseConstraint, 'enddrag', function(event) {
                console.log('enddrag', event);
            })

        );

        // scene code

        var stack = Composites.stack(50, 100, 8, 4, 50, 50, function(x, y) {
            return Bodies.circle(x, y, 15, { restitution: 1, render: { strokeStyle: '#777' } });
        });
        
        World.add(world, stack);

        var renderOptions = demo.render.options;
        renderOptions.wireframes = false;

        var shakeScene = function(engine) {
            var bodies = Composite.allBodies(engine.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];

                if (!body.isStatic && body.position.y >= 500) {
                    var forceMagnitude = 0.01 * body.mass;

                    Body.applyForce(body, { x: 0, y: 0 }, { 
                        x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
                        y: -forceMagnitude + Common.random() * -forceMagnitude
                    });
                }
            }
        };
    };

})();