/**
* The `Matter.Grid` module contains methods for creating and manipulating collision broadphase grid structures.
*
* @class Grid
*/

var Grid = {};

module.exports = Grid;

var Projections = require('../geometry/Projections');
var Common = require('../core/Common');

(function() {

    /**
     * Creates a new grid.
     * @method create
     * @param {} options
     * @return {grid} A new grid
     */
    Grid.create = function(options) {
        var defaults = {
            controller: Grid,
            buckets: [],
            bucketWidth: 48,
            bucketHeight: 48
        };

        return Common.extend(defaults, options);
    };

    /**
     * The width of a single grid bucket.
     *
     * @property bucketWidth
     * @type number
     * @default 48
     */

    /**
     * The height of a single grid bucket.
     *
     * @property bucketHeight
     * @type number
     * @default 48
     */

    /**
     * Updates the grid.
     * @method update
     * @param {grid} grid
     * @param {body[]} bodies
     * @param {engine} engine
     */
    Grid.update = function(grid, bodies, engine) {
        var i, col, row,
            buckets = grid.buckets,
            world = engine.world,
            worldMinX = world.bounds.min.x,
            worldMaxX = world.bounds.max.x,
            worldMinY = world.bounds.min.y,
            worldMaxY = world.bounds.max.y,
            worldBounded = isFinite(worldMinX) ||
                isFinite(worldMaxX) ||
                isFinite(worldMinY) ||
                isFinite(worldMaxY);

        // @if DEBUG
        var metrics = engine.metrics;
        metrics.broadphaseTests = 0;
        // @endif

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isSleeping)
                continue;

            // don't update out of world bodies
            var bounds = body.bounds;
            if (worldBounded && (bounds.max.x < worldMinX || bounds.min.x > worldMaxX
                || bounds.max.y < worldMinY || bounds.min.y > worldMaxY))
                continue;

            var newRegion = Grid._getRegion(grid, bounds);
            var oldRegion = body.region;

            // set the new region
            body.region = newRegion;

            // if the body has changed grid region
            if (
                newRegion.startCol === oldRegion.startCol &&
                newRegion.endCol === oldRegion.endCol &&
                newRegion.startRow === oldRegion.startRow &&
                newRegion.endRow === oldRegion.endRow
            ) {
                continue;
            }

            // @if DEBUG
            metrics.broadphaseTests += 1;
            // @endif

            var startCol = Math.min(newRegion.startCol, oldRegion.startCol),
                endCol = Math.max(newRegion.endCol, oldRegion.endCol),
                startRow = Math.min(newRegion.startRow, oldRegion.startRow),
                endRow = Math.max(newRegion.endRow, oldRegion.endRow);

            // update grid buckets affected by region change
            // iterate over the union of both regions
            for (col = startCol; col <= endCol; col++) {
                var isInsideNewColumn = (col >= newRegion.startCol && col <= newRegion.endCol);
                var isInsideOldColumn = (col >= oldRegion.startCol && col <= oldRegion.endCol);

                for (row = startRow; row <= endRow; row++) {
                    var isInsideNewRegion = isInsideNewColumn && (row >= newRegion.startRow && row <= newRegion.endRow);
                    var isInsideOldRegion = isInsideOldColumn && (row >= oldRegion.startRow && row <= oldRegion.endRow);

                    // remove from old region buckets
                    if (isInsideOldRegion) {
                        if (!isInsideNewRegion) {
                            Grid._bucketRemoveBody(grid, body, buckets[col][row]);
                        }
                    } else if (isInsideNewRegion) {
                        Grid._bucketAddBody(grid, body, buckets, col, row);
                    }
                }
            }
        }
    };

    Grid.clear = function(grid, bodies) {
        grid.buckets = [];
        for (var i = 0; i < bodies.length; i++) {
            bodies.pairs.length = 0;
        }
    };

    Grid.removeBodies = function (grid, bodies) {
        var i, col, row,
            buckets = grid.buckets;

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                region = body.region,
                startCol = region.startCol,
                endCol = region.endCol,
                startRow = region.startRow,
                endRow = region.endRow;

            for (col = startCol; col <= endCol; col++) {
                for (row = startRow; row <= endRow; row++) {
                    Grid._bucketRemoveBody(grid, body, buckets[col][row]);
                }
            }

            body.region = null;
            body.pairs.length = 0;
        }
    };

    Grid.addBodies = function(grid, bodies, world) {
        var i, col, row,
            buckets = grid.buckets,
            worldMinX = world.bounds.min.x,
            worldMaxX = world.bounds.max.x,
            worldMinY = world.bounds.min.y,
            worldMaxY = world.bounds.max.y,
            worldBounded = isFinite(worldMinX) ||
                isFinite(worldMaxX) ||
                isFinite(worldMinY) ||
                isFinite(worldMaxY);

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            // don't update out of world bodies
            var bounds = body.bounds;
            if (worldBounded && (bounds.max.x < worldMinX || bounds.min.x > worldMaxX
                || bounds.max.y < worldMinY || bounds.min.y > worldMaxY))
                continue;

            var newRegion = Grid._getRegion(grid, bounds);

            // set the new region
            body.region = newRegion;

            // update grid buckets affected by region change
            // iterate over the union of both regions
            for (col = newRegion.startCol; col <= newRegion.endCol; col++) {
                for (row = newRegion.startRow; row <= newRegion.endRow; row++) {
                    Grid._bucketAddBody(grid, body, buckets, col, row);
                }
            }
        }
    };

    /**
     * Gets the region a given body falls in for a given grid.
     * @method _getRegion
     * @private
     * @param {} grid
     * @param {} body
     * @return {} region
     */
    Grid._getRegion = function(grid, bounds) {
        return { 
            startCol: Math.floor(bounds.min.x / grid.bucketWidth), 
            endCol: Math.floor(bounds.max.x / grid.bucketWidth), 
            startRow: Math.floor(bounds.min.y / grid.bucketHeight), 
            endRow: Math.floor(bounds.max.y / grid.bucketHeight) 
        };
    };

    /**
     * Adds a body to a bucket.
     * @method _bucketAddBody
     * @private
     * @param {} grid
     * @param {} bucket
     * @param {} body
     */
    Grid._bucketAddBody = function(grid, body, buckets, col, row) {
        // add new pairs
        var bucketCol = buckets[col] || (buckets[col] = []),
            bucket = bucketCol[row] || (bucketCol[row] = []);

        var bodyA;
        for (var i = 0; i < bucket.length; i++) {
            var bodyB = bucket[i];

            if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))
                continue;

            // keep track of the number of buckets the pair exists in
            // important for Grid.update to work
            if (body.id < bodyB.id) {
                bodyA = body;
            } else {
                bodyA = bodyB;
                bodyB = body;
            }

            // TODO: work with linked list for improved performance?
            var pairs = bodyA.pairs;
            for (var p = 0; p < pairs.length; p += 1) {
                var pair = pairs[p];
                if (pair[0] === bodyB) {
                    pair[1] += 1;
                    break;
                } else if (pair[1].id > bodyB.id) {
                    pairs.splice(p, 0, [bodyB, 1]);
                    break;
                }
            }

            if (p === pairs.length)
                pairs.push([bodyB, 1]);
        }

        // add to bodies (after pairs, otherwise pairs with self)
        bucket.push(body);
    };

    /**
     * Removes a body from a bucket.
     * @method _bucketRemoveBody
     * @private
     * @param {} grid
     * @param {} bucket
     * @param {} body
     */
    Grid._bucketRemoveBody = function(grid, body, bucket) {
        // remove from bucket
        bucket.splice(Common.indexOf(bucket, body), 1);

        // update pair counts
        var bodyA;
        for (var i = 0; i < bucket.length; i++) {
            // keep track of the number of buckets the pair exists in
            // important for Grid.update to work
            var bodyB = bucket[i];
            if (body.id < bodyB.id) {
                bodyA = body;
            } else {
                bodyA = bodyB;
                bodyB = body;
            }

            var pairs = bodyA.pairs;
            for (var p = 0; p < pairs.length; p += 1) {
                var pair = pairs[p];
                if (pair[0] === bodyB) {
                    if (pair[1] === 1) {
                        pairs.splice(p, 1);
                    } else {
                        pair[1] -= 1;
                    }
                    break;
                }
            }
        }
    };
    
})();
