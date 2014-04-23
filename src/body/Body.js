/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Body
*/

var Body = {};

(function() {

    var _nextId = 0,
        _nextGroupId = 1;

    /**
     * Description to be written.
     * @method create
     * @param {} options
     * @return {body} body
     */
    Body.create = function(options) {
        var defaults = {
            id: Body.nextId(),
            type: 'body',
            angle: 0,
            position: { x: 0, y: 0 },
            force: { x: 0, y: 0 },
            torque: 0,
            positionImpulse: { x: 0, y: 0 },
            constraintImpulse: { x: 0, y: 0, angle: 0 },
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
            groupId: 0,
            slop: 0.05,
            timeScale: 1,
            render: {
                visible: true,
                sprite: {
                    xScale: 1,
                    yScale: 1
                },
                path: 'L 0 0 L 40 0 L 40 40 L 0 40',
                lineWidth: 1.5
            }
        };

        var body = Common.extend(defaults, options);

        Body.updateProperties(body);

        return body;
    };

    /**
     * Description
     * @method nextId
     * @return {Number} Unique bodyID
     */
    Body.nextId = function() {
        return _nextId++;
    };
    
    /**
     * Description
     * @method nextGroupId
     * @return {Number} Unique groupID
     */
    Body.nextGroupId = function() {
        return _nextGroupId++;
    };

    /**
     * Description
     * @method updateProperties
     * @param {body} body
     */
    Body.updateProperties = function(body) {
        // calculated properties
        body.vertices = body.vertices || Vertices.fromPath(body.render.path);
        body.axes = body.axes || Axes.fromVertices(body.vertices);
        body.area = Vertices.area(body.vertices);
        body.bounds = Bounds.create(body.vertices);
        body.mass = body.mass || (body.density * body.area);
        body.inverseMass = 1 / body.mass;
        body.inertia = body.inertia || Vertices.inertia(body.vertices, body.mass);
        body.inverseInertia = 1 / body.inertia;
        body.positionPrev = body.positionPrev || { x: body.position.x, y: body.position.y };
        body.anglePrev = body.anglePrev || body.angle;
        body.render.fillStyle = body.render.fillStyle || (body.isStatic ? '#eeeeee' : Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']));
        body.render.strokeStyle = body.render.strokeStyle || Common.shadeColor(body.render.fillStyle, -20);

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
            body.render.lineWidth = 1;
        }

        Sleeping.set(body, body.isSleeping);
    };

    /**
     * Description
     * @method resetForcesAll
     * @param {body[]} bodies
     */
    Body.resetForcesAll = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            // reset force buffers
            body.force.x = 0;
            body.force.y = 0;
            body.torque = 0;
        }
    };

    /**
     * Description
     * @method applyGravityAll
     * @param {body[]} bodies
     * @param {vector} gravity
     */
    Body.applyGravityAll = function(bodies, gravity) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            // apply gravity
            body.force.y += body.mass * gravity.y * 0.001;
            body.force.x += body.mass * gravity.x * 0.001;
        }
    };

    /**
     * Description
     * @method updateAll
     * @param {body[]} bodies
     * @param {number} deltaTime
     * @param {number} correction
     * @param {bounds} worldBounds
     */
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

    /**
     * Description
     * @method update
     * @param {body} body
     * @param {number} deltaTime
     * @param {number} correction
     */
    Body.update = function(body, deltaTime, correction) {
        var deltaTimeSquared = deltaTime * deltaTime * body.timeScale;

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
        if (body.angularVelocity !== 0) {
            Vertices.rotate(body.vertices, body.angularVelocity, body.position);
            Axes.rotate(body.axes, body.angularVelocity);
        }
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

    /**
     * Description
     * @method applyForce
     * @param {body} body
     * @param {vector} position
     * @param {vector} force
     */
    Body.applyForce = function(body, position, force) {
        body.force.x += force.x;
        body.force.y += force.y;
        var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
        body.torque += (offset.x * force.y - offset.y * force.x) * body.inverseInertia;
    };

    /**
     * Description
     * @method translate
     * @param {body} body
     * @param {vector} translation
     */
    Body.translate = function(body, translation) {
        body.positionPrev.x += translation.x;
        body.positionPrev.y += translation.y;
        body.position.x += translation.x;
        body.position.y += translation.y;
        Vertices.translate(body.vertices, translation);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

    /**
     * Description
     * @method rotate
     * @param {body} body
     * @param {number} angle
     */
    Body.rotate = function(body, angle) {
        body.anglePrev += angle;
        body.angle += angle;
        Vertices.rotate(body.vertices, angle, body.position);
        Axes.rotate(body.axes, angle);
        Bounds.update(body.bounds, body.vertices, body.velocity);
    };

})();