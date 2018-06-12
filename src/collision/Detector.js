/**
* The `Matter.Detector` module contains methods for detecting collisions given a set of pairs.
*
* @class Detector
*/

// TODO: speculative contacts

var Detector = {};

module.exports = Detector;

var SAT = require('./SAT');
var Pairs = require('./Pairs');
var Sleeping = require('../core/Sleeping');
var Bounds = require('../geometry/Bounds');

var dummyPair = { idA: 1 << 30, idB: (1 << 30) + 1 };

(function() {

    /**
     * Finds all collisions given a list of bodies and their potential collision pairs
     * @method collisions
     * @param {bodies[]} bodies
     * @param {engine} engine
     * @return {array} collisions
     */
    Detector.collisions = function(bodies, engine) {
        var allPairs = engine.pairs,
            oldCollisions = allPairs.list,
            newCollisions = [],
            collisionStart,
            collisionActive,
            collisionEnd;

        // @if DEBUG
        var metrics = engine.metrics;
        // @endif

        var engineEvents = engine.events;
        var hasCollisionEvent = !!(
            engineEvents.collisionStart ||
            engineEvents.collisionActive ||
            engineEvents.collisionEnd
        );

        if (hasCollisionEvent) {
            collisionStart = [];
            collisionActive = [];
            collisionEnd = [];
            allPairs.collisionStart = collisionStart;
            allPairs.collisionActive = collisionActive;
            allPairs.collisionEnd = collisionEnd;
        }

        oldCollisions.push(dummyPair);

        var pairIndex = 0,
            oldCollision = oldCollisions[pairIndex++];

        for (var i = 0; i < bodies.length; i++) {
            var bodyA = bodies[i],
                partsA = bodyA.parts,
                firstPartsA = bodyA.parts.length > 1 ? 1 : 0,
                pairs = bodyA.pairs;

            for (var j = 0; j < pairs.length; j++) {
                var bodyB = pairs[j][0];

                if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                    continue;
                
                if (!Detector.canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
                    continue;

                // @if DEBUG
                metrics.midphaseTests += 1;
                // @endif

                // mid phase
                if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
                    for (var l = firstPartsA; l < partsA.length; l++) {
                        var partA = partsA[l];

                        var partsB = bodyB.parts;
                        for (var k = partsB.length > 1 ? 1 : 0; k < partsB.length; k++) {
                            var partB = partsB[k];

                            if ((partA === bodyA && partB === bodyB) || Bounds.overlaps(partA.bounds, partB.bounds)) {
                                // narrow phase
                                var collision = SAT.collides(partA, partB);

                                // @if DEBUG
                                metrics.narrowphaseTests += 1;
                                // @endif

                                if (collision) {
                                    newCollisions.push(collision);

                                    if (hasCollisionEvent) {
                                        // Check old pairs to determine which collisions are new
                                        // and which collisions are not active anymore
                                        var idA = partA.id;
                                        var idB = partB.id;
                                        while (oldCollision.idA < idA
                                            || (oldCollision.idA === idA && oldCollision.idB < idB)) {
                                            collisionEnd.push(oldCollision);
                                            oldCollision = oldCollisions[pairIndex++];
                                        }

                                        if (oldCollision.idA === idA && oldCollision.idB === idB) {
                                            // Pair was already active
                                            collisionActive.push(collision);
                                            oldCollision = oldCollisions[pairIndex++];
                                        } else {
                                            // Pair could not be found, collision is new
                                            collisionStart.push(collision);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (hasCollisionEvent) {
            pairIndex -= 1;
            while (pairIndex < oldCollisions.length - 1) {
                collisionEnd.push(oldCollisions[pairIndex++]);
            }
        }

        allPairs.list = newCollisions;
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
