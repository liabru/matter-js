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

    var _overlapAB = {
        overlap: 0,
        axis: null,
        axisNumber: 0
    };

    var _overlapBA = {
        overlap: 0,
        axis: null,
        axisNumber: 0
    };

    /**
     * Creates a new collision record.
     * @private
     * @method create
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {collision} A new collision
     */
    SAT.create = function(bodyA, bodyB) {
        return { 
            collided: false,
            bodyA: bodyA,
            bodyB: bodyB,
            parentA: bodyA.parent,
            parentB: bodyB.parent,
            axisBodyA: bodyA, 
            axisBodyB: bodyB,
            axisNumber: 0,
            depth: 0,
            normal: { x: 0, y: 0 },
            tangent: { x: 0, y: 0 },
            penetration: { x: 0, y: 0 },
            supports: []
        };
    };

    /**
     * Detect collision between two bodies using the Separating Axis Theorem.
     * @method collides
     * @param {body} bodyA
     * @param {body} bodyB
     * @param {?collision} previousCollision
     * @param {?boolean} [previousPairActive=false]
     * @return {collision} collision
     */
    SAT.collides = function(bodyA, bodyB, previousCollision, pairActive) {
        var minOverlap,
            collision = previousCollision || SAT.create(bodyA, bodyB),
            canReusePrevCol;

        if (pairActive && previousCollision.collided) {
            // estimate total motion
            var parentA = bodyA.parent,
                parentB = bodyB.parent,
                motion = parentA.speed * parentA.speed + parentA.angularSpeed * parentA.angularSpeed
                       + parentB.speed * parentB.speed + parentB.angularSpeed * parentB.angularSpeed;

            // we may be able to (partially) reuse collision result 
            // but only safe if collision was resting
            canReusePrevCol = motion < 0.2;
        }

        if (canReusePrevCol) {
            // if we can reuse the collision result
            // we only need to test the previously found axis
            var axisBodyA = previousCollision.axisBodyA,
                axisBodyB = previousCollision.axisBodyB,
                axes = [axisBodyA.axes[previousCollision.axisNumber]];

            SAT._overlapAxes(_overlapAB, axisBodyA.vertices, axisBodyB.vertices, axes);
            
            if (_overlapAB.overlap <= 0) {
                collision.collided = false;
                return collision;
            }

            minOverlap = _overlapAB;
        } else {
            // if we can't reuse a result, perform a full SAT test

            SAT._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);

            if (_overlapAB.overlap <= 0) {
                collision.collided = false;
                return collision;
            }

            SAT._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);

            if (_overlapBA.overlap <= 0) {
                collision.collided = false;
                return collision;
            }

            if (_overlapAB.overlap < _overlapBA.overlap) {
                minOverlap = _overlapAB;
                collision.axisBodyA = bodyA;
                collision.axisBodyB = bodyB;
            } else {
                minOverlap = _overlapBA;
                collision.axisBodyA = bodyB;
                collision.axisBodyB = bodyA;
            }

            // important for reuse later
            collision.axisNumber = minOverlap.axisNumber;
        }

        collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
        collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
        collision.collided = true;
        collision.depth = minOverlap.overlap;
        collision.parentA = collision.bodyA.parent;
        collision.parentB = collision.bodyB.parent;
        
        bodyA = collision.bodyA;
        bodyB = collision.bodyB;

        var normal = collision.normal,
            supports = collision.supports;

        // ensure normal is facing away from bodyA
        if (Vector.dot(minOverlap.axis, Vector.sub(bodyB.position, bodyA.position)) < 0) {
            normal.x = minOverlap.axis.x;
            normal.y = minOverlap.axis.y;
        } else {
            normal.x = -minOverlap.axis.x;
            normal.y = -minOverlap.axis.y;
        }

        collision.tangent.x = -normal.y;
        collision.tangent.y = normal.x;

        collision.penetration.x = normal.x * collision.depth;
        collision.penetration.y = normal.y * collision.depth; 

        // find support points, there is always either exactly one or two
        var supportsB = SAT._findSupports(bodyA, bodyB, collision.normal, 1);

        // clear supports
        supports.length = 0;

        // find the supports from bodyB that are inside bodyA
        if (Vertices.contains(bodyA.vertices, supportsB[0]))
            supports.push(supportsB[0]);

        if (Vertices.contains(bodyA.vertices, supportsB[1]))
            supports.push(supportsB[1]);

        // find the supports from bodyA that are inside bodyB
        if (supports.length < 2) {
            var supportsA = SAT._findSupports(bodyB, bodyA, collision.normal, -1);

            if (Vertices.contains(bodyB.vertices, supportsA[0]))
                supports.push(supportsA[0]);

            if (supports.length < 2 && Vertices.contains(bodyB.vertices, supportsA[1]))
                supports.push(supportsA[1]);
        }

        // account for the edge case of overlapping but no vertex containment
        if (supports.length === 0)
            supports.push(supportsB[0]);

        return collision;
    };

    /**
     * Find the overlap between two sets of vertices.
     * @method _overlapAxes
     * @private
     * @param {object} result
     * @param {vertices} verticesA
     * @param {vertices} verticesB
     * @param {axes} axes
     */
    SAT._overlapAxes = function(result, verticesA, verticesB, axes) {
        var verticesALength = verticesA.length,
            verticesBLength = verticesB.length,
            verticesAX = verticesA[0].x,
            verticesAY = verticesA[0].y,
            verticesBX = verticesB[0].x,
            verticesBY = verticesB[0].y,
            axesLength = axes.length,
            overlapMin = Number.MAX_VALUE,
            overlapAxisNumber = 0,
            overlap,
            overlapAB,
            overlapBA,
            dot,
            i,
            j;

        for (i = 0; i < axesLength; i++) {
            var axis = axes[i],
                axisX = axis.x,
                axisY = axis.y,
                minA = verticesAX * axisX + verticesAY * axisY,
                minB = verticesBX * axisX + verticesBY * axisY,
                maxA = minA,
                maxB = minB;
            
            for (j = 1; j < verticesALength; j += 1) {
                dot = verticesA[j].x * axisX + verticesA[j].y * axisY;

                if (dot > maxA) { 
                    maxA = dot;
                } else if (dot < minA) { 
                    minA = dot;
                }
            }

            for (j = 1; j < verticesBLength; j += 1) {
                dot = verticesB[j].x * axisX + verticesB[j].y * axisY;

                if (dot > maxB) { 
                    maxB = dot;
                } else if (dot < minB) { 
                    minB = dot;
                }
            }

            overlapAB = maxA - minB;
            overlapBA = maxB - minA;
            overlap = overlapAB < overlapBA ? overlapAB : overlapBA;

            if (overlap < overlapMin) {
                overlapMin = overlap;
                overlapAxisNumber = i;

                if (overlap <= 0) {
                    // can not be intersecting
                    break;
                }
            } 
        }

        result.axis = axes[overlapAxisNumber];
        result.axisNumber = overlapAxisNumber;
        result.overlap = overlapMin;
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
     * Finds supporting vertices given two bodies along a given direction using hill-climbing.
     * @method _findSupports
     * @private
     * @param {body} bodyA
     * @param {body} bodyB
     * @param {vector} normal
     * @param {number} direction
     * @return [vector]
     */
    SAT._findSupports = function(bodyA, bodyB, normal, direction) {
        var vertices = bodyB.vertices,
            verticesLength = vertices.length,
            bodyAPositionX = bodyA.position.x,
            bodyAPositionY = bodyA.position.y,
            normalX = normal.x * direction,
            normalY = normal.y * direction,
            nearestDistance = Number.MAX_VALUE,
            vertexA,
            vertexB,
            vertexC,
            distance,
            j;

        // find deepest vertex relative to the axis
        for (j = 0; j < verticesLength; j += 1) {
            vertexB = vertices[j];
            distance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);

            // convex hill-climbing
            if (distance < nearestDistance) {
                nearestDistance = distance;
                vertexA = vertexB;
            }
        }

        // measure next vertex
        vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];
        nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);

        // compare with previous vertex
        vertexB = vertices[(vertexA.index + 1) % verticesLength];
        if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {
            return [vertexA, vertexB];
        }

        return [vertexA, vertexC];
    };

})();
