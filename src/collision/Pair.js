/**
* The `Matter.Pair` module contains methods for creating and manipulating collision pairs.
*
* @class Pair
*/

var Pair = {};

module.exports = Pair;

(function() {
    
    /**
     * Creates a pair.
     * @method create
     * @param {collision} collision
     * @param {number} timestamp
     * @return {pair} A new pair
     */
    Pair.create = function(collision) {
        var bodyA = collision.bodyA,
            bodyB = collision.bodyB,
            activeContacts = [],
            supports = collision.supports,
            parentA = collision.parentA,
            parentB = collision.parentB;

        for (var i = 0; i < supports.length; i++) {
            activeContacts[i] = supports[i].contact;
        }

        var pair = {
            bodyA: bodyA,
            bodyB: bodyB,
            activeContacts: activeContacts,
            separation: collision.depth,
            isActive: true,
            isSensor: bodyA.isSensor || bodyB.isSensor,
            collision: collision,
            inverseMass: parentA.inverseMass + parentB.inverseMass,
            friction: Math.min(parentA.friction, parentB.friction),
            frictionStatic: Math.max(parentA.frictionStatic, parentB.frictionStatic),
            restitution: Math.max(parentA.restitution, parentB.restitution),
            slop: Math.max(parentA.slop, parentB.slop)
        };

        return pair;
    };

    /**
     * Get the id for the given pair.
     * @method id
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {string} Unique pairId
     */
    Pair.id = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return 'A' + bodyA.id + 'B' + bodyB.id;
        } else {
            return 'A' + bodyB.id + 'B' + bodyA.id;
        }
    };

})();