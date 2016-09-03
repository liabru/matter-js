(function() {

    var Body = Matter.Body,
        Common = Matter.Common,
        Composite = Matter.Composite;

    var MatterWorldWrap = {
        name: 'matter-world-wrap',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        install: function(base) {
            base.Engine.update = Common.chain(
                Matter.Engine.update,
                MatterWorldWrap.update
            );
        },

        update: function(engine) {
            engine = this || engine;

            var world = engine.world,
                bodies = Composite.allBodies(world);

            for (var i = 0; i < bodies.length; i += 1) {
                var body = bodies[i],
                    x = null,
                    y = null;

                if (body.bounds.min.x > world.bounds.max.x) {
                    x = world.bounds.min.x - (body.bounds.max.x - body.position.x);
                } else if (body.bounds.max.x < world.bounds.min.x) {
                    x = world.bounds.max.x - (body.bounds.min.x - body.position.x);
                }

                if (body.bounds.min.y > world.bounds.max.y) {
                    y = world.bounds.min.y - (body.bounds.max.y - body.position.y);
                } else if (body.bounds.max.y < world.bounds.min.y) {
                    y = world.bounds.max.y - (body.bounds.min.y - body.position.y);
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

    Matter.Plugin.register(MatterWorldWrap);

    window.MatterWorldWrap = MatterWorldWrap;

})();
