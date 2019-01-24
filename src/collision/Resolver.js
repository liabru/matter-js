/**
* The `Matter.Resolver` module contains methods for resolving collision pairs.
*
* @class Resolver
*/

var Resolver = {};

module.exports = Resolver;

var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');
var Common = require('../core/Common');
var Bounds = require('../geometry/Bounds');

(function() {

    Resolver._restingThresh = 4;
    Resolver._restingThreshTangent = 6;
    Resolver._positionDampen = 0.9;
    Resolver._positionWarming = 0.8;
    Resolver._frictionNormalMultiplier = 5;

    /**
     * Prepare pairs for position solving.
     * @method preSolvePosition
     * @param {pair[]} pairs
     */
    Resolver.preSolvePosition = function(pairs) {
        var i,
            pair,
            activeCount;

        // find total contacts on each body
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];

            activeCount = pair.activeContactsCount;
            pair.collision.parentA.totalContacts += activeCount;
            pair.collision.parentB.totalContacts += activeCount;
        }
    };

    /**
     * Find a solution for pair positions.
     * @method solvePosition
     * @param {pair[]} pairs
     * @param {body[]} bodies
     * @param {number} timeScale
     */
    Resolver.solvePosition = function(pairs, bodies, timeScale) {
        var i,
            normalX,
            normalY,
            pair,
            collision,
            bodyA,
            bodyB,
            normal,
            separation,
            penetration,
            positionImpulseA,
            positionImpulseB,
            contactShare,
            bodyBtoAX,
            bodyBtoAY,
            positionImpulse,
            impulseCoefficient = timeScale * Resolver._positionDampen;

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            body.previousPositionImpulse.x = body.positionImpulse.x;
            body.previousPositionImpulse.y = body.positionImpulse.y;
        }

        // find impulses required to resolve penetration
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (pair.isSensor)
                continue;

            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;

            positionImpulseA = bodyA.previousPositionImpulse;
            positionImpulseB = bodyB.previousPositionImpulse;

            penetration = collision.penetration;

            bodyBtoAX = positionImpulseB.x - positionImpulseA.x + penetration.x;
            bodyBtoAY = positionImpulseB.y - positionImpulseA.y + penetration.y;

            normalX = normal.x;
            normalY = normal.y;

            separation = normalX * bodyBtoAX + normalY * bodyBtoAY;
            pair.separation = separation;

            positionImpulse = (separation - pair.slop) * impulseCoefficient;

            if (bodyA.isStatic || bodyB.isStatic)
                positionImpulse *= 2;
            
            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                contactShare = positionImpulse / bodyA.totalContacts;
                bodyA.positionImpulse.x += normalX * contactShare;
                bodyA.positionImpulse.y += normalY * contactShare;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                contactShare = positionImpulse / bodyB.totalContacts;
                bodyB.positionImpulse.x -= normalX * contactShare;
                bodyB.positionImpulse.y -= normalY * contactShare;
            }
        }
    };

    /**
     * Apply position resolution.
     * @method postSolvePosition
     * @param {body[]} bodies
     */
    Resolver.postSolvePosition = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            // reset contact count
            body.totalContacts = 0;

            if (body.positionImpulse.x !== 0 || body.positionImpulse.y !== 0) {
                // update body geometry
                for (var j = 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    Vertices.translate(part.vertices, body.positionImpulse);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                    part.position.x += body.positionImpulse.x;
                    part.position.y += body.positionImpulse.y;
                }

                // move the body without changing velocity
                body.positionPrev.x += body.positionImpulse.x;
                body.positionPrev.y += body.positionImpulse.y;

                if (Vector.dot(body.positionImpulse, body.velocity) < 0) {
                    // reset cached impulse if the body has velocity along it
                    body.positionImpulse.x = 0;
                    body.positionImpulse.y = 0;
                } else {
                    // warm the next iteration
                    body.positionImpulse.x *= Resolver._positionWarming;
                    body.positionImpulse.y *= Resolver._positionWarming;
                }
            }
        }
    };

    /**
     * Prepare pairs for velocity solving.
     * @method preSolveVelocity
     * @param {pair[]} pairs
     */
    Resolver.preSolveVelocity = function(pairs) {
        var i,
            j,
            pair,
            contacts,
            contactsCount,
            collision,
            bodyA,
            bodyB,
            normal,
            tangent,
            contact,
            normalImpulse,
            tangentImpulse,
            offset,
            impulse = Vector._temp[0],
            tempA = Vector._temp[1];
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (pair.isSensor)
                continue;
            
            contacts = pair.activeContacts;
            contactsCount = pair.activeContactsCount;
            collision = pair.collision;
            bodyA = collision.parentA;
            bodyB = collision.parentB;
            normal = collision.normal;
            tangent = collision.tangent;

            // resolve each contact
            for (j = 0; j < contactsCount; j++) {
                contact = contacts[j];
                normalImpulse = contact.normalImpulse;
                tangentImpulse = contact.tangentImpulse;

                if (normalImpulse !== 0 || tangentImpulse !== 0) {
                    // total impulse from contact
                    impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                    impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                    
                    // apply impulse from contact
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        offset = Vector.sub(contact, bodyA.position, tempA);
                        bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                        bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                    }

                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        offset = Vector.sub(contact, bodyB.position, tempA);
                        bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                        bodyB.anglePrev -= Vector.cross(offset, impulse) * bodyB.inverseInertia;
                    }
                }
            }
        }
    };

    /**
     * Find a solution for pair velocities.
     * @method solveVelocity
     * @param {pair[]} pairs
     * @param {number} timeScale
     */
    Resolver.solveVelocity = function(pairs, timeScale) {
        var timeScaleSquared = timeScale * timeScale,
            restingThresh = Resolver._restingThresh,
            restingThreshTangent = Resolver._restingThreshTangent,
            frictionNormalMultiplier = Resolver._frictionNormalMultiplier;
        
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            
            if (pair.isSensor)
                continue;
            
            var collision = pair.collision,
                bodyA = collision.parentA,
                bodyB = collision.parentB,
                normal = collision.normal,
                normalX = normal.x,
                normalY = normal.y,
                tangent = collision.tangent,
                tangentX = tangent.x,
                tangentY = tangent.y,
                contacts = pair.activeContacts,
                contactsCount = pair.activeContactsCount,
                contactShare = 1 / contacts.length;

            // update body velocities
            var positionA = bodyA.position,
                positionAX = positionA.x,
                positionAY = positionA.y,
                positionB = bodyB.position,
                positionBX = positionB.x,
                positionBY = positionB.y,
                velocityAX = positionAX - bodyA.positionPrev.x,
                velocityAY = positionAY - bodyA.positionPrev.y,
                velocityBX = positionBX - bodyB.positionPrev.x,
                velocityBY = positionBY - bodyB.positionPrev.y,
                angularVelocityA =  bodyA.angle - bodyA.anglePrev,
                angularVelocityB =  bodyB.angle - bodyB.anglePrev;

            bodyA.velocity.x = velocityAX;
            bodyA.velocity.y = velocityAY;
            bodyB.velocity.x = velocityBX;
            bodyB.velocity.y = velocityBY;

            bodyA.angularVelocity = angularVelocityA;
            bodyB.angularVelocity = angularVelocityB;

            var inverseMassA = bodyA.inverseMass,
                inverseMassB = bodyB.inverseMass,
                inverseInertiaA = bodyA.inverseInertia,
                inverseInertiaB = bodyB.inverseInertia;

            // resolve each contact
            for (var j = 0; j < contactsCount; j++) {
                var contact = contacts[j],
                    offsetAX = contact.x - positionAX,
                    offsetAY = contact.y - positionAY,
                    offsetBX = contact.x - positionBX,
                    offsetBY = contact.y - positionBY,
                    relativeVelocityX = (velocityAX - offsetAY * angularVelocityA) - (velocityBX - offsetBY * angularVelocityB),
                    relativeVelocityY = (velocityAY + offsetAX * angularVelocityA) - (velocityBY + offsetBX * angularVelocityB),
                    normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY;

                var tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY,
                    tangentSpeed = Math.abs(tangentVelocity),
                    tangentVelocityDirection = Common.sign(tangentVelocity);

                // raw impulses
                var normalImpulse = (1 + pair.restitution) * normalVelocity,
                    normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1) * frictionNormalMultiplier;

                // coulomb friction
                var tangentImpulse = tangentVelocity,
                    maxFriction = Infinity;

                if (tangentSpeed > pair.friction * pair.frictionStatic * normalForce * timeScaleSquared) {
                    maxFriction = tangentSpeed;
                    tangentImpulse = Common.clamp(
                        pair.friction * tangentVelocityDirection * timeScaleSquared,
                        -maxFriction, maxFriction
                    );
                }

                // modify impulses accounting for mass, inertia and offset
                var oAcN = offsetAX * normalY - offsetAY * normalX,
                    oBcN = offsetBX * normalY - offsetBY * normalX,
                    share = contactShare / (inverseMassA + inverseMassB + inverseInertiaA * oAcN * oAcN  + inverseInertiaB * oBcN * oBcN);

                normalImpulse *= share;
                tangentImpulse *= share;

                // handle high velocity and resting collisions separately
                if (normalVelocity < 0 && normalVelocity * normalVelocity > restingThresh * timeScaleSquared) {
                    // high normal velocity so clear cached contact normal impulse
                    contact.normalImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // impulse constraint tends to 0
                    var contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                }

                // handle high velocity and resting collisions separately
                if (tangentVelocity * tangentVelocity > restingThreshTangent * timeScaleSquared) {
                    // high tangent velocity so clear cached contact tangent impulse
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)
                    // tangent impulse tends to -tangentSpeed or +tangentSpeed
                    var contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -maxFriction, maxFriction);
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }

                // total impulse from contact
                var impulseX = (normalX * normalImpulse) + (tangentX * tangentImpulse);
                var impulseY = (normalY * normalImpulse) + (tangentY * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulseX * inverseMassA;
                    bodyA.positionPrev.y += impulseY * inverseMassA;
                    bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * inverseInertiaA;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulseX * inverseMassB;
                    bodyB.positionPrev.y -= impulseY * inverseMassB;
                    bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * inverseInertiaB;
                }
            }
        }
    };

})();