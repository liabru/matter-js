/**
* The `Matter.Detector` module contains methods for detecting collisions given a set of pairs.
*
* @class Detector
*/

// TODO: speculative contacts

var Detector = {};

module.exports = Detector;

var SAT = require('./SAT');
var Pair = require('./Pair');

(function() {

    /**
     * Finds all collisions given a list of pairs.
     * @method collisions
     * @param {pair[]} broadphasePairs
     * @param {engine} engine
     * @return {array} collisions
     */
    Detector.collisions = function(broadphasePairs, engine) {
        var collisions = [],
            pairs = engine.pairs,
            broadphasePairsLength = broadphasePairs.length,
            canCollide = Detector.canCollide,
            collides = SAT.collides,
            i;

        for (i = 0; i < broadphasePairsLength; i++) {
            var broadphasePair = broadphasePairs[i],
                bodyA = broadphasePair[0], 
                bodyB = broadphasePair[1];

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;
            
            if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter))
                continue;

            var boundsA = bodyA.bounds,
                boundsB = bodyB.bounds;

            if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x
                || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                continue;
            }

            var partsALength = bodyA.parts.length,
                partsBLength = bodyB.parts.length;

            if (partsALength === 1 && partsBLength === 1) {
                var collision = collides(bodyA, bodyB, pairs);

                if (collision) {
                    collisions.push(collision);
                }
            } else {
                var partsAStart = partsALength > 1 ? 1 : 0,
                    partsBStart = partsBLength > 1 ? 1 : 0;
                
                for (var j = partsAStart; j < partsALength; j++) {
                    var partA = bodyA.parts[j],
                        boundsA = partA.bounds;

                    for (var k = partsBStart; k < partsBLength; k++) {
                        var partB = bodyB.parts[k],
                            boundsB = partB.bounds;

                        if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x
                            || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                            continue;
                        }

                        var collision = collides(partA, partB, pairs);

                        if (collision) {
                            collisions.push(collision);
                        }
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
