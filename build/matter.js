/**
* matter.js 0.5.0 2014-02-19
* http://brm.io/matter-js/
* License: MIT
*/

/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Liam Brummitt
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function() {

var Matter = {};

// Begin Matter namespace closure

// All Matter modules are included below during build
// Outro.js then closes at the end of the file


// Begin src/body/Body.js

var Body = {};

(function() {

    var _nextId = 0,
        _nextGroupId = 1;

    Body.create = function(options) {
        var defaults = {
            id: Body.nextId(),
            angle: 0,
            position: { x: 0, y: 0 },
            force: { x: 0, y: 0 },
            torque: 0,
            positionImpulse: { x: 0, y: 0 },
            speed: 0,
            angularSpeed: 0,
            velocity: { x: 0, y: 0 },
            angularVelocity: 0,
            isStatic: false,
            isSleeping: false,
            motion: 0,
            sleepThreshold: 60,
            density: 0.001,
            restitution: 0,
            friction: 0.1,
            frictionAir: 0.01,
            path: 'L 0 0 L 40 0 L 40 40 L 0 40',
            fillStyle: options.isStatic ? '#eeeeee' : Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']),
            lineWidth: 1.5,
            groupId: 0,
            slop: 0.05
        };

        var body = Common.extend(defaults, options);

        Body.updateProperties(body);

        return body;
    };

    Body.nextId = function() {
        return _nextId++;
    };
    
    Body.nextGroupId = function() {
        return _nextGroupId++;
    };

    Body.updateProperties = function(body) {
        // calculated properties
        body.vertices = body.vertices || Vertices.fromPath(body.path);
        body.axes = body.axes || Axes.fromVertices(body.vertices);
        body.area = Vertices.area(body.vertices);
        body.bounds = Bounds.create(body.vertices);
        body.mass = body.mass || (body.density * body.area);
        body.inverseMass = 1 / body.mass;
        body.inertia = body.inertia || Vertices.inertia(body.vertices, body.mass);
        body.inverseInertia = 1 / body.inertia;
        body.positionPrev = body.positionPrev || { x: body.position.x, y: body.position.y };
        body.anglePrev = body.anglePrev || body.angle;
        body.strokeStyle = body.strokeStyle || Common.shadeColor(body.fillStyle, -20);

        // update geometry
        Vertices.create(body.vertices, body);
        var centre = Vertices.centre(body.vertices);
        Vertices.translate(body.vertices, body.position);
        Vertices.translate(body.vertices, centre, -1);
        Vertices.rotate(body.vertices, body.angle, body.position);
        Axes.rotate(body.axes, body.angle);
        Bounds.update(body.bounds, body.vertices, body.velocity);

        if (body.isStatic) {
            body.restitution = 0;
            body.friction = 1;
            body.mass = body.inertia = body.density = Infinity;
            body.inverseMass = body.inverseInertia = 0;
            body.lineWidth = 1;
        }

        Sleeping.set(body, body.isSleeping);
    };

    Body.resetForcesAll = function(bodies, gravity) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            // reset force buffers
            body.force.x = 0;
            body.force.y = 0;
            body.torque = 0;

            // apply gravity
            body.force.y += body.mass * gravity.y * 0.001;
            body.force.x += body.mass * gravity.x * 0.001;
        }
    };

    Body.updateAll = function(bodies, deltaTime, correction, worldBounds) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            // don't update out of world bodies
            // TODO: viewports
            if (body.bounds.max.x < worldBounds.min.x || body.bounds.min.x > worldBounds.max.x
                || body.bounds.max.y < worldBounds.min.y || body.bounds.min.y > worldBounds.max.y)
                continue;

            Body.update(body, deltaTime, correction);
        }
    };

    Body.update = function(body, deltaTime, correction) {
        var deltaTimeSquared = deltaTime * deltaTime;

        // from the previous step
        var frictionAir = 1 - body.frictionAir,
            velocityPrevX = body.position.x - body.positionPrev.x,
            velocityPrevY = body.position.y - body.positionPrev.y;

        // update velocity with verlet integration
        body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
        body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;

        // update angular velocity with verlet integration
        body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
        body.anglePrev = body.angle;
        body.angle += body.angularVelocity;

        // track speed and acceleration
        body.speed = Vector.magnitude(body.velocity);
        body.angularSpeed = Math.abs(body.angularVelocity);

        // transform the body geometry
        Vertices.translate(body.vertices, body.velocity);
        Vertices.rotate(body.vertices, body.angularVelocity, body.position);
        Axes.rotate(body.axes, body.angularVelocity);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

    Body.applyForce = function(body, position, force) {
        body.force.x += force.x;
        body.force.y += force.y;
        var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
        body.torque += (offset.x * force.y - offset.y * force.x) * body.inverseInertia;
    };

    Body.translate = function(body, translation) {
        body.positionPrev.x += translation.x;
        body.positionPrev.y += translation.y;
        body.position.x += translation.x;
        body.position.y += translation.y;
        Vertices.translate(body.vertices, translation);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

    Body.rotate = function(body, angle) {
        body.anglePrev += angle;
        body.angle += angle;
        Vertices.rotate(body.vertices, angle, body.position);
        Axes.rotate(body.axes, angle);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

})();

;   // End src/body/Body.js


// Begin src/body/Composite.js

// TODO: composite translate, rotate

var Composite = {};

(function() {

    Composite.create = function(options) {
        return Common.extend({ bodies: [], constraints: [], composites: [] }, options);
    };

    Composite.add = function(compositeA, compositeB) {
        if (compositeA.bodies && compositeB.bodies)
            compositeA.bodies = compositeA.bodies.concat(compositeB.bodies);

        if (compositeA.constraints && compositeB.constraints)
            compositeA.constraints = compositeA.constraints.concat(compositeB.constraints);

        if (compositeA.composites && compositeB.composites)
            compositeA.composites = compositeA.composites.concat(compositeB.composites);

        return compositeA;
    };

    Composite.addBody = function(composite, body) {
        composite.bodies = composite.bodies || [];
        composite.bodies.push(body);
        return composite;
    };

    Composite.addConstraint = function(composite, constraint) {
        composite.constraints = composite.constraints || [];
        composite.constraints.push(constraint);
        return composite;
    };

})();

;   // End src/body/Composite.js


// Begin src/body/World.js

var World = {};

(function() {

    World.create = function(options) {
        var defaults = {
            gravity: { x: 0, y: 1 },
            bodies: [],
            constraints: [],
            bounds: { 
                min: { x: 0, y: 0 }, 
                max: { x: 800, y: 600 } 
            }
        };
        
        return Common.extend(defaults, options);
    };
    
    World.clear = function(world, keepStatic) {
        world.bodies = keepStatic ? world.bodies.filter(function(body) { return body.isStatic; }) : [];
        world.constraints = [];
    };

    // world is a composite body
    // see src/module/Outro.js for these aliases:
    
    // World.addComposite = Composite.add;
    // World.addBody = Composite.addBody;
    // World.addConstraint = Composite.addConstraint;

})();

;   // End src/body/World.js


// Begin src/collision/Contact.js

var Contact = {};

(function() {

    Contact.create = function(vertex) {
        return {
            id: Contact.id(vertex),
            vertex: vertex,
            normalImpulse: 0,
            tangentImpulse: 0
        };
    };
    
    Contact.id = function(vertex) {
        return vertex.body.id + '_' + vertex.index;
    };

})();

;   // End src/collision/Contact.js


// Begin src/collision/Detector.js

// TODO: speculative contacts

var Detector = {};

(function() {

    Detector.collisions = function(pairs, metrics) {
        var collisions = [];

        for (var i = 0; i < pairs.length; i++) {
            var bodyA = pairs[i][0], 
                bodyB = pairs[i][1];

            // NOTE: could share a function for the below, but may drop performance?

            if (bodyA.groupId && bodyB.groupId && bodyA.groupId === bodyB.groupId)
                continue;

            if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                continue;

            metrics.midphaseTests += 1;

            // mid phase
            if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {
                
                // narrow phase
                var collision = SAT.collides(bodyA, bodyB);

                metrics.narrowphaseTests += 1;

                if (collision.collided) {
                    collisions.push(collision);
                    metrics.narrowDetections += 1;
                }
            }
        }

        return collisions;
    };

    Detector.bruteForce = function(bodies, metrics) {
        var collisions = [];

        for (var i = 0; i < bodies.length; i++) {
            for (var j = i + 1; j < bodies.length; j++) {
                var bodyA = bodies[i], 
                    bodyB = bodies[j];

                // NOTE: could share a function for the below, but may drop performance?

                if (bodyA.groupId && bodyB.groupId && bodyA.groupId === bodyB.groupId)
                    continue;

                if ((bodyA.isStatic || bodyA.isSleeping) && (bodyB.isStatic || bodyB.isSleeping))
                    continue;

                metrics.midphaseTests += 1;

                // mid phase
                if (Bounds.overlaps(bodyA.bounds, bodyB.bounds)) {

                    // narrow phase
                    var collision = SAT.collides(bodyA, bodyB);
                    
                    metrics.narrowphaseTests += 1;

                    if (collision.collided) {
                        collisions.push(collision);
                        metrics.narrowDetections += 1;
                    }
                }
            }
        }

        return collisions;
    };

})();

;   // End src/collision/Detector.js


// Begin src/collision/Grid.js

var Grid = {};

(function() {

    Grid.create = function(bucketWidth, bucketHeight) {
        return {
            buckets: {},
            pairs: {},
            pairsList: [],
            bucketWidth: bucketWidth || 48,
            bucketHeight: bucketHeight || 48
        };
    };

    Grid.update = function(grid, bodies, engine, forceUpdate) {
        var i, col, row,
            world = engine.world,
            buckets = grid.buckets,
            bucket,
            bucketId,
            metrics = engine.metrics,
            gridChanged = false;

        metrics.broadphaseTests = 0;

        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isSleeping)
                continue;

            // don't update out of world bodies
            if (body.bounds.max.x < 0 || body.bounds.min.x > world.bounds.width
                || body.bounds.max.y < 0 || body.bounds.min.y > world.bounds.height)
                continue;

            var newRegion = _getRegion(grid, body);

            // if the body has changed grid region
            if (!body.region || newRegion.id !== body.region.id || forceUpdate) {

                metrics.broadphaseTests += 1;

                if (!body.region || forceUpdate)
                    body.region = newRegion;

                var union = _regionUnion(newRegion, body.region);

                // update grid buckets affected by region change
                // iterate over the union of both regions
                for (col = union.startCol; col <= union.endCol; col++) {
                    for (row = union.startRow; row <= union.endRow; row++) {
                        bucketId = _getBucketId(col, row);
                        bucket = buckets[bucketId];

                        var isInsideNewRegion = (col >= newRegion.startCol && col <= newRegion.endCol
                                                && row >= newRegion.startRow && row <= newRegion.endRow);

                        var isInsideOldRegion = (col >= body.region.startCol && col <= body.region.endCol
                                                && row >= body.region.startRow && row <= body.region.endRow);

                        // remove from old region buckets
                        if (!isInsideNewRegion && isInsideOldRegion) {
                            if (isInsideOldRegion) {
                                if (bucket)
                                    _bucketRemoveBody(grid, bucket, body);
                            }
                        }

                        // add to new region buckets
                        if (body.region === newRegion || (isInsideNewRegion && !isInsideOldRegion) || forceUpdate) {
                            if (!bucket)
                                bucket = _createBucket(buckets, bucketId);
                            _bucketAddBody(grid, bucket, body);
                        }
                    }
                }

                // set the new region
                body.region = newRegion;

                // flag changes so we can update pairs
                gridChanged = true;
            }
        }

        // update pairs list only if pairs changed (i.e. a body changed region)
        if (gridChanged)
            grid.pairsList = _createActivePairsList(grid);
    };

    Grid.clear = function(grid) {
        grid.buckets = {};
        grid.pairs = {};
        grid.pairsList = [];
    };

    var _regionUnion = function(regionA, regionB) {
        var startCol = Math.min(regionA.startCol, regionB.startCol),
            endCol = Math.max(regionA.endCol, regionB.endCol),
            startRow = Math.min(regionA.startRow, regionB.startRow),
            endRow = Math.max(regionA.endRow, regionB.endRow);

        return _createRegion(startCol, endCol, startRow, endRow);
    };

    var _getRegion = function(grid, body) {
        var bounds = body.bounds,
            startCol = Math.floor(bounds.min.x / grid.bucketWidth),
            endCol = Math.floor(bounds.max.x / grid.bucketWidth),
            startRow = Math.floor(bounds.min.y / grid.bucketHeight),
            endRow = Math.floor(bounds.max.y / grid.bucketHeight);

        return _createRegion(startCol, endCol, startRow, endRow);
    };

    var _createRegion = function(startCol, endCol, startRow, endRow) {
        return { 
            id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,
            startCol: startCol, 
            endCol: endCol, 
            startRow: startRow, 
            endRow: endRow 
        };
    };

    var _getBucketId = function(column, row) {
        return column + ',' + row;
    };

    var _createBucket = function(buckets, bucketId) {
        var bucket = buckets[bucketId] = [];
        return bucket;
    };

    var _bucketAddBody = function(grid, bucket, body) {
        // add new pairs
        for (var i = 0; i < bucket.length; i++) {
            var bodyB = bucket[i];

            if (body.id === bodyB.id || (body.isStatic && bodyB.isStatic))
                continue;

            // keep track of the number of buckets the pair exists in
            // important for Grid.update to work
            var pairId = _getPairId(body, bodyB);
            if (grid.pairs[pairId]) {
                grid.pairs[pairId][2] += 1;
            } else {
                grid.pairs[pairId] = [body, bodyB, 1];
            }
        }

        // add to bodies (after pairs, otherwise pairs with self)
        bucket.push(body);
    };

    var _bucketRemoveBody = function(grid, bucket, body) {
        // remove from bodies
        for (var i = 0; i < bucket.length; i++) {
            var bodyB = bucket[i];

            // when position of body in bucket array is found, remove it
            if (bodyB.id === body.id) {
                bucket.splice(i, 1);
                continue;
            } else {
                // keep track of the number of buckets the pair exists in
                // important for Grid.update to work
                var pairId = _getPairId(body, bodyB);
                if (grid.pairs[pairId]) {
                    var pairCount = grid.pairs[pairId][2];
                    grid.pairs[pairId][2] = pairCount > 0 ? pairCount - 1 : 0;
                }
            }
        }
    };

    var _getPairId = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + ',' + bodyB.id;
        } else {
            return bodyB.id + ',' + bodyA.id;
        }
    };

    var _createActivePairsList = function(grid) {
        var pairKeys,
            pair,
            pairs = [];

        // grid.pairs is used as a hashmap
        pairKeys = Common.keys(grid.pairs);

        // iterate over grid.pairs
        for (var k = 0; k < pairKeys.length; k++) {
            pair = grid.pairs[pairKeys[k]];

            // if pair exists in at least one bucket
            // it is a pair that needs further collision testing so push it
            if (pair[2] > 0)
                pairs.push(pair);
        }

        return pairs;
    };
    
})();

;   // End src/collision/Grid.js


// Begin src/collision/Manager.js

var Manager = {};

(function() {
    
    var _pairMaxIdleLife = 500;

    Manager.updatePairs = function(pairs, pairsList, candidatePairs, metrics, detector) {
        var i;

        // first set all pairs inactive
        for (i = 0; i < pairsList.length; i++) {
            var pair = pairsList[i];
            Pair.setActive(pair, false);
        }
        
        // detect collisions in current step
        var pairsUpdated = false,
            collisions = detector(candidatePairs, metrics);

        // set collision pairs to active, or create if pair is new
        for (i = 0; i < collisions.length; i++) {
            var collision = collisions[i],
                pairId = Pair.id(collision.bodyA, collision.bodyB);
            
            if (pairId in pairs) {
                Pair.update(pairs[pairId], collision);
            } else {
                pairs[pairId] = Pair.create(collision);
                pairsUpdated = true;
            }
        }
        
        return pairsUpdated;
    };
    
    Manager.removeOldPairs = function(pairs, pairsList) {
        var timeNow = Common.now(),
            pairsRemoved = false,
            i;
        
        for (i = 0; i < pairsList.length; i++) {
            var pair = pairsList[i],
                collision = pair.collision;
            
            // never remove sleeping pairs
            if (collision.bodyA.isSleeping || collision.bodyB.isSleeping) {
                pair.timestamp = timeNow;
                continue;
            }

            // if pair is inactive for too long, remove it
            if (timeNow - pair.timestamp > _pairMaxIdleLife) {
                delete pairs[pair.id];
                pairsRemoved = true;
            }
        }
        
        return pairsRemoved;
    };

})();

;   // End src/collision/Manager.js


// Begin src/collision/Pair.js

var Pair = {};

(function() {
    
    Pair.create = function(collision) {
        var bodyA = collision.bodyA,
            bodyB = collision.bodyB;

        var pair = {
            id: Pair.id(bodyA, bodyB),
            contacts: {},
            activeContacts: [],
            separation: 0,
            isActive: true,
            timestamp: Common.now(),
            inverseMass: bodyA.inverseMass + bodyB.inverseMass,
            friction: Math.min(bodyA.friction, bodyB.friction),
            restitution: Math.max(bodyA.restitution, bodyB.restitution),
            slop: Math.max(bodyA.slop, bodyB.slop)
        };

        Pair.update(pair, collision);

        return pair;
    };

    Pair.update = function(pair, collision) {
        var contacts = pair.contacts,
            supports = collision.supports,
            activeContacts = [];
        
        pair.collision = collision;
        
        if (collision.collided) {
            for (var i = 0; i < supports.length; i++) {
                var support = supports[i],
                    contactId = Contact.id(support);

                if (contactId in contacts) {
                    activeContacts.push(contacts[contactId]);
                } else {
                    activeContacts.push(contacts[contactId] = Contact.create(support));
                }
            }

            pair.activeContacts = activeContacts;
            pair.separation = collision.depth;
            Pair.setActive(pair, true);
        } else {
            Pair.setActive(pair, false);
        }
    };
    
    Pair.setActive = function(pair, isActive) {
        if (isActive) {
            pair.isActive = true;
            pair.timestamp = Common.now();
        } else {
            pair.isActive = false;
            pair.activeContacts = [];
        }
    };

    Pair.id = function(bodyA, bodyB) {
        if (bodyA.id < bodyB.id) {
            return bodyA.id + '_' + bodyB.id;
        } else {
            return bodyB.id + '_' + bodyA.id;
        }
    };

})();

;   // End src/collision/Pair.js


// Begin src/collision/Resolver.js

var Resolver = {};

(function() {

    var _restingThresh = 4,
        _positionDampen = 0.2,
        _positionWarming = 0.6;

    Resolver.solvePosition = function(pairs) {
        var i,
            pair,
            collision,
            bodyA,
            bodyB,
            vertex,
            vertexCorrected,
            normal,
            bodyBtoA;

        // find impulses required to resolve penetration
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            vertex = collision.supports[0];
            vertexCorrected = collision.supportCorrected;
            normal = collision.normal;

            // get current separation between body edges involved in collision
            bodyBtoA = Vector.sub(Vector.add(bodyB.positionImpulse, vertex), 
                                    Vector.add(bodyA.positionImpulse, vertexCorrected));

            pair.separation = Vector.dot(normal, bodyBtoA);
        }
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            normal = collision.normal;
            positionImpulse = (pair.separation * _positionDampen) - pair.slop;
        
            if (bodyA.isStatic || bodyB.isStatic)
                positionImpulse *= 2;
            
            if (!(bodyA.isStatic || bodyA.isSleeping)) {
                bodyA.positionImpulse.x += normal.x * positionImpulse;
                bodyA.positionImpulse.y += normal.y * positionImpulse;
            }

            if (!(bodyB.isStatic || bodyB.isSleeping)) {
                bodyB.positionImpulse.x -= normal.x * positionImpulse;
                bodyB.positionImpulse.y -= normal.y * positionImpulse;
            }
        }
    };

    Resolver.postSolvePosition = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.positionImpulse.x !== 0 || body.positionImpulse.y !== 0) {
                // move the body without changing velocity
                body.position.x += body.positionImpulse.x;
                body.position.y += body.positionImpulse.y;
                body.positionPrev.x += body.positionImpulse.x;
                body.positionPrev.y += body.positionImpulse.y;

                // update body geometry
                Vertices.translate(body.vertices, body.positionImpulse);
                Bounds.update(body.bounds, body.vertices, body.velocity);
                
                // dampen accumulator to warm the next step
                body.positionImpulse.x *= _positionWarming;
                body.positionImpulse.y *= _positionWarming;
            }
        }
    };

    Resolver.preSolveVelocity = function(pairs) {
        var impulse = {},
            i,
            j,
            pair,
            contacts,
            collision,
            bodyA,
            bodyB,
            normal,
            tangent,
            contact,
            contactVertex,
            normalImpulse,
            tangentImpulse,
            offset;
        
        for (i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            contacts = pair.activeContacts;
            collision = pair.collision;
            bodyA = collision.bodyA;
            bodyB = collision.bodyB;
            normal = collision.normal;
            tangent = collision.tangent;
                
            // resolve each contact
            for (j = 0; j < contacts.length; j++) {
                contact = contacts[j];
                contactVertex = contact.vertex;
                normalImpulse = contact.normalImpulse;
                tangentImpulse = contact.tangentImpulse;
                
                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyA.position);
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offset, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    offset = Vector.sub(contactVertex, bodyB.position);
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offset, impulse) * bodyB.inverseInertia;
                }
            }
        }
    };

    Resolver.solveVelocity = function(pairs) {
        var impulse = {};
        
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            
            if (!pair.isActive)
                continue;
            
            var collision = pair.collision,
                bodyA = collision.bodyA,
                bodyB = collision.bodyB,
                normal = collision.normal,
                tangent = collision.tangent,
                contacts = pair.activeContacts,
                contactShare = 1 / contacts.length;

            // update body velocities
            bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
            bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
            bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
            bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;

            // resolve each contact
            for (var j = 0; j < contacts.length; j++) {
                var contact = contacts[j],
                    contactVertex = contact.vertex,
                    offsetA = Vector.sub(contactVertex, bodyA.position),
                    offsetB = Vector.sub(contactVertex, bodyB.position),
                    velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity)),
                    velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity)), 
                    relativeVelocity = Vector.sub(velocityPointA, velocityPointB),
                    normalVelocity = Vector.dot(normal, relativeVelocity);

                var tangentVelocity = Vector.dot(tangent, relativeVelocity),
                    tangentSpeed = Math.abs(tangentVelocity),
                    tangentVelocityDirection = Common.sign(tangentVelocity);

                // raw impulses
                var normalImpulse = (1 + pair.restitution) * normalVelocity,
                    normalForce = Common.clamp(pair.separation + normalVelocity, 0, 1);

                // coulomb friction
                var tangentImpulse = tangentVelocity;
                if (tangentSpeed > normalForce * pair.friction)
                    tangentImpulse = normalForce * pair.friction * tangentVelocityDirection;

                // modify impulses accounting for mass, inertia and offset
                var oAcN = Vector.cross(offsetA, normal),
                    oBcN = Vector.cross(offsetB, normal),
                    share = contactShare / (pair.inverseMass + bodyA.inverseInertia * oAcN * oAcN  + bodyB.inverseInertia * oBcN * oBcN);
                normalImpulse *= share;
                tangentImpulse *= share;
                
                // handle high velocity and resting collisions separately
                if (normalVelocity < 0 && normalVelocity * normalVelocity > _restingThresh) {
                    // high velocity so clear cached contact impulse
                    contact.normalImpulse = 0;
                    contact.tangentImpulse = 0;
                } else {
                    // solve resting collision constraints using Erin Catto's method (GDC08)

                    // impulse constraint, tends to 0
                    var contactNormalImpulse = contact.normalImpulse;
                    contact.normalImpulse = Math.min(contact.normalImpulse + normalImpulse, 0);
                    normalImpulse = contact.normalImpulse - contactNormalImpulse;
                    
                    // tangent impulse, tends to -maxFriction or maxFriction
                    var contactTangentImpulse = contact.tangentImpulse;
                    contact.tangentImpulse = Common.clamp(contact.tangentImpulse + tangentImpulse, -tangentSpeed, tangentSpeed);
                    tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                }
                
                // total impulse from contact
                impulse.x = (normal.x * normalImpulse) + (tangent.x * tangentImpulse);
                impulse.y = (normal.y * normalImpulse) + (tangent.y * tangentImpulse);
                
                // apply impulse from contact
                if (!(bodyA.isStatic || bodyA.isSleeping)) {
                    bodyA.positionPrev.x += impulse.x * bodyA.inverseMass;
                    bodyA.positionPrev.y += impulse.y * bodyA.inverseMass;
                    bodyA.anglePrev += Vector.cross(offsetA, impulse) * bodyA.inverseInertia;
                }

                if (!(bodyB.isStatic || bodyB.isSleeping)) {
                    bodyB.positionPrev.x -= impulse.x * bodyB.inverseMass;
                    bodyB.positionPrev.y -= impulse.y * bodyB.inverseMass;
                    bodyB.anglePrev -= Vector.cross(offsetB, impulse) * bodyB.inverseInertia;
                }
            }
        }
    };

})();

;   // End src/collision/Resolver.js


// Begin src/collision/SAT.js

// TODO: true circles and curves
// TODO: cache the previously found axis and body, and start there first for faster early out

var SAT = {};

(function() {

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

;   // End src/collision/SAT.js


// Begin src/constraint/Constraint.js

// TODO: fix instabillity issues with torque
// TODO: linked constraints
// TODO: breakable constraints
// TODO: collidable constraints
// TODO: allow constrained bodies to sleep
// TODO: handle 0 length constraints properly
// TODO: impulse caching and warming

var Constraint = {};

(function() {

    var _minLength = 0.000001;

    Constraint.create = function(options) {
        var constraint = options;

        // if bodies defined but no points, use body centre
        if (constraint.bodyA && !constraint.pointA)
            constraint.pointA = { x: 0, y: 0 };
        if (constraint.bodyB && !constraint.pointB)
            constraint.pointB = { x: 0, y: 0 };

        // calculate static length using initial world space points
        var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA,
            initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB,
            length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
    
        constraint.length = constraint.length || length || _minLength;

        // option defaults
        constraint.lineWidth = constraint.lineWidth || 2;
        constraint.strokeStyle = constraint.strokeStyle || '#666';
        constraint.stiffness = constraint.stiffness || 1;
        constraint.angularStiffness = constraint.angularStiffness || 0;
        constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
        constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;

        return constraint;
    };

    Constraint.updateAll = function(constraints) {
        for (var i = 0; i < constraints.length; i++) {
            Constraint.update(constraints[i]);
        }
    };

    Constraint.update = function(constraint) {
        var bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB;

        // update reference angle
        if (bodyA && !bodyA.isStatic) {
            constraint.pointA = Vector.rotate(pointA, bodyA.angle - constraint.angleA);
            constraint.angleA = bodyA.angle;
        }
        
        // update reference angle
        if (bodyB && !bodyB.isStatic) {
            constraint.pointB = Vector.rotate(pointB, bodyB.angle - constraint.angleB);
            constraint.angleB = bodyB.angle;
        }

        var pointAWorld = pointA,
            pointBWorld = pointB;

        if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
        if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);

        if (!pointAWorld || !pointBWorld)
            return;

        var delta = Vector.sub(pointAWorld, pointBWorld),
            currentLength = Vector.magnitude(delta);

        // prevent singularity
        if (currentLength === 0)
            currentLength = _minLength;

        // solve distance constraint with Gauss-Siedel method
        var difference = (currentLength - constraint.length) / currentLength,
            normal = Vector.div(delta, currentLength),
            force = Vector.mult(delta, difference * 0.5 * constraint.stiffness);
    
        var velocityPointA,
            velocityPointB,
            offsetA,
            offsetB,
            oAn,
            oBn,
            bodyADenom,
            bodyBDenom;
    
        if (bodyA && !bodyA.isStatic) {
            // point body offset
            offsetA = { 
                x: pointAWorld.x - bodyA.position.x + force.x, 
                y: pointAWorld.y - bodyA.position.y + force.y
            };
            
            // update velocity
            bodyA.velocity.x = bodyA.position.x - bodyA.positionPrev.x;
            bodyA.velocity.y = bodyA.position.y - bodyA.positionPrev.y;
            bodyA.angularVelocity = bodyA.angle - bodyA.anglePrev;
            
            // find point velocity and body mass
            velocityPointA = Vector.add(bodyA.velocity, Vector.mult(Vector.perp(offsetA), bodyA.angularVelocity));
            oAn = Vector.dot(offsetA, normal);
            bodyADenom = bodyA.inverseMass + bodyA.inverseInertia * oAn * oAn;
        } else {
            velocityPointA = { x: 0, y: 0 };
            bodyADenom = bodyA ? bodyA.inverseMass : 0;
        }
            
        if (bodyB && !bodyB.isStatic) {
            // point body offset
            offsetB = { 
                x: pointBWorld.x - bodyB.position.x - force.x, 
                y: pointBWorld.y - bodyB.position.y - force.y 
            };
            
            // update velocity
            bodyB.velocity.x = bodyB.position.x - bodyB.positionPrev.x;
            bodyB.velocity.y = bodyB.position.y - bodyB.positionPrev.y;
            bodyB.angularVelocity = bodyB.angle - bodyB.anglePrev;

            // find point velocity and body mass
            velocityPointB = Vector.add(bodyB.velocity, Vector.mult(Vector.perp(offsetB), bodyB.angularVelocity));
            oBn = Vector.dot(offsetB, normal);
            bodyBDenom = bodyB.inverseMass + bodyB.inverseInertia * oBn * oBn;
        } else {
            velocityPointB = { x: 0, y: 0 };
            bodyBDenom = bodyB ? bodyB.inverseMass : 0;
        }
        
        var relativeVelocity = Vector.sub(velocityPointB, velocityPointA),
            normalImpulse = Vector.dot(normal, relativeVelocity) / (bodyADenom + bodyBDenom);
    
        if (normalImpulse > 0) normalImpulse = 0;
    
        var normalVelocity = {
            x: normal.x * normalImpulse, 
            y: normal.y * normalImpulse
        };

        var torque;
 
        if (bodyA && !bodyA.isStatic) {
            torque = Vector.cross(offsetA, normalVelocity) * bodyA.inverseInertia * (1 - constraint.angularStiffness);

            Sleeping.set(bodyA, false);
            
            // clamp to prevent instabillity
            // TODO: solve this properlly
            torque = Common.clamp(torque, -0.01, 0.01);

            // apply forces
            bodyA.position.x -= force.x;
            bodyA.position.y -= force.y;
            bodyA.angle += torque;

            // update geometry
            Vertices.translate(bodyA.vertices, force, -1);
            Vertices.rotate(bodyA.vertices, torque, bodyA.position);
            Axes.rotate(bodyA.axes, torque);
            Bounds.update(bodyA.bounds, bodyA.vertices, bodyA.velocity);
        }

        if (bodyB && !bodyB.isStatic) {
            torque = Vector.cross(offsetB, normalVelocity) * bodyB.inverseInertia * (1 - constraint.angularStiffness);

            Sleeping.set(bodyB, false);
            
            // clamp to prevent instabillity
            // TODO: solve this properlly
            torque = Common.clamp(torque, -0.01, 0.01);
            
            // apply forces
            bodyB.position.x += force.x;
            bodyB.position.y += force.y;
            bodyB.angle -= torque;
            
            // update geometry
            Vertices.translate(bodyB.vertices, force);
            Vertices.rotate(bodyB.vertices, -torque, bodyB.position);
            Axes.rotate(bodyB.axes, -torque);
            Bounds.update(bodyB.bounds, bodyB.vertices, bodyB.velocity);
        }

    };

})();

;   // End src/constraint/Constraint.js


// Begin src/constraint/MouseConstraint.js

var MouseConstraint = {};

(function() {

    MouseConstraint.create = function(mouse) {
        var constraint = Constraint.create({ 
            pointA: mouse.position,
            pointB: { x: 0, y: 0 },
            length: 0.01, 
            stiffness: 0.1,
            angularStiffness: 1,
            strokeStyle: 'lightgreen',
            lineWidth: 3
        });

        return {
            mouse: mouse,
            dragBody: null,
            dragPoint: null,
            constraints: [constraint]
        };
    };

    MouseConstraint.update = function(mouseConstraint, bodies) {
        var mouse = mouseConstraint.mouse,
            constraint = mouseConstraint.constraints[0];

        if (mouse.button === 0 || mouse.button === 2) {
            if (!constraint.bodyB) {
                for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (Bounds.contains(body.bounds, mouse.position) 
                            && Vertices.contains(body.vertices, mouse.position)) {
                        constraint.pointA = mouse.position;
                        constraint.bodyB = body;
                        constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                        constraint.angleB = body.angle;
                        Sleeping.set(body, false);
                    }
                }
            }
        } else {
            constraint.bodyB = null;
            constraint.pointB = null;
        }

        if (constraint.bodyB) {
            Sleeping.set(constraint.bodyB, false);
            constraint.pointA = mouse.position;
        }
    };

})();

;   // End src/constraint/MouseConstraint.js


// Begin src/core/Common.js

var Common = {};

(function() {

    Common.extend = function(obj) {
        var args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < args.length; i++) {
            var source = args[i];

            if (source) {
                for (var prop in source) {
                    if (source[prop].constructor === Object) {
                        if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }
        
        return obj;
    };

    Common.keys = function(obj) {
        if (Object.keys)
            return Object.keys(obj);

        // avoid hasOwnProperty for performance
        var keys = [];
        for (var key in obj)
            keys.push(key);
        return keys;
    };

    Common.values = function(obj) {
        var values = [];
        
        if (Object.keys) {
            var keys = Object.keys(obj);
            for (var i = 0; i < keys.length; i++) {
                values.push(obj[keys[i]]);
            }
            return values;
        }
        
        // avoid hasOwnProperty for performance
        for (var key in obj)
            values.push(obj[key]);
        return values;
    };

    Common.shadeColor = function(color, percent) {   
        // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color
        var colorInteger = parseInt(color.slice(1),16), 
            amount = Math.round(2.55 * percent), 
            R = (colorInteger >> 16) + amount, 
            B = (colorInteger >> 8 & 0x00FF) + amount, 
            G = (colorInteger & 0x0000FF) + amount;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R :255) * 0x10000 
                + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 
                + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    };

    Common.shuffle = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    Common.choose = function(choices) {
        return choices[Math.floor(Math.random() * choices.length)];
    };

    Common.isElement = function(obj) {
        // http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        try {
            return obj instanceof HTMLElement;
        }
        catch(e){
            return (typeof obj==="object") &&
              (obj.nodeType===1) && (typeof obj.style === "object") &&
              (typeof obj.ownerDocument ==="object");
        }
    };
    
    Common.clamp = function(value, min, max) {
        if (value < min)
            return min;
        if (value > max)
            return max;
        return value;
    };
    
    Common.sign = function(value) {
        return value < 0 ? -1 : 1;
    };
    
    Common.now = Date.now || function() {
        // http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
        return +(new Date());
    };
    
    Common.random = function(min, max) {
        return min + Math.random() * (max - min);
    };

})();

;   // End src/core/Common.js


// Begin src/core/Engine.js

// TODO: multiple event handlers, before & after handlers
// TODO: viewports
// TODO: frameskipping

var Engine = {};

(function() {

    var _fps = 60,
        _deltaSampleSize = 8,
        _delta = 1000 / _fps;
        
    var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, _delta); };
   
    Engine.create = function(element, options) {
        var defaults = {
            enabled: true,
            positionIterations: 6,
            velocityIterations: 4,
            constraintIterations: 1,
            pairs: {},
            pairsList: [],
            enableSleeping: false,
            timeScale: 1,
            input: {},
            timing: {
                fps: _fps,
                timestamp: 0,
                delta: _delta,
                correction: 1,
                deltaMin: 1000 / _fps,
                deltaMax: 1000 / (_fps * 0.5)
            }
        };
        
        var engine = Common.extend(defaults, options);
        engine = Common.isElement(element) ? (engine || {}) : element;

        // create default renderer only if no custom renderer set
        // but still allow engine.render.engine to pass through if set
        if (!engine.render || (engine.render && !engine.render.controller)) {
            engine.render = Render.create(engine.render);
            if (Common.isElement(element))
                element.appendChild(engine.render.canvas);
        }

        engine.world = World.create(engine.world);
        engine.metrics = engine.metrics || Metrics.create();
        engine.input.mouse = engine.input.mouse || Mouse.create(engine.render.canvas);
        engine.mouseConstraint = engine.mouseConstraint || MouseConstraint.create(engine.input.mouse);
        World.addComposite(engine.world, engine.mouseConstraint);

        engine.broadphase = engine.broadphase || {
            current: 'grid',
            grid: {
                controller: Grid,
                instance: Grid.create(),
                detector: Detector.collisions
            },
            bruteForce: {
                detector: Detector.bruteForce
            }
        };

        engine.events = {
            tick: function(engine) {
                Engine.update(engine, engine.timing.delta, engine.timing.correction);
            },
            render: function(engine) {
                if (engine.render.options.enabled)
                    engine.render.controller.world(engine);
            }
        };

        return engine;
    };

    Engine.run = function(engine) {
        var timing = engine.timing,
            delta,
            counterTimestamp = 0,
            frameCounter = 0,
            deltaHistory = [];

        (function render(timestamp){
            _requestAnimationFrame(render);

            if (!engine.enabled)
                return;

            delta = (timestamp - timing.timestamp) || _delta;

            // optimistically filter delta over a few frames, to improve stability
            deltaHistory.push(delta);
            deltaHistory = deltaHistory.slice(-_deltaSampleSize);
            delta = Math.min.apply(null, deltaHistory);
            
            // limit delta
            delta = delta < engine.timing.deltaMin ? engine.timing.deltaMin : delta;
            delta = delta > engine.timing.deltaMax ? engine.timing.deltaMax : delta;

            timing.timestamp = timestamp;
            timing.correction = delta / timing.delta;
            timing.delta = delta;
            
            frameCounter += 1;

            if (timestamp - counterTimestamp >= 1000) {
                timing.fps = frameCounter * ((timestamp - counterTimestamp) / 1000);
                counterTimestamp = timestamp;
                frameCounter = 0;
            }

            engine.events.tick(engine);
            engine.events.render(engine);
        })();
    };

    Engine.update = function(engine, delta, correction) {
        var world = engine.world,
            broadphase = engine.broadphase[engine.broadphase.current],
            broadphasePairs = [],
            i;

        Body.resetForcesAll(world.bodies, world.gravity);
        Metrics.reset(engine.metrics);

        MouseConstraint.update(engine.mouseConstraint, world.bodies, engine.input);
        Body.updateAll(world.bodies, delta * engine.timeScale, correction, world.bounds);

        for (i = 0; i < engine.constraintIterations; i++) {
            Constraint.updateAll(world.constraints);
        }

        if (broadphase.controller) {
            broadphase.controller.update(broadphase.instance, world.bodies, engine);
            broadphasePairs = broadphase.instance.pairsList;
        } else {
            broadphasePairs = world.bodies;
        }
        
        var pairsUpdated = Manager.updatePairs(engine.pairs, engine.pairsList, broadphasePairs, engine.metrics, broadphase.detector),
            pairsRemoved = Manager.removeOldPairs(engine.pairs, engine.pairsList);
        
        if (pairsUpdated || pairsRemoved)
            engine.pairsList = Common.values(engine.pairs);

        // wake up bodies involved in collisions
        if (engine.enableSleeping)
            Sleeping.afterCollisions(engine.pairsList);

        // iteratively resolve velocity between collisions
        Resolver.preSolveVelocity(engine.pairsList);
        for (i = 0; i < engine.velocityIterations; i++) {
            Resolver.solveVelocity(engine.pairsList);
        }
        
        // iteratively resolve position between collisions
        for (i = 0; i < engine.positionIterations; i++) {
            Resolver.solvePosition(engine.pairsList);
        }
        Resolver.postSolvePosition(world.bodies);

        if (engine.enableSleeping)
            Sleeping.update(world.bodies);

        Metrics.update(engine.metrics, engine);

        return engine;
    };
    
    Engine.merge = function(engineA, engineB) {
        Common.extend(engineA, engineB);
        
        if (engineB.world) {
            engineA.world = engineB.world;

            Engine.clear(engineA);

            var bodies = engineA.world.bodies;

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                Sleeping.set(body, false);
                body.id = Body.nextId();
            }

            var broadphase = engineA.broadphase[engineA.broadphase.current];

            if (broadphase.controller === Grid) {
                var grid = broadphase.instance;
                Grid.clear(grid);
                Grid.update(grid, engineA.world.bodies, engineA, true);
            }
        }
    };

    Engine.clear = function(engine) {
        var world = engine.world;
        
        engine.pairs = {};
        engine.pairsList = [];

        World.addComposite(engine.world, engine.mouseConstraint);

        var broadphase = engine.broadphase[engine.broadphase.current];

        if (broadphase.controller === Grid)
            Grid.clear(broadphase.instance);

        if (broadphase.controller) {
            broadphase.controller.update(broadphase.instance, world.bodies, engine, true);
        }
    };

})();

;   // End src/core/Engine.js


// Begin src/core/Metrics.js

var Metrics = {};

(function() {

    Metrics.create = function() {
        return {
            narrowDetections: 0,
            narrowphaseTests: 0,
            midphaseTests: 0,
            broadphaseTests: 0,
            narrowEff: 0.0001,
            midEff: 0.0001,
            broadEff: 0.0001,
            collisions: 0,
            buckets: 0,
            bodies: 0,
            pairs: 0
        };
    };

    Metrics.reset = function(metrics) {
        metrics.narrowDetections = 0;
        metrics.narrowphaseTests = 0;
        metrics.midphaseTests = 0;
        metrics.broadphaseTests = 0;
        metrics.narrowEff = 0;
        metrics.midEff = 0;
        metrics.broadEff = 0;
        metrics.collisions = 0;
        metrics.buckets = 0;
        metrics.pairs = 0;
        metrics.bodies = 0;
    };

    Metrics.update = function(metrics, engine) {
        var world = engine.world,
            broadphase = engine.broadphase[engine.broadphase.current];
        
        metrics.collisions = metrics.narrowDetections;
        metrics.pairs = engine.pairsList.length;
        metrics.bodies = world.bodies.length;
        metrics.midEff = (metrics.narrowDetections / (metrics.midphaseTests || 1)).toFixed(2);
        metrics.narrowEff = (metrics.narrowDetections / (metrics.narrowphaseTests || 1)).toFixed(2);
        metrics.broadEff = (1 - (metrics.broadphaseTests / (world.bodies.length || 1))).toFixed(2);
        if (broadphase.instance)
            metrics.buckets = Common.keys(broadphase.instance.buckets).length;
    };

})();

;   // End src/core/Metrics.js


// Begin src/core/Mouse.js

var Mouse;

(function() {
    
    Mouse = function(element) {
        var mouse = this;
        
        element = element || document.body;
        
        this.position = { x: 0, y: 0 };
        this.mousedownPosition = { x: 0, y: 0 };
        this.mouseupPosition = { x: 0, y: 0 };
        this.button = -1;
        
        var mousemove = function(event) { 
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            }

            mouse.position = position;
        };
        
        var mousedown = function(event) {
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            } else {
                mouse.button = event.button;
            }

            mouse.position = mouse.mousedownPosition = position;
        };
        
        var mouseup = function(event) {
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                event.preventDefault();
            }
            
            mouse.button = -1;

            mouse.position = mouse.mouseupPosition = position;
        };
        
        element.addEventListener('mousemove', mousemove);
        element.addEventListener('mousedown', mousedown);
        element.addEventListener('mouseup', mouseup);
        
        element.addEventListener('touchmove', mousemove);
        element.addEventListener('touchstart', mousedown);
        element.addEventListener('touchend', mouseup);
    };

    Mouse.create = function(element) {
        return new Mouse(element);
    };
    
    var _getRelativeMousePosition = function(event, element) {
        var elementBounds = element.getBoundingClientRect(),
            scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
            touches = event.changedTouches,
            x, y;
        
        if (touches) {
            x = touches[0].pageX - elementBounds.left - scrollX;
            y = touches[0].pageY - elementBounds.top - scrollY;
        } else {
            x = event.pageX - elementBounds.left - scrollX;
            y = event.pageY - elementBounds.top - scrollY;
        }
        
        return { 
            x: x / (element.clientWidth / element.width), 
            y: y / (element.clientHeight / element.height)
        };
    };

})();

;   // End src/core/Mouse.js


// Begin src/core/Sleeping.js

var Sleeping = {};

(function() {

    var _motionWakeThreshold = 0.18,
        _motionSleepThreshold = 0.08,
        _minBias = 0.9;

    Sleeping.update = function(bodies) {
        // update bodies sleeping status
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;

            var minMotion = Math.min(body.motion, motion),
                maxMotion = Math.max(body.motion, motion);
        
            // biased average motion estimation between frames
            body.motion = _minBias * minMotion + (1 - _minBias) * maxMotion;
            
            if (body.sleepThreshold > 0 && body.motion < _motionSleepThreshold) {
                body.sleepCounter += 1;
                
                if (body.sleepCounter >= body.sleepThreshold)
                    Sleeping.set(body, true);
            } else if (body.sleepCounter > 0) {
                body.sleepCounter -= 1;
            }
        }
    };

    Sleeping.afterCollisions = function(pairs) {
        // wake up bodies involved in collisions
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i],
                collision = pair.collision,
                bodyA = collision.bodyA, 
                bodyB = collision.bodyB;
        
            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
                continue;
        
            if (bodyA.isSleeping || bodyB.isSleeping) {
                var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;

                if (!sleepingBody.isStatic && movingBody.motion > _motionWakeThreshold) {
                    Sleeping.set(sleepingBody, false);
                }
            }
        }
    };

    Sleeping.set = function(body, isSleeping) {
        if (isSleeping) {
            body.isSleeping = true;
            body.sleepCounter = body.sleepThreshold;

            body.positionImpulse.x = 0;
            body.positionImpulse.y = 0;

            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;

            body.anglePrev = body.angle;
            body.speed = 0;
            body.angularSpeed = 0;
            body.motion = 0;
        } else {
            body.isSleeping = false;
            body.sleepCounter = 0;
        }
    };

})();

;   // End src/core/Sleeping.js


// Begin src/factory/Bodies.js

// TODO: true circle bodies

var Bodies = {};

(function() {

    Bodies.rectangle = function(x, y, width, height, options) {
        options = options || {};

        var rectangle = { 
                position: { x: x, y: y },
                path: 'L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height
            };

        return Body.create(Common.extend({}, rectangle, options));
    };
    
    Bodies.trapezoid = function(x, y, width, height, slope, options) {
        options = options || {};

        slope *= 0.5;
        var roof = (1 - (slope * 2)) * width;
        
        var x1 = width * slope,
            x2 = x1 + roof,
            x3 = x2 + x1;

        var trapezoid = { 
                position: { x: x, y: y },
                path: 'L 0 0 L ' + x1 + ' ' + (-height) + ' L ' + x2 + ' ' + (-height) + ' L ' + x3 + ' 0'
            };

        return Body.create(Common.extend({}, trapezoid, options));
    };

    Bodies.circle = function(x, y, radius, options, maxSides) {
        options = options || {};
        
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
                position: { x: x, y: y },
                path: path
            };

        return Body.create(Common.extend({}, polygon, options));
    };

})();

;   // End src/factory/Bodies.js


// Begin src/factory/Composites.js

var Composites = {};

(function() {

    Composites.stack = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
        var stack = Composite.create(),
            x = xx,
            y = yy,
            lastBody,
            i = 0;

        for (var row = 0; row < rows; row++) {
            var maxHeight = 0;
            
            for (var column = 0; column < columns; column++) {
                var body = callback(x, y, column, row, lastBody, i);
                    
                if (body) {
                    var bodyHeight = body.bounds.max.y - body.bounds.min.y,
                        bodyWidth = body.bounds.max.x - body.bounds.min.x; 

                    if (bodyHeight > maxHeight)
                        maxHeight = bodyHeight;
                    
                    Body.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });

                    x = body.bounds.max.x + columnGap;

                    Composite.addBody(stack, body);
                    
                    lastBody = body;
                    i += 1;
                }
            }
            
            y += maxHeight + rowGap;
            x = xx;
        }

        return stack;
    };
    
    Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
        var bodies = composite.bodies;
        
        for (var i = 1; i < bodies.length; i++) {
            var bodyA = bodies[i - 1],
                bodyB = bodies[i],
                bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,
                bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, 
                bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,
                bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
        
            var defaults = {
                bodyA: bodyA,
                pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                bodyB: bodyB,
                pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
            };
            
            var constraint = Common.extend(defaults, options);
        
            Composite.addConstraint(composite, Constraint.create(constraint));
        }
        
        return composite;
    };
    
    Composites.pyramid = function(xx, yy, columns, rows, columnGap, rowGap, callback) {
        return Composites.stack(xx, yy, columns, rows, columnGap, rowGap, function(x, y, column, row, lastBody, i) {
            var actualRows = Math.min(rows, Math.ceil(columns / 2)),
                lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
            
            if (row > actualRows)
                return;
            
            // reverse row order
            row = actualRows - row;
            
            var start = row,
                end = columns - 1 - row;

            if (column < start || column > end)
                return;
            
            // retroactively fix the first body's position, since width was unknown
            if (i === 1) {
                Body.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
            }

            var xOffset = lastBody ? column * lastBodyWidth : 0;
            
            return callback(xx + xOffset + column * columnGap, y, column, row, lastBody, i);
        });
    };

    Composites.newtonsCradle = function(xx, yy, number, size, length) {
        var newtonsCradle = Composite.create();

        for (var i = 0; i < number; i++) {
            var separation = 1.9,
                circle = Bodies.circle(xx + i * (size * separation), yy + length, size, 
                            { restitution: 1, friction: 0, frictionAir: 0.0001, slop: 0.01 }),
                constraint = Constraint.create({ pointA: { x: xx + i * (size * separation), y: yy }, bodyB: circle });

            Composite.addBody(newtonsCradle, circle);
            Composite.addConstraint(newtonsCradle, constraint);
        }

        return newtonsCradle;
    };
    
    Composites.car = function(xx, yy, width, height, wheelSize) {
        var groupId = Body.nextGroupId(),
            wheelBase = -20,
            wheelAOffset = -width * 0.5 + wheelBase,
            wheelBOffset = width * 0.5 - wheelBase,
            wheelYOffset = 0;
    
        var car = Composite.create(),
            body = Bodies.trapezoid(xx, yy, width, height, 0.3, { groupId: groupId, friction: 0.01 });
    
        var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, { 
            groupId: groupId, 
            restitution: 0.5, 
            friction: 0.9,
            density: 0.01
        });
                    
        var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, { 
            groupId: groupId, 
            restitution: 0.5, 
            friction: 0.9,
            density: 0.01
        });
                    
        var axelA = Constraint.create({
            bodyA: body,
            pointA: { x: wheelAOffset, y: wheelYOffset },
            bodyB: wheelA,
            stiffness: 0.5
        });
                        
        var axelB = Constraint.create({
            bodyA: body,
            pointA: { x: wheelBOffset, y: wheelYOffset },
            bodyB: wheelB,
            stiffness: 0.5
        });
        
        Composite.addBody(car, body);
        Composite.addBody(car, wheelA);
        Composite.addBody(car, wheelB);
        Composite.addConstraint(car, axelA);
        Composite.addConstraint(car, axelB);

        return car;
    };

})();

;   // End src/factory/Composites.js


// Begin src/geometry/Axes.js

var Axes = {};

(function() {

    Axes.fromVertices = function(vertices) {
        var axes = {};

        // find the unique axes, using edge normal gradients
        for (var i = 0; i < vertices.length; i++) {
            var j = (i + 1) % vertices.length, 
                normal = Vector.normalise({ 
                    x: vertices[j].y - vertices[i].y, 
                    y: vertices[i].x - vertices[j].x
                }),
                gradient = (normal.y === 0) ? Infinity : (normal.x / normal.y);
            
            // limit precision
            gradient = gradient.toFixed(3).toString();

            axes[gradient] = normal;
        }

        return Common.values(axes);
    };

    Axes.rotate = function(axes, angle) {
        if (angle === 0)
            return;
        
        var cos = Math.cos(angle),
            sin = Math.sin(angle);

        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i],
                xx;
            xx = axis.x * cos - axis.y * sin;
            axis.y = axis.x * sin + axis.y * cos;
            axis.x = xx;
        }
    };

})();

;   // End src/geometry/Axes.js


// Begin src/geometry/Bounds.js

var Bounds = {};

(function() {

    Bounds.create = function(vertices) {
        var bounds = { 
            min: { x: 0, y: 0 }, 
            max: { x: 0, y: 0 }
        };
        Bounds.update(bounds, vertices);
        return bounds;
    };

    Bounds.update = function(bounds, vertices, velocity) {
        bounds.min.x = Number.MAX_VALUE;
        bounds.max.x = Number.MIN_VALUE;
        bounds.min.y = Number.MAX_VALUE;
        bounds.max.y = Number.MIN_VALUE;

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
            if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
            if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
            if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
        }
        
        if (velocity) {
            if (velocity.x > 0) {
                bounds.max.x += velocity.x;
            } else {
                bounds.min.x += velocity.x;
            }
            
            if (velocity.y > 0) {
                bounds.max.y += velocity.y;
            } else {
                bounds.min.y += velocity.y;
            }
        }
    };

    Bounds.contains = function(bounds, point) {
        return point.x >= bounds.min.x && point.x <= bounds.max.x 
               && point.y >= bounds.min.y && point.y <= bounds.max.y;
    };

    Bounds.overlaps = function(boundsA, boundsB) {
        return (boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x
                && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y);
    };
    
})();

;   // End src/geometry/Bounds.js


// Begin src/geometry/Vector.js

// TODO: consider params for reusing vector objects

var Vector = {};

(function() {

    Vector.magnitude = function(vector) {
        return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
    };

    Vector.magnitudeSquared = function(vector) {
        return (vector.x * vector.x) + (vector.y * vector.y);
    };

    Vector.rotate = function(vector, angle) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return {
            x: vector.x * cos - vector.y * sin,
            y: vector.x * sin + vector.y * cos
        };
    };

    Vector.rotateAbout = function(vector, angle, point) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return {
            x: point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin),
            y: point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos)
        };
    };

    Vector.normalise = function(vector) {
        var magnitude = Vector.magnitude(vector);
        if (magnitude === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / magnitude, y: vector.y / magnitude };
    };

    Vector.dot = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
    };

    Vector.cross = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);
    };

    Vector.add = function(vectorA, vectorB) {
        return { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y };
    };

    Vector.sub = function(vectorA, vectorB) {
        return { x: vectorA.x - vectorB.x, y: vectorA.y - vectorB.y };
    };

    Vector.mult = function(vector, scalar) {
        return { x: vector.x * scalar, y: vector.y * scalar };
    };

    Vector.div = function(vector, scalar) {
        return { x: vector.x / scalar, y: vector.y / scalar };
    };

    Vector.perp = function(vector, negate) {
        negate = negate === true ? -1 : 1;
        return { x: negate * -vector.y, y: negate * vector.x };
    };

    Vector.neg = function(vector) {
        return { x: -vector.x, y: -vector.y };
    };

})();

;   // End src/geometry/Vector.js


// Begin src/geometry/Vertices.js

// TODO: convex decomposition - http://mnbayazit.com/406/bayazit

var Vertices = {};

(function() {

    Vertices.create = function(vertices, body) {
        for (var i = 0; i < vertices.length; i++) {
            vertices[i].index = i;
            vertices[i].body = body;
        }
    };

    Vertices.fromPath = function(path) {
        var pathPattern = /L\s*([\-\d\.]*)\s*([\-\d\.]*)/ig,
            vertices = [];

        path.replace(pathPattern, function(match, x, y) {
            vertices.push({ x: parseFloat(x, 10), y: parseFloat(y, 10) });
        });

        return vertices;
    };

    Vertices.centre = function(vertices) {
        var cx = 0, cy = 0;

        for (var i = 0; i < vertices.length; i++) {
            cx += vertices[i].x;
            cy += vertices[i].y;
        }

        return { x: cx / vertices.length, y: cy / vertices.length };
    };

    Vertices.area = function(vertices) {
        var area = 0,
            j = vertices.length - 1;

        for (var i = 0; i < vertices.length; i++) {
            area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
            j = i;
        }

        return Math.abs(area) / 2;
    };

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

;   // End src/geometry/Vertices.js


// Begin src/render/Gui.js

var Gui = {};

(function() {

    Gui.create = function(engine, options) {
        var _datGuiSupported = window.dat && window.localStorage,
            _serializer;
        
        if (!_datGuiSupported) {
            console.log("Could not create GUI. Check dat.gui library is loaded first.");
            return;
        }

        var datGui = new dat.GUI(options);
        
        if (Resurrect) {
            _serializer = new Resurrect({ prefix: '$' });
            _serializer.parse = _serializer.resurrect;
        } else {
            _serializer = JSON;
        }

        var gui = {
            datGui: datGui,
            amount: 1,
            size: 40,
            sides: 4,
            density: 0.001,
            restitution: 0,
            friction: 0.1,
            frictionAir: 0.01
        };

        var funcs = {
            addBody: function() {
                var options = { 
                    density: gui.density,
                    friction: gui.friction,
                    frictionAir: gui.frictionAir,
                    restitution: gui.restitution
                };

                for (var i = 0; i < gui.amount; i++) {
                    World.addBody(engine.world, Bodies.polygon(120 + i * gui.size + i * 50, 200, gui.sides, gui.size, options));
                }
            },

            clear: function() {
                World.clear(engine.world, true);
                Engine.clear(engine);
            },

            save: function() {
                if (localStorage && _serializer) {
                    localStorage.setItem('world', _serializer.stringify(engine.world));
                }
            },

            load: function() {
                var loadedWorld;

                if (localStorage && _serializer) {
                    loadedWorld = _serializer.parse(localStorage.getItem('world'));
                }

                if (loadedWorld) {
                    Engine.merge(engine, { world: loadedWorld });
                }
            }
        };

        var metrics = datGui.addFolder('Metrics');
        metrics.add(engine.timing, 'fps').listen();
        metrics.add(engine.timing, 'delta').listen();
        metrics.add(engine.timing, 'correction').listen();
        metrics.add(engine.metrics, 'bodies').listen();
        metrics.add(engine.metrics, 'collisions').listen();
        metrics.add(engine.metrics, 'pairs').listen();
        metrics.add(engine.metrics, 'broadEff').listen();
        metrics.add(engine.metrics, 'midEff').listen();
        metrics.add(engine.metrics, 'narrowEff').listen();
        metrics.close();

        var controls = datGui.addFolder('Add Body');
        controls.add(gui, 'amount', 1, 5).step(1);
        controls.add(gui, 'size', 5, 150).step(1);
        controls.add(gui, 'sides', 1, 8).step(1);
        controls.add(gui, 'density', 0.0001, 0.01).step(0.001);
        controls.add(gui, 'friction', 0, 1).step(0.05);
        controls.add(gui, 'frictionAir', 0, gui.frictionAir * 10).step(gui.frictionAir / 10);
        controls.add(gui, 'restitution', 0, 1).step(0.1);
        controls.add(funcs, 'addBody');
        controls.open();

        var worldGui = datGui.addFolder('World');
        worldGui.add(funcs, 'load');
        worldGui.add(funcs, 'save');
        worldGui.add(funcs, 'clear');
        worldGui.open();
        
        var gravity = worldGui.addFolder('Gravity');
        gravity.add(engine.world.gravity, 'x', -1, 1).step(0.01);
        gravity.add(engine.world.gravity, 'y', -1, 1).step(0.01);
        gravity.open();

        var physics = datGui.addFolder('Engine');
        physics.add(engine, 'enableSleeping');
        physics.add(engine.broadphase, 'current', ['grid', 'bruteForce']);
        physics.add(engine, 'timeScale', 0.1, 2).step(0.1);
        physics.add(engine, 'velocityIterations', 1, 10).step(1);
        physics.add(engine, 'positionIterations', 1, 10).step(1);
        physics.add(engine, 'enabled');
        physics.open();

        var render = datGui.addFolder('Render');
        render.add(engine.render.options, 'wireframes');
        render.add(engine.render.options, 'showDebug');
        render.add(engine.render.options, 'showPositions');
        render.add(engine.render.options, 'showBroadphase');
        render.add(engine.render.options, 'showBounds');
        render.add(engine.render.options, 'showVelocity');
        render.add(engine.render.options, 'showCollisions');
        render.add(engine.render.options, 'showAxes');
        render.add(engine.render.options, 'showAngleIndicator');
        render.add(engine.render.options, 'showSleeping');
        render.add(engine.render.options, 'showIds');
        render.add(engine.render.options, 'showShadows');
        render.add(engine.render.options, 'enabled');
        render.open();

        //datGui.remember(world)
        
        return gui;
    };
    
    Gui.update = function(gui, datGui) {
        var i;
        datGui = datGui || gui.datGui;
        
        for (i in datGui.__folders) {
            Gui.update(gui, datGui.__folders[i]);
        }
        
        for (i in datGui.__controllers) {
            var controller = datGui.__controllers[i];
            if (controller.updateDisplay)
                controller.updateDisplay();
        }
    };

    Gui.closeAll = function(gui) {
        var datGui = gui.datGui;
        
        for (var i in datGui.__folders) {
            datGui.__folders[i].close();
        }
    };

})();

;   // End src/render/Gui.js


// Begin src/render/Render.js

// TODO: viewports
// TODO: two.js, pixi.js

var Render = {};

(function() {
    
    Render.create = function(options) {
        var defaults = {
            controller: Render,
            options: {
                width: 800,
                height: 600,
                background: '#fafafa',
                wireframeBackground: '#222',
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false
            }
        };

        var render = Common.extend(defaults, options);

        render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
        render.context = render.canvas.getContext('2d');

        return render;
    };

    Render.world = function(engine) {
        var render = engine.render,
            world = engine.world,
            canvas = render.canvas,
            context = render.context,
            options = render.options,
            i;

        if (options.wireframes) {
            context.fillStyle = options.wireframeBackground;
        } else {
            context.fillStyle = options.background;
        }
        
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (options.showShadows && !options.wireframes)
            for (i = 0; i < world.bodies.length; i++)
                Render.bodyShadow(engine, world.bodies[i], context);

        for (i = 0; i < world.bodies.length; i++)
            Render.body(engine, world.bodies[i], context);

        for (i = 0; i < world.constraints.length; i++)
            Render.constraint(world.constraints[i], context);

        if (options.showCollisions)
            for (i = 0; i < engine.pairsList.length; i++)
                Render.collision(engine, engine.pairsList[i], context);

        if (options.showBroadphase && engine.broadphase.current === 'grid')
            Render.grid(engine, engine.broadphase[engine.broadphase.current].instance, context);

        if (options.showDebug)
            Render.debug(engine, context);
    };

    Render.debug = function(engine, context) {
        var c = context,
            world = engine.world,
            render = engine.render,
            options = render.options,
            space = "    ";

        if (engine.timing.timestamp - (render.debugTimestamp || 0) >= 500) {
            var text = "";
            text += "delta: " + engine.timing.delta.toFixed(3) + space;
            text += "fps: " + Math.round(engine.timing.fps) + space;
            text += "correction: " + engine.timing.correction.toFixed(3) + space;
            text += "bodies: " + world.bodies.length + space;

            if (engine.broadphase.controller === Grid)
                text += "buckets: " + engine.metrics.buckets + space;

            text += "\n";

            text += "collisions: " + engine.metrics.collisions + space;
            text += "pairs: " + engine.pairs.length + space;
            text += "broad: " + engine.metrics.broadEff + space;
            text += "mid: " + engine.metrics.midEff + space;
            text += "narrow: " + engine.metrics.narrowEff + space;            
            render.debugString = text;
            render.debugTimestamp = engine.timing.timestamp;
        }

        if (render.debugString) {
            c.font = "12px Arial";

            if (options.wireframes) {
                c.fillStyle = 'rgba(255,255,255,0.5)';
            } else {
                c.fillStyle = 'rgba(0,0,0,0.5)';
            }

            var split = render.debugString.split('\n');

            for (var i = 0; i < split.length; i++) {
                c.fillText(split[i], 50, 50 + i * 18);
            }
        }
    };

    Render.constraint = function(constraint, context) {
        var bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            c = context;

        if (!constraint.pointA || !constraint.pointB)
            return;

        if (bodyA) {
            c.beginPath();
            c.moveTo(bodyA.position.x + constraint.pointA.x, bodyA.position.y + constraint.pointA.y);
        } else {
            c.beginPath();
            c.moveTo(constraint.pointA.x, constraint.pointA.y);
        }

        if (bodyB) {
            c.lineTo(bodyB.position.x + constraint.pointB.x, bodyB.position.y + constraint.pointB.y);
        } else {
            c.lineTo(constraint.pointB.x, constraint.pointB.y);
        }

        c.lineWidth = constraint.lineWidth;
        c.strokeStyle = constraint.strokeStyle;
        c.stroke();
    };
    
    Render.bodyShadow = function(engine, body, context) {
        var c = context,
            render = engine.render;

        if (body.circleRadius) {
            c.beginPath();
            c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
            c.closePath();
        } else {
            c.beginPath();
            c.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (var j = 1; j < body.vertices.length; j++) {
                c.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            c.closePath();
        }

        var distanceX = body.position.x - render.options.width * 0.5,
            distanceY = body.position.y - render.options.height * 0.2,
            distance = Math.abs(distanceX) + Math.abs(distanceY);

        c.shadowColor = 'rgba(0,0,0,0.15)';
        c.shadowOffsetX = 0.05 * distanceX;
        c.shadowOffsetY = 0.05 * distanceY;
        c.shadowBlur = 1 + 12 * Math.min(1, distance / 1000);

        c.fill();

        c.shadowColor = null;
        c.shadowOffsetX = null;
        c.shadowOffsetY = null;
        c.shadowBlur = null;
    };

    Render.body = function(engine, body, context) {
        var c = context,
            render = engine.render,
            options = render.options;

        // body bounds
        if (options.showBounds) {
            c.beginPath();
            c.rect(body.bounds.min.x, body.bounds.min.y, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
            c.lineWidth = 1;
            if (options.wireframes) {
                c.strokeStyle = 'rgba(255,255,255,0.08)';
            } else {
                c.strokeStyle = 'rgba(0,0,0,0.1)';
            }
            c.stroke();
        }

        // body polygon
        if (body.circleRadius) {
            c.beginPath();
            c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
            c.closePath();
        } else {
            c.beginPath();
            c.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (var j = 1; j < body.vertices.length; j++) {
                c.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            c.closePath();
        }

        if (!options.wireframes) {
            c.fillStyle = body.fillStyle;
            if (options.showSleeping && body.isSleeping)
                c.fillStyle = Common.shadeColor(body.fillStyle, 50);
            c.lineWidth = body.lineWidth;
            c.strokeStyle = body.strokeStyle;
            c.fill();
            c.stroke();
        } else {
            c.lineWidth = 1;
            c.strokeStyle = '#bbb';
            if (options.showSleeping && body.isSleeping)
                c.strokeStyle = 'rgba(255,255,255,0.2)';
            c.stroke();
        }

        // angle indicator
        if (options.showAngleIndicator && !options.showAxes) {
            c.beginPath();
            c.moveTo(body.position.x, body.position.y);
            c.lineTo((body.vertices[0].x + body.vertices[body.vertices.length-1].x) / 2, 
                     (body.vertices[0].y + body.vertices[body.vertices.length-1].y) / 2);
            c.lineWidth = 1;
            if (options.wireframes) {
                c.strokeStyle = 'indianred';
            } else {
                c.strokeStyle = body.strokeStyle;
            }
            c.stroke();
        }

        // axes
        if (options.showAxes) {
            for (var i = 0; i < body.axes.length; i++) {
                var axis = body.axes[i];
                c.beginPath();
                c.moveTo(body.position.x, body.position.y);
                c.lineTo(body.position.x + axis.x * 20, body.position.y + axis.y * 20);
                c.lineWidth = 1;
                if (options.wireframes) {
                    c.strokeStyle = 'indianred';
                } else {
                    c.strokeStyle = body.strokeStyle;
                }
                c.stroke();
            }
        }

        // positions
        if (options.showPositions) {
            c.beginPath();
            c.arc(body.position.x, body.position.y, 3, 0, 2 * Math.PI, false);
            if (options.wireframes) {
                c.fillStyle = 'indianred';
            } else {
                c.fillStyle = 'rgba(0,0,0,0.5)';
            }
            c.fill();
            c.beginPath();
            c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
            c.fillStyle = 'rgba(255,165,0,0.8)';
            c.fill();
        }
        
        // body velocity vector
        if (options.showVelocity) {
            c.beginPath();
            c.moveTo(body.position.x, body.position.y);
            c.lineTo(body.position.x + (body.position.x - body.positionPrev.x) * 2, body.position.y + (body.position.y - body.positionPrev.y) * 2);
            c.lineWidth = 3;
            c.strokeStyle = 'cornflowerblue';
            c.stroke();
        }

        // body id
        if (options.showIds) {
            c.font = "12px Arial";
            c.fillStyle = 'rgba(255,255,255,0.5)';
            c.fillText(body.id, body.position.x + 10, body.position.y - 10);
        }
    };

    Render.collision = function(engine, pair, context) {
        var c = context,
            collision = pair.collision,
            options = engine.render.options;

        for (var i = 0; i < pair.activeContacts.length; i++) {
            var contact = pair.activeContacts[i],
                vertex = contact.vertex;
            c.beginPath();
            //c.arc(vertex.x, vertex.y, 2.5, 0, 2 * Math.PI, false);
            c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
            if (options.wireframes) {
                c.fillStyle = 'rgba(255,255,255,0.7)';
            } else {
                c.fillStyle = 'orange';
            }
            c.fill();
        }
        
        if (pair.activeContacts.length > 0) {
            var normalPosX = pair.activeContacts[0].vertex.x,
                normalPosY = pair.activeContacts[0].vertex.y;

            if (pair.activeContacts.length === 2) {
                normalPosX = (pair.activeContacts[0].vertex.x + pair.activeContacts[1].vertex.x) / 2;
                normalPosY = (pair.activeContacts[0].vertex.y + pair.activeContacts[1].vertex.y) / 2;
            }
            
            // collision normal
            c.beginPath();
            c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
            c.lineWidth = 1;
            c.lineTo(normalPosX, normalPosY);
            if (options.wireframes) {
                c.strokeStyle = 'rgba(255,165,0,0.7)';
            } else {
                c.strokeStyle = 'orange';
            }
            c.stroke();
        }
    };

    Render.grid = function(engine, grid, context) {
        var c = context,
            options = engine.render.options;

        c.lineWidth = 1;

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,180,0,0.1)';
        } else {
            c.strokeStyle = 'rgba(255,180,0,0.5)';
        }

        var bucketKeys = Common.keys(grid.buckets);

        for (var i = 0; i < bucketKeys.length; i++) {
            var bucketId = bucketKeys[i];

            if (grid.buckets[bucketId].length < 2)
                continue;

            var region = bucketId.split(',');
            c.beginPath();
            c.rect(0.5 + parseInt(region[0], 10) * grid.bucketWidth, 
                    0.5 + parseInt(region[1], 10) * grid.bucketHeight, 
                    grid.bucketWidth, 
                    grid.bucketHeight);
            c.stroke();
        }
    };

    var _createCanvas = function(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.oncontextmenu = function() { return false; };
        canvas.onselectstart = function() { return false; };
        return canvas;
    };

})();

;   // End src/render/Render.js


// aliases

World.addComposite = Composite.add;
World.addBody = Composite.addBody;
World.addConstraint = Composite.addConstraint;

// exports

Matter.Body = Body;
Matter.Composite = Composite;
Matter.World = World;
Matter.Contact = Contact;
Matter.Detector = Detector;
Matter.Grid = Grid;
Matter.Manager = Manager;
Matter.Pair = Pair;
Matter.Resolver = Resolver;
Matter.SAT = SAT;
Matter.Constraint = Constraint;
Matter.MouseConstraint = MouseConstraint;
Matter.Common = Common;
Matter.Engine = Engine;
Matter.Metrics = Metrics;
Matter.Mouse = Mouse;
Matter.Sleeping = Sleeping;
Matter.Bodies = Bodies;
Matter.Composites = Composites;
Matter.Axes = Axes;
Matter.Bounds = Bounds;
Matter.Vector = Vector;
Matter.Vertices = Vertices;
Matter.Gui = Gui;
Matter.Render = Render;

// CommonJS module
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Matter;
    }
    exports.Matter = Matter;
}

// AMD module
if (typeof define === 'function' && define.amd) {
    define('Matter', [], function () {
        return Matter;
    });
}

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
    window.Matter = Matter;
}

// End Matter namespace closure

})();