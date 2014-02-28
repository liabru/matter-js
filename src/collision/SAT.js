/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class SAT
*/


// TODO: true circles and curves
// TODO: cache the previously found axis and body, and start there first for faster early out

var SAT = {};

(function() {

    /**
     * Description
     * @method collides
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {collision} collision
     */
    SAT.collides = function(bodyA, bodyB) {
        var overlapAB,
            overlapBA, 
            minOverlap,
            collision = { collided: false, bodyA: bodyA, bodyB: bodyB};

        overlapAB = _overlapAxes(bodyA.vertices, bodyB.vertices, bodyA.axes);

        if (overlapAB.overlap === 0)
            return collision;

        overlapBA = _overlapAxes(bodyB.vertices, bodyA.vertices, bodyB.axes);

        if (overlapBA.overlap === 0)
            return collision;

        if (overlapAB.overlap < overlapBA.overlap) {
            minOverlap = overlapAB;
        } else {
            minOverlap = overlapBA;
            collision.bodyA = bodyB;
            collision.bodyB = bodyA;
        }

        collision.collided = true;
        collision.normal = minOverlap.axis;
        collision.depth = minOverlap.overlap;
        
        bodyA = collision.bodyA;
        bodyB = collision.bodyB;

        // ensure normal is facing away from bodyA
        if (Vector.dot(collision.normal, Vector.sub(bodyB.position, bodyA.position)) > 0) 
            collision.normal = Vector.neg(collision.normal);

        collision.tangent = Vector.perp(collision.normal);

        collision.penetration = { 
            x: collision.normal.x * collision.depth, 
            y: collision.normal.y * collision.depth 
        };

        // find support points, there is always either exactly one or two
        var verticesB = _findSupports(bodyA, bodyB, collision.normal),
            supports = [verticesB[0]];
        
        if (Vertices.contains(bodyA.vertices, verticesB[1])) {
            supports.push(verticesB[1]);
        } else {
            var verticesA = _findSupports(bodyB, bodyA, Vector.neg(collision.normal));
            
            if (Vertices.contains(bodyB.vertices, verticesA[0])) {
                supports.push(verticesA[0]);
            }

            if (supports.length < 2 && Vertices.contains(bodyB.vertices, verticesA[1])) {
                supports.push(verticesA[1]);
            }
        }
        
        collision.supports = supports;
        collision.supportCorrected = Vector.sub(verticesB[0], collision.penetration);

        return collision;
    };

    /**
     * Description
     * @method _overlapAxes
     * @private
     * @param {} verticesA
     * @param {} verticesB
     * @param {} axes
     * @return result
     */
    var _overlapAxes = function(verticesA, verticesB, axes) {
        var projectionA = {}, 
            projectionB = {},
            result = { overlap: Number.MAX_VALUE },
            overlap,
            axis;

        for (var i = 0; i < axes.length; i++) {
            axis = axes[i];

            _projectToAxis(projectionA, verticesA, axis);
            _projectToAxis(projectionB, verticesB, axis);

            overlap = projectionA.min < projectionB.min 
                        ? projectionA.max - projectionB.min 
                        : projectionB.max - projectionA.min;

            if (overlap <= 0)
                return { overlap: 0 };

            if (overlap < result.overlap) {
                result.overlap = overlap;
                result.axis = axis;
            }
        }

        return result;
    };

    /**
     * Description
     * @method _projectToAxis
     * @private
     * @param {} projection
     * @param {} vertices
     * @param {} axis
     */
    var _projectToAxis = function(projection, vertices, axis) {
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
     * Description
     * @method _findSupports
     * @private
     * @param {} bodyA
     * @param {} bodyB
     * @param {} normal
     * @return ArrayExpression
     */
    var _findSupports = function(bodyA, bodyB, normal) {
        var nearestDistance = Number.MAX_VALUE,
            vertexToBody = { x: 0, y: 0 },
            vertices = bodyB.vertices,
            bodyAPosition = bodyA.position,
            distance,
            vertex,
            vertexA = vertices[0],
            vertexB = vertices[1];

        // find closest vertex on bodyB
        for (var i = 0; i < vertices.length; i++) {
            vertex = vertices[i];
            vertexToBody.x = vertex.x - bodyAPosition.x;
            vertexToBody.y = vertex.y - bodyAPosition.y;
            distance = -Vector.dot(normal, vertexToBody);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                vertexA = vertex;
            }
        }

        // find next closest vertex using the two connected to it
        var prevIndex = vertexA.index - 1 >= 0 ? vertexA.index - 1 : vertices.length - 1;
        vertex = vertices[prevIndex];
        vertexToBody.x = vertex.x - bodyAPosition.x;
        vertexToBody.y = vertex.y - bodyAPosition.y;
        nearestDistance = -Vector.dot(normal, vertexToBody);
        vertexB = vertex;

        var nextIndex = (vertexA.index + 1) % vertices.length;
        vertex = vertices[nextIndex];
        vertexToBody.x = vertex.x - bodyAPosition.x;
        vertexToBody.y = vertex.y - bodyAPosition.y;
        distance = -Vector.dot(normal, vertexToBody);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            vertexB = vertex;
        }

        return [vertexA, vertexB];
    };

})();