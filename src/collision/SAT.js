/**
* The `Matter.SAT` module contains methods for detecting collisions using the Separating Axis Theorem.
*
* @class SAT
*/

// TODO: true circles and curves

var SAT = {};

module.exports = SAT;

var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');

(function() {

    /**
     * Detect collision between two bodies using the Separating Axis Theorem.
     * @method collides
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {collision} collision
     */
    SAT.collides = function(bodyA, bodyB) {
        var overlapAB =  SAT._overlapAxes(bodyA.vertices, bodyB.vertices, bodyA.axes);
        if (overlapAB.overlap <= 0) {
            return null;
        }

        var overlapBA =  SAT._overlapAxes(bodyB.vertices, bodyA.vertices, bodyB.axes);
        if (overlapBA.overlap <= 0) {
            return null;
        }

        var minOverlap = (overlapAB.overlap < overlapBA.overlap) ? overlapAB : overlapBA;

        // ensure normal is facing away from bodyA
        var positionA = bodyA.position,
            positionB = bodyB.position,
            axis = minOverlap.axis,
            normal;

        if (axis.x * (positionB.x - positionA.x) + axis.y * (positionB.y - positionA.y) < 0) {
            normal = {
                x: axis.x,
                y: axis.y
            };
        } else {
            normal = {
                x: -axis.x,
                y: -axis.y
            };
        }

        // find support points, there is always either exactly one or two
        var verticesA = bodyA.vertices,
            verticesB = bodyB.vertices,
            potentialSupportsB = SAT._findSupports(bodyA, verticesB, normal),
            supportCount = 0,
            supports = new Array(2);

        // find the supports from bodyB that are inside bodyA
        if (Vertices.contains(verticesA, potentialSupportsB[0])) {
            supports[supportCount++] = potentialSupportsB[0];
        }

        if (Vertices.contains(verticesA, potentialSupportsB[1]))
            supports[supportCount++] = potentialSupportsB[1];

        // find the supports from bodyA that are inside bodyB
        if (supportCount < 2) {
            var potentialSupportsA =  SAT._findSupports(bodyB, verticesA, Vector.neg(normal));
                
            if (Vertices.contains(verticesB, potentialSupportsA[0]))
                supports[supportCount++] = potentialSupportsA[0];

            if (supportCount < 2) {
                if (Vertices.contains(verticesB, potentialSupportsA[1]))
                    supports[supportCount++] = potentialSupportsA[1];

                if (supportCount < 2) {
                    supports[1] = null;

                    // account for the edge case of overlapping but no vertex containment
                    if (supportCount < 1)
                        supports[supportCount++] = potentialSupportsB[0];
                }

            }
        }

        var depth = minOverlap.overlap;
        var parentA = bodyA.parent;
        var parentB = bodyB.parent;
        return {
            bodyA: bodyA,
            bodyB: bodyB,
            parentA: parentA,
            parentB: parentB,
            separation: depth,
            normal: normal,
            tangent: {
                x: -normal.y,
                y: normal.x
            },
            penetration: {
                x: normal.x * depth,
                y: normal.y * depth
            },
            contacts: supports,
            contactCount: supportCount,
            isSensor: bodyA.isSensor || bodyB.isSensor,
            inverseMass: parentA.inverseMass + parentB.inverseMass,
            friction: Math.min(parentA.friction, parentB.friction),
            frictionStatic: Math.max(parentA.frictionStatic, parentB.frictionStatic),
            restitution: Math.max(parentA.restitution, parentB.restitution),
            slop: Math.max(parentA.slop, parentB.slop)
        };
    };

    /**
     * Find the overlap between two sets of vertices.
     * @method _overlapAxes
     * @private
     * @param {} verticesA
     * @param {} verticesB
     * @param {} axes
     * @return result
     */
    SAT._overlapAxes = function(verticesA, verticesB, axes) {
        var projectionA = Vector._temp[0], 
            projectionB = Vector._temp[1],
            result = { overlap: Number.MAX_VALUE },
            overlap,
            axis;

        for (var i = 0; i < axes.length; i++) {
            axis = axes[i];

            SAT._projectToAxis(projectionA, verticesA, axis);
            SAT._projectToAxis(projectionB, verticesB, axis);

            overlap = Math.min(projectionA.max - projectionB.min, projectionB.max - projectionA.min);

            if (overlap <= 0) {
                result.overlap = overlap;
                return result;
            }

            if (overlap < result.overlap) {
                result.overlap = overlap;
                result.axis = axis;
            }
        }

        return result;
    };

    /**
     * Projects vertices on an axis and returns an interval.
     * @method _projectToAxis
     * @private
     * @param {} projection
     * @param {} vertices
     * @param {} axis
     */
    SAT._projectToAxis = function(projection, vertices, axis) {
        var min = Vector.dot(vertices[0], axis),
            max = min;

        for (var i = 1; i < vertices.length; i += 1) {
            var dot = Vector.dot(vertices[i], axis);

            if (dot > max) { 
                max = dot; 
            } else if (dot < min) { 
                min = dot; 
            }
        }

        projection.min = min;
        projection.max = max;
    };
    
    /**
     * Finds supporting vertices given a body and a set of vertices along a given direction using hill-climbing.
     * @method _findSupports
     * @private
     * @param {} body
     * @param {} vertices
     * @param {} normal
     * @return [vector]
     */
    SAT._findSupports = function(body, vertices, normal) {
        var nearestDistance = Number.MAX_VALUE,
            vertexToBodyX,
            vertexToBodyY,
            position = body.position,
            positionX = position.x,
            positionY = position.y,
            distance,
            vertex,
            vertexA,
            vertexB;

        // find closest vertex
        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            vertexToBodyX = vertex.x - positionX;
            vertexToBodyY = vertex.y - positionY;
            distance = -(normal.x * vertexToBodyX + normal.y * vertexToBodyY);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                vertexA = vertex;
            }
        }

        // find next closest vertex using the two connected to it
        var prevIndex = vertexA.index - 1 >= 0 ? vertexA.index - 1 : vertices.length - 1;
        vertex = vertices[prevIndex];
        vertexToBodyX = vertex.x - positionX;
        vertexToBodyY = vertex.y - positionY;
        nearestDistance = -(normal.x * vertexToBodyX + normal.y * vertexToBodyY);
        vertexB = vertex;

        var nextIndex = (vertexA.index + 1) % vertices.length;
        vertex = vertices[nextIndex];
        vertexToBodyX = vertex.x - positionX;
        vertexToBodyY = vertex.y - positionY;
        distance = -(normal.x * vertexToBodyX + normal.y * vertexToBodyY);
        if (distance < nearestDistance) {
            vertexB = vertex;
        }

        return [vertexA, vertexB];
    };

})();
