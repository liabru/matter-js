/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Manager
*/

var Manager = {};

(function() {
    
    var _pairMaxIdleLife = 1000;

    /**
     * Description
     * @method updatePairs
     * @param {object} pairs
     * @param {collision[]} collisions
     */
    Manager.updatePairs = function(pairs, collisions) {
        var pairsList = pairs.list,
            pairsTable = pairs.table,
            collisionStart = pairs.collisionStart,
            collisionEnd = pairs.collisionEnd,
            collisionActive = pairs.collisionActive,
            activePairIds = [],
            collision,
            pairId,
            pair,
            i;

        // clear collision state arrays, but maintain old reference
        collisionStart.length = 0;
        collisionEnd.length = 0;
        collisionActive.length = 0;

        for (i = 0; i < collisions.length; i++) {
            collision = collisions[i];

            if (collision.collided) {
                pairId = Pair.id(collision.bodyA, collision.bodyB);
                activePairIds.push(pairId);
                
                if (pairId in pairsTable) {
                    // pair already exists (but may or may not be active)
                    pair = pairsTable[pairId];

                    if (pair.isActive) {
                        // pair exists and is active
                        collisionActive.push(pair);
                    } else {
                        // pair exists but was inactive, so a collision has just started again
                        collisionStart.push(pair);
                    }

                    // update the pair
                    Pair.update(pair, collision);
                } else {
                    // pair did not exist, create a new pair
                    pair = Pair.create(collision);
                    pairsTable[pairId] = pair;

                    // push the new pair
                    collisionStart.push(pair);
                    pairsList.push(pair);
                }
            }
        }

        // deactivate previously active pairs that are now inactive
        for (i = 0; i < pairsList.length; i++) {
            pair = pairsList[i];
            if (pair.isActive && activePairIds.indexOf(pair.id) === -1) {
                Pair.setActive(pair, false);
                collisionEnd.push(pair);
            }
        }
    };
    
    /**
     * Description
     * @method removeOldPairs
     * @param {object} pairs
     */
    Manager.removeOldPairs = function(pairs) {
        var pairsList = pairs.list,
            pairsTable = pairs.table,
            timeNow = Common.now(),
            indexesToRemove = [],
            pair,
            collision,
            pairIndex,
            i;

        for (i = 0; i < pairsList.length; i++) {
            pair = pairsList[i];
            collision = pair.collision;
            
            // never remove sleeping pairs
            if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
                pair.timeUpdated = timeNow;
                continue;
            }

            // if pair is inactive for too long, mark it to be removed
            if (timeNow - pair.timeUpdated > _pairMaxIdleLife) {
                indexesToRemove.push(i);
            }
        }

        // remove marked pairs
        for (i = 0; i < indexesToRemove.length; i++) {
            pairIndex = indexesToRemove[i] - i;
            pair = pairsList[pairIndex];
            delete pairsTable[pair.id];
            pairsList.splice(pairIndex, 1);
        }
    };

})();