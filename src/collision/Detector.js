/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Detector
*/

// TODO: speculative contacts

var Detector = {};

module.exports = Detector;

var SAT = require('./SAT');
var Pair = require('./Pair');
var Bounds = require('../geometry/Bounds');

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
            pairsTable = engine.pairs.table;

        // @if DEBUG
        var metrics = engine.metrics;
        // @endif
        
        for (var i = 0; i < broadphasePairs.length; i++) {
            var bodyA = broadphasePairs[i][0], 
                bodyB = broadphasePairs[i][1];

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;
            
            if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
                continue;

            // @if DEBUG
            metrics.midphaseTests += 1;
            // @endif

            // mid phase
            if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
                for (var j = bodyA.parts.length > 1 ? 1 : 0; j < bodyA.parts.length; j++) {
                    var partA = bodyA.parts[j];

                    for (var k = bodyB.parts.length > 1 ? 1 : 0; k < bodyB.parts.length; k++) {
                        var partB = bodyB.parts[k];

                        if ((partA === bodyA && partB === bodyB) || Bounds.overlaps(partA.bounds, partB.bounds)) {
                            // find a previous collision we could reuse
                            var pairId = Pair.id(partA, partB),
                                pair = pairsTable[pairId],
                                previousCollision;

                            if (pair && pair.isActive) {
                                previousCollision = pair.collision;
                            } else {
                                previousCollision = null;
                            }

                            // narrow phase
                            var collision = SAT.collides(partA, partB, previousCollision);

                            // @if DEBUG
                            metrics.narrowphaseTests += 1;
                            if (collision.reused)
                                metrics.narrowReuseCount += 1;
                            // @endif

                            if (collision.collided) {
                                collisions.push(collision);
                                // @if DEBUG
                                metrics.narrowDetections += 1;
                                // @endif
                            }
                        }
                    }
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
            pairsTable = engine.pairs.table;

        // @if DEBUG
        var metrics = engine.metrics;
        // @endif

        for (var i = 0; i < bodies.length; i++) {
            for (var j = i + 1; j < bodies.length; j++) {
                var bodyA = bodies[i], 
                    bodyB = bodies[j];

                // NOTE: could share a function for the below, but may drop performance?

                if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                    continue;
                
                if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
                    continue;

                // @if DEBUG
                metrics.midphaseTests += 1;
                // @endif

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

                    // @if DEBUG
                    metrics.narrowphaseTests += 1;
                    if (collision.reused)
                        metrics.narrowReuseCount += 1;
                    // @endif

                    if (collision.collided) {
                        collisions.push(collision);
                        // @if DEBUG
                        metrics.narrowDetections += 1;
                        // @endif
                    }
                }
            }
        }

        return collisions;
    };

    /**
     * Returns `true` if both supplied collision filters will allow a collision to occur.
     * See `body.collisionFilter` for more information.
     * @method canCollide
     * @param {} filterA
     * @param {} filterB
     * @return {bool} `true` if collision can occur
     */
    Detector.canCollide = function(filterA, filterB) {
        if (filterA.group === filterB.group && filterA.group !== 0)
            return filterA.group > 0;

        return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
    };

})();
