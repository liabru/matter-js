/**
* Functions for performing collision queries
*
* @class Query
*/

var Query = {};

(function() {

    /**
     * Casts a ray segment against a set of bodies and returns all collisions, ray width is optional. Intersection points are not provided.
     * @method ray
     * @param {body[]} bodies
     * @param {vector} startPoint
     * @param {vector} endPoint
     * @return {object[]} Collisions
     */
    Query.ray = function(bodies, startPoint, endPoint, rayWidth) {
        var rayAngle = Vector.angle(startPoint, endPoint),
            rayWidth = rayWidth || Number.MIN_VALUE,
            rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)),
            rayX = (endPoint.x + startPoint.x) * 0.5,
            rayY = (endPoint.y + startPoint.y) * 0.5,
            ray = Bodies.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }),
            collisions = [];

        for (var i = 0; i < bodies.length; i++) {
            var bodyA = bodies[i];

            if (Bounds.overlaps(bodyA.bounds, ray.bounds)) {
                var collision = SAT.collides(bodyA, ray);
                if (collision.collided) {
                    collision.body = collision.bodyA = collision.bodyB = bodyA;
                    collisions.push(collision);
                }
            }
        }

        return collisions;
    };

})();