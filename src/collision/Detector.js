/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Detector
*/

// TODO: speculative contacts

var Detector = {};

(function() {

    /**
     * Description
     * @method collisions
     * @param {pair[]} broadphasePairs
     * @param {engine} engine
     * @return {array} collisions
     */
    Detector.collisions = function(broadphasePairs, engine) {
        var collisions = [],
            metrics = engine.metrics,
            pairsTable = engine.pairs.table;

        for (var i = 0; i < broadphasePairs.length; i++) {
            var bodyA = broadphasePairs[i][0], 
                bodyB = broadphasePairs[i][1];

            var collisionFilterA = bodyA.collisionFilter,
                collisionFilterB = bodyB.collisionFilter;

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;
            
            if (!_pairCollides(collisionFilterA, collisionFilterB))
                continue;

            metrics.midphaseTests += 1;

            // mid phase
            if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {

                // find a previous collision we could reuse
                var pairId = Pair.id(bodyA, bodyB),
                    pair = pairsTable[pairId],
                    previousCollision;

                if (pair && pair.isActive) {
                    previousCollision = pair.collision;
                } else {
                    previousCollision = null;
                }

                // narrow phase
                var collision = SAT.collides(bodyA, bodyB, previousCollision);

                metrics.narrowphaseTests += 1;

                if (collision.reused)
                    metrics.narrowReuseCount += 1;

                if (collision.collided) {
                    collisions.push(collision);
                    metrics.narrowDetections += 1;
                }
            }
        }

        return collisions;
    };

    /**
     * Description
     * @method bruteForce
     * @param {body[]} bodies
     * @param {engine} engine
     * @return {array} collisions
     */
    Detector.bruteForce = function(bodies, engine) {
        var collisions = [],
            metrics = engine.metrics,
            pairsTable = engine.pairs.table;

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

                    // find a previous collision we could reuse
                    var pairId = Pair.id(bodyA, bodyB),
                        pair = pairsTable[pairId],
                        previousCollision;

                    if (pair && pair.isActive) {
                        previousCollision = pair.collision;
                    } else {
                        previousCollision = null;
                    }

                    // narrow phase
                    var collision = SAT.collides(bodyA, bodyB, previousCollision);

                    metrics.narrowphaseTests += 1;

                    if (collision.reused)
                        metrics.narrowReuseCount += 1;

                    if (collision.collided) {
                        collisions.push(collision);
                        metrics.narrowDetections += 1;
                    }
                }
            }
        }

        return collisions;
    };
    
    var _pairCollides = function(filterA, filterB) {
        if (filterA.group === filterB.group && filterA.group !== 0)
            return filterA.group > 0;

        return ((filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0);
    };

})();
