(function() {

    var MatterAttractors = {
        name: 'matter-attractors',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        install: function(base) {
            base.after('Body.create', function() {
                MatterAttractors.Body.init(this);
            });

            base.after('Engine.update', function() {
                MatterAttractors.Engine.update(this);
            });
        },

        Body: {
            init: function(body) {
                body.attractors = body.attractors || [];
            }
        },

        Engine: {
            update: function(engine) {
                var world = engine.world,
                    bodies = Matter.Composite.allBodies(world);

                for (var i = 0; i < bodies.length; i += 1) {
                    var bodyA = bodies[i],
                        attractors = bodyA.attractors;

                    if (attractors && attractors.length > 0) {
                        for (var j = i + 1; j < bodies.length; j += 1) {
                            var bodyB = bodies[j];

                            for (var k = 0; k < attractors.length; k += 1) {
                                var attractor = attractors[k],
                                    forceVector = attractor;

                                if (Matter.Common.isFunction(attractor)) {
                                    forceVector = attractor(bodyA, bodyB);
                                }
                                
                                if (forceVector) {
                                    Matter.Body.applyForce(bodyB, bodyB.position, forceVector);
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    Matter.Plugin.register(MatterAttractors);

    if (typeof window !== 'undefined') {
        window.MatterAttractors = MatterAttractors;
    }

})();
