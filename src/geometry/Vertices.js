/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Vertices
*/

// TODO: convex decomposition - http://mnbayazit.com/406/bayazit

var Vertices = {};

(function() {

    /**
     * Description
     * @method create
     * @param {vertices} vertices
     * @param {body} body
     */
    Vertices.create = function(vertices, body) {
        for (var i = 0; i < vertices.length; i++) {
            vertices[i].index = i;
            vertices[i].body = body;
        }
    };

    /**
     * Description
     * @method fromPath
     * @param {string} path
     * @return {vertices} vertices
     */
    Vertices.fromPath = function(path) {
        var pathPattern = /L\s*([\-\d\.]*)\s*([\-\d\.]*)/ig,
            vertices = [];

        path.replace(pathPattern, function(match, x, y) {
            vertices.push({ x: parseFloat(x, 10), y: parseFloat(y, 10) });
        });

        return vertices;
    };

    /**
     * Description
     * @method centre
     * @param {vertices} vertices
     * @return {vector} The centre point
     */
    Vertices.centre = function(vertices) {
        var cx = 0, cy = 0;

        for (var i = 0; i < vertices.length; i++) {
            cx += vertices[i].x;
            cy += vertices[i].y;
        }

        return { x: cx / vertices.length, y: cy / vertices.length };
    };

    /**
     * Description
     * @method area
     * @param {vertices} vertices
     * @return {number} The area
     */
    Vertices.area = function(vertices) {
        var area = 0,
            j = vertices.length - 1;

        for (var i = 0; i < vertices.length; i++) {
            area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
            j = i;
        }

        return Math.abs(area) / 2;
    };

    /**
     * Description
     * @method inertia
     * @param {vertices} vertices
     * @param {number} mass
     * @return {number} The polygon's moment of inertia, using second moment of area
     */
    Vertices.inertia = function(vertices, mass) {
        var numerator = 0,
            denominator = 0,
            v = vertices,
            cross,
            j;

        // find the polygon's moment of inertia, using second moment of area
        // http://www.physicsforums.com/showthread.php?t=25293
        for (var n = 0; n < v.length; n++) {
            j = (n + 1) % v.length;
            cross = Math.abs(Vector.cross(v[j], v[n]));
            numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
            denominator += cross;
        }

        return (mass / 6) * (numerator / denominator);
    };

    /**
     * Description
     * @method translate
     * @param {vertices} vertices
     * @param {vector} vector
     * @param {number} scalar
     */
    Vertices.translate = function(vertices, vector, scalar) {
        var i;
        if (scalar) {
            for (i = 0; i < vertices.length; i++) {
                vertices[i].x += vector.x * scalar;
                vertices[i].y += vector.y * scalar;
            }
        } else {
            for (i = 0; i < vertices.length; i++) {
                vertices[i].x += vector.x;
                vertices[i].y += vector.y;
            }
        } 
    };

    /**
     * Description
     * @method rotate
     * @param {vertices} vertices
     * @param {number} angle
     * @param {vector} point
     */
    Vertices.rotate = function(vertices, angle, point) {
        if (angle === 0)
            return;

        var cos = Math.cos(angle),
            sin = Math.sin(angle);

        for (var i = 0; i < vertices.length; i++) {
            var vertice = vertices[i],
                dx = vertice.x - point.x,
                dy = vertice.y - point.y;
                
            vertice.x = point.x + (dx * cos - dy * sin);
            vertice.y = point.y + (dx * sin + dy * cos);
        }
    };

    /**
     * Description
     * @method contains
     * @param {vertices} vertices
     * @param {vector} point
     * @return {boolean} True if the vertices contains point, otherwise false
     */
    Vertices.contains = function(vertices, point) {
        for (var i = 0; i < vertices.length; i++) {
            var vertice = vertices[i],
                nextVertice = vertices[(i + 1) % vertices.length];
            if ((point.x - vertice.x) * (nextVertice.y - vertice.y) + (point.y - vertice.y) * (vertice.x - nextVertice.x) > 0) {
                return false;
            }
        }

        return true;
    };

})();