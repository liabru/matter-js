(function() {

    var Body = Matter.Body,
        Common = Matter.Common,
        Vector = Matter.Vector;

    var MatterGravity = {
        name: 'matter-gravity',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        uses: [
            'matter-attractors@^0.1.0'
        ],

        install: function(base) {
            base.Body.create = Common.chain(
                Matter.Body.create,
                MatterGravity.addAttractor
            );
        },

        addAttractor: function(body) {
            body = this || body;

            if (body.gravity) {
                body.attractors.push(MatterGravity.applyForce);
            }
        },

        applyForce: function(bodyA, bodyB) {
            var bToA = Vector.sub(bodyB.position, bodyA.position),
                distanceSq = Vector.magnitudeSquared(bToA) || 0.0001,
                normal = Vector.normalise(bToA),
                magnitude = -bodyA.gravity * (bodyA.mass * bodyB.mass / distanceSq),
                force = Vector.mult(normal, magnitude);

            Body.applyForce(bodyA, bodyA.position, Vector.neg(force));
            Body.applyForce(bodyB, bodyB.position, force);
        }
    };

    Matter.Plugin.register(MatterGravity);

    window.MatterGravity = MatterGravity;

})();
