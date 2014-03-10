/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Pair
*/

var Pair = {};

(function() {
    
    /**
     * Description
     * @method create
     * @param {collision} collision
     * @return {pair} A new pair
     */
    Pair.create = function(collision) {
        var bodyA = collision.bodyA,
            bodyB = collision.bodyB,
            timestamp = Common.now();

        var pair = {
            id: Pair.id(bodyA, bodyB),
            bodyA: bodyA,
            bodyB: bodyB,
            contacts: {},
            activeContacts: [],
            separation: 0,
            isActive: true,
            timeCreated: timestamp,
            timeUpdated: timestamp,
            inverseMass: bodyA.inverseMass + bodyB.inverseMass,
            friction: Math.min(bodyA.friction, bodyB.friction),
            restitution: Math.max(bodyA.restitution, bodyB.restitution),
            slop: Math.max(bodyA.slop, bodyB.slop)
        };

        Pair.update(pair, collision);

        return pair;
    };

    /**
     * Description
     * @method update
     * @param {pair} pair
     * @param {collision} collision
     */
    Pair.update = function(pair, collision) {
        var contacts = pair.contacts,
            supports = collision.supports,
            activeContacts = [];
        
        pair.collision = collision;
        
        if (collision.collided) {
            for (var i = 0; i < supports.length; i++) {
                var support = supports[i],
                    contactId = Contact.id(support);

                if (contactId in contacts) {
                    activeContacts.push(contacts[contactId]);
                } else {
                    activeContacts.push(contacts[contactId] = Contact.create(support));
                }
            }

            pair.activeContacts = activeContacts;
            pair.separation = collision.depth;
            Pair.setActive(pair, true);
        } else {
            Pair.setActive(pair, false);
        }
    };
    
    /**
     * Description
     * @method setActive
     * @param {pair} pair
     * @param {bool} isActive
     */
    Pair.setActive = function(pair, isActive) {
        if (isActive) {
            pair.isActive = true;
            pair.timeUpdated = Common.now();
        } else {
            pair.isActive = false;
            pair.activeContacts = [];
        }
    };

    /**
     * Description
     * @method id
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {number} Unique pairId
     */
    Pair.id = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + '_' + bodyB.id;
        } else {
            return bodyB.id + '_' + bodyA.id;
        }
    };

})();