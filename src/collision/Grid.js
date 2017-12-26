/**
* The `Matter.Grid` module contains methods for creating and manipulating collision broadphase grid structures.
*
* @class Grid
*/

var Grid = {};

module.exports = Grid;

var Pair = require('./Pair');
var Detector = require('./Detector');
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
            detector: Detector.collisions,
            buckets: {},
            pairs: {},
            pairsList: [],
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
     * @param {boolean} forceUpdate
     */
    Grid.update = function(grid, bodies, engine, forceUpdate) {
        var i, col, row,
            world = engine.world,
            buckets = grid.buckets,
            bucket,
            bucketId,
            gridChanged = false;

        // @if DEBUG
        var metrics = engine.metrics;
        metrics.broadphaseTests = 0;
        // @endif

        var pairsList = [];

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (!body.isSleeping || forceUpdate) {

                // don't update out of world bodies
                var bounds = body.bounds;
                if (bounds.max.x < world.bounds.min.x || bounds.min.x > world.bounds.max.x
                    || bounds.max.y < world.bounds.min.y || bounds.min.y > world.bounds.max.y)
                    continue;

                var newRegion = Grid._getRegion(grid, bounds);
                var oldRegion = body.region;

                // if the body has changed grid region
                if (
                    !oldRegion ||
                    newRegion.startCol !== oldRegion.startCol ||
                    newRegion.endCol !== oldRegion.endCol ||
                    newRegion.startRow !== oldRegion.startRow ||
                    newRegion.endRow !== oldRegion.endRow ||
                    forceUpdate
                ) {

                    // @if DEBUG
                    metrics.broadphaseTests += 1;
                    // @endif

                    if (!oldRegion || forceUpdate)
                        oldRegion = newRegion;

                    var union = Grid._regionUnion(newRegion, oldRegion);

                    // update grid buckets affected by region change
                    // iterate over the union of both regions
                    for (col = union.startCol; col <= union.endCol; col++) {
                        for (row = union.startRow; row <= union.endRow; row++) {
                            bucketId = Grid._getBucketId(col, row);
                            bucket = buckets[bucketId];

                            var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol
                                                    && row >= newRegion.startRow && row <= newRegion.endRow);

                            var isInsideOldRegion = (col >= oldRegion.startCol && col <= oldRegion.endCol
                                                    && row >= oldRegion.startRow && row <= oldRegion.endRow);

                            // remove from old region buckets
                            if (!isInsideNewRegion && isInsideOldRegion) {
                                if (bucket)
                                    Grid._bucketRemoveBody(grid, bucket, body);
                            }

                            // add to new region buckets
                            if (oldRegion === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
                                if (!bucket)
                                    bucket = Grid._createBucket(buckets, bucketId);
                                Grid._bucketAddBody(grid, bucket, body);
                            }
                        }
                    }

                    // set the new region
                    body.region = newRegion;

                    // flag changes so we can update pairs
                    gridChanged = true;
                }
            }

            var pairs = body.pairs;
            for (var p = 0; p < pairs.length; p += 1)
                pairsList.push(pairs[p]);
        }

        grid.pairsList = pairsList;
    };

    /**
     * Clears the grid.
     * @method clear
     * @param {grid} grid
     */
    Grid.clear = function(grid) {
        grid.buckets = {};
        grid.pairs = {};
        grid.pairsList = [];
    };

    /**
     * Finds the union of two regions.
     * @method _regionUnion
     * @private
     * @param {} regionA
     * @param {} regionB
     * @return {} region
     */
    Grid._regionUnion = function(regionA, regionB) {
        var startCol = Math.min(regionA.startCol, regionB.startCol),
            endCol = Math.max(regionA.endCol, regionB.endCol),
            startRow = Math.min(regionA.startRow, regionB.startRow),
            endRow = Math.max(regionA.endRow, regionB.endRow);

        return Grid._createRegion(startCol, endCol, startRow, endRow);
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
        var startCol = Math.floor(bounds.min.x / grid.bucketWidth),
            endCol = Math.floor(bounds.max.x / grid.bucketWidth),
            startRow = Math.floor(bounds.min.y / grid.bucketHeight),
            endRow = Math.floor(bounds.max.y / grid.bucketHeight);

        return Grid._createRegion(startCol, endCol, startRow, endRow);
    };

    /**
     * Creates a region.
     * @method _createRegion
     * @private
     * @param {} startCol
     * @param {} endCol
     * @param {} startRow
     * @param {} endRow
     * @return {} region
     */
    Grid._createRegion = function(startCol, endCol, startRow, endRow) {
        return { 
            startCol: startCol, 
            endCol: endCol, 
            startRow: startRow, 
            endRow: endRow 
        };
    };

    /**
     * Gets the bucket id at the given position.
     * @method _getBucketId
     * @private
     * @param {} column
     * @param {} row
     * @return {string} bucket id
     */
    Grid._getBucketId = function(column, row) {
        return 'C' + column + 'R' + row;
    };

    /**
     * Creates a bucket.
     * @method _createBucket
     * @private
     * @param {} buckets
     * @param {} bucketId
     * @return {} bucket
     */
    Grid._createBucket = function(buckets, bucketId) {
        var bucket = buckets[bucketId] = [];
        return bucket;
    };

    /**
     * Adds a body to a bucket.
     * @method _bucketAddBody
     * @private
     * @param {} grid
     * @param {} bucket
     * @param {} body
     */
    Grid._bucketAddBody = function(grid, bucket, body) {
        // add new pairs

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
                if (pair[1] === bodyB) {
                    pair[2] += 1;
                    break;
                } else if (pair[1].id > bodyB.id) {
                    pairs.splice(p, 0, [bodyA, bodyB, 1]);
                    break;
                }
            }

            if (p === pairs.length)
                pairs.push([bodyA, bodyB, 1]);
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
    Grid._bucketRemoveBody = function(grid, bucket, body) {
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
                if (pair[1] === bodyB) {
                    if (pair[2] === 1) {
                        pairs.splice(p, 1);
                    } else {
                        pair[2] -= 1;
                    }
                    break;
                }
            }
        }
    };
    
})();
