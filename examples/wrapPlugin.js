(function() {

    var Body = Matter.Body,
        Common = Matter.Common,
        Composite = Matter.Composite;

    var MatterWrap = {
        name: 'matter-wrap',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        install: function(base) {
            base.after('Engine.update', function() {
                MatterWrap.Engine.update(this);
            });
        },

        Engine: {
            update: function(engine) {
                var world = engine.world,
                    bodies = Composite.allBodies(world);

                for (var i = 0; i < bodies.length; i += 1) {
                    var body = bodies[i];

                    if (body.wrap) {
                        MatterWrap.Body.wrap(body, body.wrap);
                    }
                }
            }
        },

        Body: {
            wrap: function(body, bounds) {
                var x = null,
                    y = null;

                if (typeof bounds.min.x !== 'undefined' && typeof bounds.max.x !== 'undefined') {
                    if (body.bounds.min.x > bounds.max.x) {
                        x = bounds.min.x - (body.bounds.max.x - body.position.x);
                    } else if (body.bounds.max.x < bounds.min.x) {
                        x = bounds.max.x - (body.bounds.min.x - body.position.x);
                    }
                }

                if (typeof bounds.min.y !== 'undefined' && typeof bounds.max.y !== 'undefined') {
                    if (body.bounds.min.y > bounds.max.y) {
                        y = bounds.min.y - (body.bounds.max.y - body.position.y);
                    } else if (body.bounds.max.y < bounds.min.y) {
                        y = bounds.max.y - (body.bounds.min.y - body.position.y);
                    }
                }

                if (x !== null || y !== null) {
                    Body.setPosition(body, {
                        x: x || body.position.x,
                        y: y || body.position.y
                    });
                }
            }
        }
    };

    Matter.Plugin.register(MatterWrap);

    if (typeof window !== 'undefined') {
        window.MatterWrap = MatterWrap;
    }

})();
