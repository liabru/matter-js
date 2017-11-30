/**
* The `Matter.Pairs` module contains methods for creating and manipulating collision pair sets.
*
* @class Pairs
*/

var Pairs = {};

module.exports = Pairs;

var Pair = require('./Pair');
var Common = require('../core/Common');

(function() {
    
    var _pairMaxIdleLife = 1000;

    /**
     * Creates a new pairs structure.
     * @method create
     * @param {object} options
     * @return {pairs} A new pairs structure
     */
    Pairs.create = function(options) {
        return Common.extend({ 
            table: {},
            list: [],
            collisionStart: [],
            collisionActive: [],
            collisionEnd: []
        }, options);
    };

    /**
     * Updates pairs given a list of collisions.
     * @method update
     * @param {object} pairs
     * @param {collision[]} collisions
     * @param {number} timestamp
     */
    Pairs.update = function(pairs, timestamp) {
        var pairsList = pairs.list,
            pairsTable = pairs.table,
            lastSavedPair = pairsList.length - 1,
            collisionStart = pairs.collisionStart,
            collisionEnd = pairs.collisionEnd,
            collisionActive = pairs.collisionActive,
            collision,
            timeUpdated,
            pair,
            i;

        // clear collision state arrays
        collisionStart.length = 0;
        collisionEnd.length = 0;
        collisionActive.length = 0;

        for (i = 0; i <= lastSavedPair; i++) {
            pair = pairsList[i];

            if (pair.timeStarted !== timestamp) {
                // moving pair to remove at the end of the array
                // N.B array will be truncated to discard unnecessary pairs
                pairsList[i] = pairsList[lastSavedPair];
                pairsList[lastSavedPair] = pair;
                
                // delete pairsTable[pair.id];

                // there is one less pair to save
                lastSavedPair -= 1;

                // need to iterate the current index one more time
                // because current pair was replaced by uniterated pair
                i -= 1;
            }
        }

        // for (i = 0; i <= lastSavedPair; i++) {
        //     pair = pairsList[i];

        //     timeUpdated = pair.timeUpdated;
        //     if (timeUpdated === timestamp) {
        //         // collision active or started
        //         if (pair.timeStarted === timestamp) {
        //             collisionStart.push(pair);
        //         } else {
        //             collisionActive.push(pair);
        //         }
        //     } else {
        //         pair.isActive = false;

        //         // never remove sleeping pairs
        //         if (pair.bodyA.isSleeping || pair.bodyB.isSleeping) {
        //             continue;
        //         }

        //         collisionEnd.push(pair);

        //         // if pair has been inactive for a short period of time it is kept around
        //         if (timestamp - timeUpdated <= _pairMaxIdleLife) {
        //             continue;
        //         }

        //         // pair was inactive for too long
        //         // removing it!
        //         delete pairsTable[pair.id];

        //         // moving pair to remove at the end of the array
        //         // N.B array will be truncated to discard unnecessary pairs
        //         pairsList[i] = pairsList[lastSavedPair];
        //         pairsList[lastSavedPair] = pair;

        //         // there is one less pair to save
        //         lastSavedPair -= 1;

        //         // need to iterate the current index one more time
        //         // because current pair was replaced by uniterated pair
        //         i -= 1;
        //     }

        // }

        pairsList.length = lastSavedPair + 1;
    };

    /**
     * Clears the given pairs structure.
     * @method clear
     * @param {pairs} pairs
     * @return {pairs} pairs
     */
    Pairs.clear = function(pairs) {
        pairs.table = {};
        pairs.list.length = 0;
        pairs.collisionStart.length = 0;
        pairs.collisionActive.length = 0;
        pairs.collisionEnd.length = 0;
        return pairs;
    };

})();
