// NOTE: this plugin will be moved to its own repo

(function() {

    var MatterGravity = {
        name: 'matter-gravity',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        uses: [
            'matter-attractors@^0.1.0'
        ],

        install: function(base) {
            base.after('Body.create', function() {
                MatterGravity.Body.init(this);
            });
        },

        Body: {
            init: function(body) {
                if (body.plugin.gravity) {
                    body.attractors.push(MatterGravity.Body.applyGravity);
                }
            },

            applyGravity: function(bodyA, bodyB) {
                var bToA = Matter.Vector.sub(bodyB.position, bodyA.position),
                    distanceSq = Matter.Vector.magnitudeSquared(bToA) || 0.0001,
                    normal = Matter.Vector.normalise(bToA),
                    magnitude = -bodyA.plugin.gravity * (bodyA.mass * bodyB.mass / distanceSq),
                    force = Matter.Vector.mult(normal, magnitude);

                Matter.Body.applyForce(bodyA, bodyA.position, Matter.Vector.neg(force));
                Matter.Body.applyForce(bodyB, bodyB.position, force);
            }
        }
    };

    Matter.Plugin.register(MatterGravity);

    if (typeof window !== 'undefined') {
        window.MatterGravity = MatterGravity;
    }

})();
