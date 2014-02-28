/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Manager
*/

var Manager = {};

(function() {
    
    var _pairMaxIdleLife = 500;

    /**
     * Description
     * @method updatePairs
     * @param {object} pairs
     * @param {pair[]} pairsList
     * @param {pair[]} candidatePairs
     * @param {metrics} metrics
     * @param {detector} detector
     * @return {bool} pairsUpdated flag
     */
    Manager.updatePairs = function(pairs, pairsList, candidatePairs, metrics, detector) {
        var i;

        // first set all pairs inactive
        for (i = 0; i < pairsList.length; i++) {
            var pair = pairsList[i];
            Pair.setActive(pair, false);
        }
        
        // detect collisions in current step
        var pairsUpdated = false,
            collisions = detector(candidatePairs, metrics);

        // set collision pairs to active, or create if pair is new
        for (i = 0; i < collisions.length; i++) {
            var collision = collisions[i],
                pairId = Pair.id(collision.bodyA, collision.bodyB);
            
            if (pairId in pairs) {
                Pair.update(pairs[pairId], collision);
            } else {
                pairs[pairId] = Pair.create(collision);
                pairsUpdated = true;
            }
        }
        
        return pairsUpdated;
    };
    
    /**
     * Description
     * @method removeOldPairs
     * @param {object} pairs
     * @param {pair[]} pairsList
     * @return {bool} pairsRemoved flag
     */
    Manager.removeOldPairs = function(pairs, pairsList) {
        var timeNow = Common.now(),
            pairsRemoved = false,
            i;
        
        for (i = 0; i < pairsList.length; i++) {
            var pair = pairsList[i],
                collision = pair.collision;
            
            // never remove sleeping pairs
            if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
                pair.timestamp = timeNow;
                continue;
            }

            // if pair is inactive for too long, remove it
            if (timeNow - pair.timestamp > _pairMaxIdleLife) {
                delete pairs[pair.id];
                pairsRemoved = true;
            }
        }
        
        return pairsRemoved;
    };

})();