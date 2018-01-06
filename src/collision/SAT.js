/**
* The `Matter.SAT` module contains methods for detecting collisions using the Separating Axis Theorem.
*
* @class SAT
*/

// TODO: true circles and curves

var SAT = {};

module.exports = SAT;

var Vertices = require('../geometry/Vertices');

(function() {

    SAT._temp = [{ depth: 0, axes: null }, { depth: 0, axes: null }];

    /**
     * Detect collision between two bodies using the Separating Axis Theorem.
     * @method collides
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {collision} collision
     */
    SAT.collides = function(bodyA, bodyB) {
        var overlapAB = SAT._temp[0];
        if (!SAT._overlapAxes(bodyA, bodyB.vertices, overlapAB)) {
            return null;
        }

        var overlapBA = SAT._temp[1];
        if (!SAT._overlapAxes(bodyB, bodyA.vertices, overlapBA)) {
            return null;
        }

        var minOverlap = (overlapAB.depth < overlapBA.depth) ? overlapAB : overlapBA;

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
            potentialSupportsB = SAT._findSupports(bodyA, verticesB, -normal.x, -normal.y),
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
            var potentialSupportsA =  SAT._findSupports(bodyB, verticesA, normal.x, normal.y);
                
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

        var depth = minOverlap.depth;
        var parentA = bodyA.parent;
        var parentB = bodyB.parent;
        return {
            idA: bodyA.id,
            idB: bodyB.id,
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
     * Find the overlap between a body and a set of vertices
     * @method _overlapAxes
     * @private
     * @param {} body
     * @param {} vertices
     * @param {} axes
     * @return result
     */
    SAT._overlapAxes = function(body, vertices, overlap) {
        var projections = body.projections,
            axes = body.axes;

        overlap.depth = Number.MAX_VALUE;
        for (var i = 0; i < axes.length; i++) {
            var projection = projections[i],
                axis = axes[i],
                axisX = axis.x,
                axisY = axis.y,
                vertex = vertices[0],
                min = vertex.x * axisX + vertex.y * axisY,
                max = min;

            for (var j = 1; j < vertices.length; j += 1) {
                vertex = vertices[j];

                var dot = vertex.x * axisX + vertex.y * axisY;
                if (dot > max) { 
                    max = dot; 
                } else if (dot < min) { 
                    min = dot; 
                }
            }
            
            var depth = Math.min(projection.max - min, max - projection.min);
            if (depth <= 0) {
                return;
            }

            if (depth < overlap.depth) {
                overlap.depth = depth;
                overlap.axis = axis;
            }
        }

        return overlap;
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
    SAT._findSupports = function(body, vertices, normalX, normalY) {
        var nearestDistance = Number.MAX_VALUE,
            secondNearestDistance = nearestDistance,
            vertexToBodyX,
            vertexToBodyY,
            position = body.position,
            positionX = position.x,
            positionY = position.y,
            distance,
            vertex,
            vertexA,
            vertexB;

        // find two closest vertices
        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            vertexToBodyX = vertex.x - positionX;
            vertexToBodyY = vertex.y - positionY;
            distance = normalX * vertexToBodyX + normalY * vertexToBodyY;

            if (distance < nearestDistance) {
                secondNearestDistance = nearestDistance;
                vertexB = vertexA;

                nearestDistance = distance;
                vertexA = vertex;
            } else if (distance < secondNearestDistance) {
                secondNearestDistance = distance;
                vertexB = vertex;
            }
        }

        return [vertexA, vertexB];
    };

})();
