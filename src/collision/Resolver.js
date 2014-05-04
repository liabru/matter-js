/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Resolver
*/

var Resolver = {};

(function() {

    var _restingThresh = 4,
        _positionDampen = 0.2,
        _positionWarming = 0.6;

    /**
     * Description
     * @method solvePosition
     * @param {pair[]} pairs
     * @param {number} timeScale
     */
    Resolver.solvePosition = function(pairs, timeScale) {
        var i,
            pair,
            collision,
            bodyA,
            bodyB,
            vertex,
            vertexCorrected,
            normal,
            bodyBtoA;

        // find impulses required to resolve penetration
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            vertex = collision.supports[0];
            vertexCorrected = collision.supportCorrected;
            normal = collision.normal;

            // get current separation between body edges involved in collision
            bodyBtoA = Vector.sub(Vector.add(bodyB.positionImpulse, vertex), 
                                    Vector.add(bodyA.positionImpulse, vertexCorrected));

            pair.separation = Vector.dot(normal, bodyBtoA);
        }
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            normal = collision.normal;
            positionImpulse = ((pair.separation * _positionDampen) - pair.slop) * timeScale;
        
            if (bodyA.isStatic || bodyB.isStatic)
                positionImpulse *= 2;
            
            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                bodyA.positionImpulse.x += normal.x * positionImpulse;
                bodyA.positionImpulse.y += normal.y * positionImpulse;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                bodyB.positionImpulse.x -= normal.x * positionImpulse;
                bodyB.positionImpulse.y -= normal.y * positionImpulse;
            }
        }
    };

    /**
     * Description
     * @method postSolvePosition
     * @param {body[]} bodies
     */
    Resolver.postSolvePosition = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.positionImpulse.x !== 0 || body.positionImpulse.y !== 0) {
                // move the body without changing velocity
                body.position.x += body.positionImpulse.x;
                body.position.y += body.positionImpulse.y;
                body.positionPrev.x += body.positionImpulse.x;
                body.positionPrev.y += body.positionImpulse.y;

                // update body geometry
                Vertices.translate(body.vertices, body.positionImpulse);
                Bounds.update(body.bounds, body.vertices, body.velocity);
                
                // dampen accumulator to warm the next step
                body.positionImpulse.x *= _positionWarming;
                body.positionImpulse.y *= _positionWarming;
            }
        }
    };

    /**
     * Description
     * @method preSolveVelocity
     * @param {pair[]} pairs
     */
    Resolver.preSolveVelocity = function(pairs) {
        var impulse = {},
            i,
            j,
            pair,
            contacts,
            collision,
            bodyA,
            bodyB,
            normal,
            tangent,
            contact,
            contactVertex,
            normalImpulse,
            tangentImpulse,
            offset;
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            contacts = pair.activeContacts;
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            normal = collision.normal;
            tangent = collision.tangent;
                
            // resolve each contact
            for (j = 0; j < contacts.length; j++) {
                contact = contacts[j];
                contactVertex = contact.vertex;
                normalImpulse = contact.normalImpulse;
                tangentImpulse = contact.tangentImpulse;
                
                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyA.position);
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyB.position);
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offset, impulse) * bodyB.inverseInertia;
                }
            }
        }
    };

    /**
     * Description
     * @method solveVelocity
     * @param {pair[]} pairs
     */
    Resolver.solveVelocity = function(pairs, timeScale) {
        var impulse = {},
            timeScaleSquared = timeScale * timeScale;
        
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            var collision = pair.collision,
                bodyA = collision.bodyA,
                bodyB = collision.bodyB,
                normal = collision.normal,
                tangent = collision.tangent,
                contacts = pair.activeContacts,
                contactShare = 1 / contacts.length;

            // update body velocities
            bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
            bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
            bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
            bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;

            // resolve each contact
            for (var j = 0; j < contacts.length; j++) {
                var contact = contacts[j],
                    contactVertex = contact.vertex,
                    offsetA = Vector.sub(contactVertex, bodyA.position),
                    offsetB = Vector.sub(contactVertex, bodyB.position),
                    velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity)),
                    velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity)), 
                    relativeVelocity = Vector.sub(velocityPointA, velocityPointB),
                    normalVelocity = Vector.dot(normal, relativeVelocity);

                var tangentVelocity = Vector.dot(tangent, relativeVelocity),
                    tangentSpeed = Math.abs(tangentVelocity),
                    tangentVelocityDirection = Common.sign(tangentVelocity);

                // raw impulses
                var normalImpulse = (1 + pair.restitution) * normalVelocity,
                    normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1);

                // coulomb friction
                var tangentImpulse = tangentVelocity;
                if (tangentSpeed > normalForce * pair.friction * timeScaleSquared)
                    tangentImpulse = normalForce * pair.friction * timeScaleSquared * tangentVelocityDirection;

                // modify impulses accounting for mass, inertia and offset
                var oAcN = Vector.cross(offsetA, normal),
                    oBcN = Vector.cross(offsetB, normal),
                    share = contactShare / (pair.inverseMass + bodyA.inverseInertia * oAcN * oAcN  + bodyB.inverseInertia * oBcN * oBcN);
                normalImpulse *= share;
                tangentImpulse *= share;
                
                // handle high velocity and resting collisions separately
                if (normalVelocity < 0 && normalVelocity * normalVelocity > _restingThresh * timeScaleSquared) {
                    // high velocity so clear cached contact impulse
                    contact.normalImpulse = 0;
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)

                    // impulse constraint, tends to 0
                    var contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                    
                    // tangent impulse, tends to -maxFriction or maxFriction
                    var contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -tangentSpeed, tangentSpeed);
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }
                
                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
                }
            }
        }
    };

})();