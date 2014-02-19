// TODO: speculative contacts

var Detector = {};

(function() {

    Detector.collisions = function(pairs, metrics) {
        var collisions = [];

        for (var i = 0; i < pairs.length; i++) {
            var bodyA = pairs[i][0], 
                bodyB = pairs[i][1];

            // NOTE: could share a function for the below, but may drop performance?

            if (bodyA.groupId && bodyB.groupId && bodyA.groupId === bodyB.groupId)
                continue;

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;

            metrics.midphaseTests += 1;

            // mid phase
            if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
                
                // narrow phase
                var collision = SAT.collides(bodyA, bodyB);

                metrics.narrowphaseTests += 1;

                if (collision.collided) {
                    collisions.push(collision);
                    metrics.narrowDetections += 1;
                }
            }
        }

        return collisions;
    };

    Detector.bruteForce = function(bodies, metrics) {
        var collisions = [];

        for (var i = 0; i < bodies.length; i++) {
            for (var j = i + 1; j < bodies.length; j++) {
                var bodyA = bodies[i], 
                    bodyB = bodies[j];

                // NOTE: could share a function for the below, but may drop performance?

                if (bodyA.groupId && bodyB.groupId && bodyA.groupId === bodyB.groupId)
                    continue;

                if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                    continue;

                metrics.midphaseTests += 1;

                // mid phase
                if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {

                    // narrow phase
                    var collision = SAT.collides(bodyA, bodyB);
                    
                    metrics.narrowphaseTests += 1;

                    if (collision.collided) {
                        collisions.push(collision);
                        metrics.narrowDetections += 1;
                    }
                }
            }
        }

        return collisions;
    };

})();