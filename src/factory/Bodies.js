/**
* The `Matter.Bodies` module contains factory methods for creating rigid body models 
* with commonly used body configurations (such as rectangles, circles and other polygons).
*
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Bodies
*/

// TODO: true circle bodies

var Bodies = {};

(function() {

    /**
     * Creates a new rigid body model with a rectangle hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method rectangle
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {object} [options]
     * @return {body} A new rectangle body
     */
    Bodies.rectangle = function(x, y, width, height, options) {
        options = options || {};

        var rectangle = { 
            label: 'Rectangle Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            rectangle.vertices = Vertices.chamfer(rectangle.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, rectangle, options));
    };
    
    /**
     * Creates a new rigid body model with a trapezoid hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method trapezoid
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {number} slope
     * @param {object} [options]
     * @return {body} A new trapezoid body
     */
    Bodies.trapezoid = function(x, y, width, height, slope, options) {
        options = options || {};

        slope *= 0.5;
        var roof = (1 - (slope * 2)) * width;
        
        var x1 = width * slope,
            x2 = x1 + roof,
            x3 = x2 + x1;

        var trapezoid = { 
            label: 'Trapezoid Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath('L 0 0 L ' + x1 + ' ' + (-height) + ' L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0')
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            trapezoid.vertices = Vertices.chamfer(trapezoid.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, trapezoid, options));
    };

    /**
     * Creates a new rigid body model with a circle hull. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method circle
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {object} [options]
     * @param {number} [maxSides]
     * @return {body} A new circle body
     */
    Bodies.circle = function(x, y, radius, options, maxSides) {
        options = options || {};
        options.label = 'Circle Body';
        
        // approximate circles with polygons until true circles implemented in SAT

        maxSides = maxSides || 25;
        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

        // optimisation: always use even number of sides (half the number of unique axes)
        if (sides % 2 === 1)
            sides += 1;

        // flag for better rendering
        options.circleRadius = radius;

        return Bodies.polygon(x, y, sides, radius, options);
    };

    /**
     * Creates a new rigid body model with a regular polygon hull with the given number of sides. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method polygon
     * @param {number} x
     * @param {number} y
     * @param {number} sides
     * @param {number} radius
     * @param {object} [options]
     * @return {body} A new regular polygon body
     */
    Bodies.polygon = function(x, y, sides, radius, options) {
        options = options || {};

        if (sides < 3)
            return Bodies.circle(x, y, radius, options);

        var theta = 2 * Math.PI / sides,
            path = '',
            offset = theta * 0.5;

        for (var i = 0; i < sides; i += 1) {
            var angle = offset + (i * theta),
                xx = Math.cos(angle) * radius,
                yy = Math.sin(angle) * radius;

            path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
        }

        var polygon = { 
            label: 'Polygon Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath(path)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, polygon, options));
    };

    /**
     * Creates a body using the supplied vertices.
     * If the vertices are not convex, they will be decomposed if [poly-decomp.js](https://github.com/schteppe/poly-decomp.js) is available.
     * If the vertices can not be decomposed, the function will use the convex hull.
     * By default the decomposition will discard collinear edges (to improve performance).
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method fromVertices
     * @param {number} x
     * @param {number} y
     * @param [vector] vertices
     * @param {object} [options]
     * @param {bool} [removeCollinear=true]
     * @return {body}
     */
    Bodies.fromVertices = function(x, y, vertices, options, removeCollinear) {
        var canDecompose = true,
            body,
            i;

        options = options || {};
        removeCollinear = typeof removeCollinear !== 'undefined' ? removeCollinear : true;

        if (Vertices.isConvex(vertices)) {
            // vertices are convex, so just create a body normally
            body = {
                position: { x: x, y: y },
                vertices: vertices
            };

            return Body.create(Common.extend({}, body, options));
        }

        // check for poly-decomp.js
        if (!window.decomp) {
            Common.log('Bodies.fromVertices: poly-decomp.js required. Could not decompose vertices. Fallback to convex hull.', 'warn');
            canDecompose = false;
        }

        // initialise a decomposition
        var concave = new decomp.Polygon();
        for (i = 0; i < vertices.length; i++) {
            concave.vertices.push([vertices[i].x, vertices[i].y]);
        }

        // check for complexity
        if (!concave.isSimple()) {
            Common.log('Bodies.fromVertices: Non-simple polygons are not supported. Could not decompose vertices. Fallback to convex hull.', 'warn');
            canDecompose = false;
        }

        // try to decompose
        if (canDecompose) {
            // vertices are concave and simple, we can decompose into parts
            concave.makeCCW();
            if (removeCollinear)
                concave.removeCollinearPoints(0.001);

            var decomposed = concave.quickDecomp(),
                parts = [];

            // for each decomposed chunk
            for (i = 0; i < decomposed.length; i++) {
                var chunk = decomposed[i],
                    chunkVertices = [];

                // convert vertices into the correct structure
                for (var j = 0; j < chunk.vertices.length; j++) {
                    chunkVertices.push({ x: chunk.vertices[j][0], y: chunk.vertices[j][1] });
                }

                // create a compound part
                parts.push(
                    Body.create(Common.extend({
                        position: Vertices.centre(chunkVertices),
                        vertices: chunkVertices
                    }, options))
                );
            }

            // create the parent body to be returned, that contains generated compound parts
            body = Body.create(Common.extend({}, { parts: parts }, options));
            Body.setPosition(body, { x: x, y: y });

            return body;
        } else {
            // fallback to convex hull when decomposition is not possible
            body = {
                position: { x: x, y: y },
                vertices: Vertices.hull(vertices)
            };

            return Body.create(Common.extend({}, body, options));
        }
    };

})();
