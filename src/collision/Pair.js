var Pair = {};

(function() {
    
    Pair.create = function(collision) {
        var bodyA = collision.bodyA,
            bodyB = collision.bodyB;

        var pair = {
            id: Pair.id(bodyA, bodyB),
            contacts: {},
            activeContacts: [],
            separation: 0,
            isActive: true,
            timestamp: Common.now(),
            inverseMass: bodyA.inverseMass + bodyB.inverseMass,
            friction: Math.min(bodyA.friction, bodyB.friction),
            restitution: Math.max(bodyA.restitution, bodyB.restitution),
            slop: Math.max(bodyA.slop, bodyB.slop)
        };

        Pair.update(pair, collision);

        return pair;
    };

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
    
    Pair.setActive = function(pair, isActive) {
        if (isActive) {
            pair.isActive = true;
            pair.timestamp = Common.now();
        } else {
            pair.isActive = false;
            pair.activeContacts = [];
        }
    };

    Pair.id = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + '_' + bodyB.id;
        } else {
            return bodyB.id + '_' + bodyA.id;
        }
    };

})();