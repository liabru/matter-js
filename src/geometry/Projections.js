/**
* The `Matter.Projections` module contains methods for creating projections.
* A `Matter.Projections` object is an array of projections in the form `{ min: 0, max: 0 }`.
*
* @class Projections
*/

var Projections = {};

module.exports = Projections;

(function() {

    /**
     * Creates a new set of `Matter.Body` compatible projections.
     * The `count` argument accepts an integer corresponding the number of projections to initialize
     *
     * The `Projections.create` method returns a new array of projections.
     *
     * @method create
     * @param {count} number of projections
     */
    Projections.create = function (count) {
        var projections = new Array(count);
        for (var i = 0; i < projections.length; i++) {
            projections[i] = { min: 0, max: 0 };
        }
        return projections;
    };

    /**
     * Replace the given projections by the projection of the given vertices onto the given axes.
     *
     * @method verticesOntoAxes
     * @param {projection[]} projections
     * @param {vertex[]} vertices
     * @param {axis[]} axes
     */
    Projections.verticesOntoAxes = function(projections, vertices, axes) {
        for (var i = 0; i < projections.length; i++) {
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

            projection.min = min;
            projection.max = max;
        }
    };
})();