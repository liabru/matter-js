/**
* The `Matter.Constraint` module contains methods for creating and manipulating constraints.
* 
* Constraints are used for specifying that a fixed distance or angle must be maintained between bodies or fixed points.
* 
* The stiffness and damping can be modified for a spring-like effect.
*
* The angle range and angle stiffness can also be limited if needed.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Constraint
*/

var Constraint = {};

module.exports = Constraint;

var Vertices = require('../geometry/Vertices');
var Vector = require('../geometry/Vector');
var Sleeping = require('../core/Sleeping');
var Bounds = require('../geometry/Bounds');
var Axes = require('../geometry/Axes');
var Common = require('../core/Common');

(function() {

    Constraint._warming = 0.4;
    Constraint._torqueDampen = 1;
    Constraint._angleLimitDampen = 0.5;
    Constraint._minLength = 0.000001;

    /**
     * Creates a new constraint.
     * 
     * All properties have default values and some may be calculated automatically based on other properties.
     * 
     * To simulate a pin constraint (or revolute joint) set `length: 0` and a high `stiffness` value (e.g. `0.7` or above).
     * 
     * To limit the range of angles of the constraint see the set of angle properties.
     * 
     * If the constraint is unstable, try lowering the `stiffness` value or increasing `engine.constraintIterations`.
     * 
     * For compound bodies, constraints must be applied to the parent body and not its parts.
     * 
     * See the properties section which may be set through the `options` object.
     * @method create
     * @param {} options
     * @return {constraint} constraint
     */
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
            length = Vector.magnitude(Vector.sub(initialPointA, initialPointB)),
            angle = Vector.angle(initialPointA, initialPointB);
        
        constraint.length = typeof constraint.length !== 'undefined' ? constraint.length : length;

        // option defaults
        constraint.id = constraint.id || Common.nextId();
        constraint.label = constraint.label || 'Constraint';
        constraint.type = 'constraint';
        constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);
        constraint.damping = constraint.damping || 0;
        constraint.angularStiffness = constraint.angularStiffness || 0;
        constraint.angleAPrev = constraint.bodyA ? constraint.bodyA.angle : constraint.angleAPrev;
        constraint.angleBPrev = constraint.bodyB ? constraint.bodyB.angle : constraint.angleBPrev;
        constraint.plugin = {};

        constraint.angleA = typeof constraint.angleA !== 'undefined' ? 
            constraint.angleA : (constraint.bodyA ? 0 : angle);

        constraint.angleAStiffness = constraint.angleAStiffness || 0;
        constraint.angleAMin = constraint.angleAMin || 0;
        constraint.angleAMax = constraint.angleAMax || 0;

        constraint.angleB = typeof constraint.angleB !== 'undefined' ? 
            constraint.angleB : (constraint.bodyB ? 0 : angle);

        constraint.angleBStiffness = constraint.angleBStiffness || 0;
        constraint.angleBMin = constraint.angleBMin || 0;
        constraint.angleBMax = constraint.angleBMax || 0;

        // render
        var render = {
            visible: true,
            lineWidth: 2,
            strokeStyle: '#ffffff',
            type: 'line',
            anchors: true,
            angles: true
        };

        if (constraint.length === 0 && constraint.stiffness > 0.1) {
            render.type = 'pin';
            render.anchors = false;
        } else if (constraint.stiffness < 0.9) {
            render.type = 'spring';
        }

        constraint.render = Common.extend(render, constraint.render);

        return constraint;
    };

    /**
     * Prepares for solving by constraint warming.
     * @private
     * @method preSolveAll
     * @param {body[]} bodies
     */
    Constraint.preSolveAll = function(bodies) {
        for (var i = 0; i < bodies.length; i += 1) {
            var body = bodies[i],
                impulse = body.constraintImpulse;

            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {
                continue;
            }

            body.position.x += impulse.x;
            body.position.y += impulse.y;
            body.angle += impulse.angle;
        }
    };

    /**
     * Solves all constraints in a list of collisions.
     * @private
     * @method solveAll
     * @param {constraint[]} constraints
     * @param {number} timeScale
     */
    Constraint.solveAll = function(constraints, timeScale) {
        // Solve fixed constraints first.
        for (var i = 0; i < constraints.length; i += 1) {
            var constraint = constraints[i],
                fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic),
                fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);

            if (fixedA || fixedB) {
                Constraint.solve(constraints[i], timeScale);
            }
        }

        // Solve free constraints last.
        for (i = 0; i < constraints.length; i += 1) {
            constraint = constraints[i];
            fixedA = !constraint.bodyA || (constraint.bodyA && constraint.bodyA.isStatic);
            fixedB = !constraint.bodyB || (constraint.bodyB && constraint.bodyB.isStatic);

            if (!fixedA && !fixedB) {
                Constraint.solve(constraints[i], timeScale);
            }
        }
    };

    /**
     * Solves a distance constraint with Gauss-Siedel method.
     * @private
     * @method solve
     * @param {constraint} constraint
     * @param {number} timeScale
     */
    Constraint.solve = function(constraint, timeScale) {
        var bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            pointA = constraint.pointA,
            pointB = constraint.pointB;

        if (!bodyA && !bodyB)
            return;

        // update reference angle
        if (bodyA && !bodyA.isStatic) {
            Vector.rotate(pointA, bodyA.angle - constraint.angleAPrev, pointA);
            constraint.angleAPrev = bodyA.angle;
        }
        
        // update reference angle
        if (bodyB && !bodyB.isStatic) {
            Vector.rotate(pointB, bodyB.angle - constraint.angleBPrev, pointB);
            constraint.angleBPrev = bodyB.angle;
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
        if (currentLength < Constraint._minLength) {
            currentLength = Constraint._minLength;
        }

        // solve distance constraint with Gauss-Siedel method
        var difference = (currentLength - constraint.length) / currentLength,
            stiffness = constraint.stiffness < 1 ? constraint.stiffness * timeScale : constraint.stiffness,
            force = Vector.mult(delta, difference * stiffness),
            massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0),
            inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0),
            resistanceTotal = massTotal + inertiaTotal,
            angleAStiffness = (constraint.angleAStiffness < 1 ? constraint.angleAStiffness * timeScale : constraint.angleAStiffness) * Constraint._angleLimitDampen,
            angleBStiffness = (constraint.angleBStiffness < 1 ? constraint.angleBStiffness * timeScale : constraint.angleBStiffness) * Constraint._angleLimitDampen,
            torque,
            share,
            normal,
            normalVelocity,
            relativeVelocity,
            angleLimitPointA,
            angleLimitPointB;

        if (constraint.angleAStiffness) {
            angleLimitPointA = Constraint.solveAngleLimits(
                constraint, bodyA, constraint.angleA, constraint.angleAMin, 
                constraint.angleAMax, delta, -1, currentLength, pointAWorld, pointBWorld
            );
        }

        if (constraint.angleBStiffness) {
            angleLimitPointB = Constraint.solveAngleLimits(
                constraint, bodyB, constraint.angleB, constraint.angleBMin, 
                constraint.angleBMax, delta, 1, currentLength, pointBWorld, pointAWorld
            );
        }

        if (constraint.damping) {
            var zero = Vector.create();
            normal = Vector.div(delta, currentLength);

            relativeVelocity = Vector.sub(
                bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
            );

            normalVelocity = Vector.dot(normal, relativeVelocity);
        }

        if (bodyA && !bodyA.isStatic) {
            share = bodyA.inverseMass / massTotal;

            // temporarily add angular limit force from pointB if pinned
            if (angleLimitPointB && (!bodyB || bodyB.isStatic)) {
                force.x -= angleLimitPointB.x * angleBStiffness;
                force.y -= angleLimitPointB.y * angleBStiffness;
            }

            // keep track of applied impulses for post solving
            bodyA.constraintImpulse.x -= force.x * share;
            bodyA.constraintImpulse.y -= force.y * share;

            // apply forces
            bodyA.position.x -= force.x * share;
            bodyA.position.y -= force.y * share;

            // apply damping
            if (constraint.damping) {
                bodyA.positionPrev.x -= constraint.damping * normal.x * normalVelocity * share;
                bodyA.positionPrev.y -= constraint.damping * normal.y * normalVelocity * share;
            }

            // find torque to apply
            torque = (Vector.cross(pointA, force) / resistanceTotal) * Constraint._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);

            // add any torque from angular limit at pointA
            if (angleLimitPointA) {
                torque -= angleLimitPointA.angle * angleAStiffness;
            }

            // apply torque
            bodyA.constraintImpulse.angle -= torque;
            bodyA.angle -= torque;

            // remove angular limit from pointB
            if (angleLimitPointB && (!bodyB || bodyB.isStatic)) {
                force.x += angleLimitPointB.x * angleBStiffness;
                force.y += angleLimitPointB.y * angleBStiffness;
            }
        }

        if (bodyB && !bodyB.isStatic) {
            share = bodyB.inverseMass / massTotal;

            // add angular limit force from pointA if pinned
            if (angleLimitPointA && (!bodyA || bodyA.isStatic)) {
                force.x += angleLimitPointA.x * angleAStiffness;
                force.y += angleLimitPointA.y * angleAStiffness;
            }

            // keep track of applied impulses for post solving
            bodyB.constraintImpulse.x += force.x * share;
            bodyB.constraintImpulse.y += force.y * share;
            
            // apply forces
            bodyB.position.x += force.x * share;
            bodyB.position.y += force.y * share;

            // apply damping
            if (constraint.damping) {
                bodyB.positionPrev.x += constraint.damping * normal.x * normalVelocity * share;
                bodyB.positionPrev.y += constraint.damping * normal.y * normalVelocity * share;
            }

            // find torque to apply
            torque = (Vector.cross(pointB, force) / resistanceTotal) * Constraint._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
            
            // add any torque from angular limit at pointB
            if (angleLimitPointB) {
                torque += angleLimitPointB.angle * angleBStiffness;
            }
            
            // apply torque
            bodyB.constraintImpulse.angle += torque;
            bodyB.angle += torque;
        }

    };

    /**
     * Performs body updates required after solving constraints.
     * @private
     * @method postSolveAll
     * @param {body[]} bodies
     */
    Constraint.postSolveAll = function(bodies) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                impulse = body.constraintImpulse;

            if (body.isStatic || (impulse.x === 0 && impulse.y === 0 && impulse.angle === 0)) {
                continue;
            }

            Sleeping.set(body, false);

            // update geometry and reset
            for (var j = 0; j < body.parts.length; j++) {
                var part = body.parts[j];
                
                Vertices.translate(part.vertices, impulse);

                if (j > 0) {
                    part.position.x += impulse.x;
                    part.position.y += impulse.y;
                }

                if (impulse.angle !== 0) {
                    Vertices.rotate(part.vertices, impulse.angle, body.position);
                    Axes.rotate(part.axes, impulse.angle);
                    if (j > 0) {
                        Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                    }
                }

                Bounds.update(part.bounds, part.vertices, body.velocity);
            }

            // dampen the cached impulse for warming next step
            impulse.angle *= Constraint._warming;
            impulse.x *= Constraint._warming;
            impulse.y *= Constraint._warming;
        }
    };

    /**
     * Returns the world-space position of `constraint.pointA`, accounting for `constraint.bodyA`.
     * @method pointAWorld
     * @param {constraint} constraint
     * @returns {vector} the world-space position
     */
    Constraint.pointAWorld = function(constraint) {
        return {
            x: (constraint.bodyA ? constraint.bodyA.position.x : 0) 
                + (constraint.pointA ? constraint.pointA.x : 0),
            y: (constraint.bodyA ? constraint.bodyA.position.y : 0) 
                + (constraint.pointA ? constraint.pointA.y : 0)
        };
    };

    /**
     * Returns the world-space position of `constraint.pointB`, accounting for `constraint.bodyB`.
     * @method pointBWorld
     * @param {constraint} constraint
     * @returns {vector} the world-space position
     */
    Constraint.pointBWorld = function(constraint) {
        return {
            x: (constraint.bodyB ? constraint.bodyB.position.x : 0) 
                + (constraint.pointB ? constraint.pointB.x : 0),
            y: (constraint.bodyB ? constraint.bodyB.position.y : 0) 
                + (constraint.pointB ? constraint.pointB.y : 0)
        };
    };
    
    /**
     * Solves angle limits on the constraint.
     * @private
     * @method solveAngleLimits
     */
    Constraint.solveAngleLimits = function(constraint, body, angle, angleMin, angleMax, delta, direction, currentLength, pointAWorld, pointBWorld) {
        var currentAngle = (body ? body.angle : 0) + (constraint.length > 0 ? angle : 0),
            min = angleMin < angleMax ? angleMin : angleMax,
            max = angleMax > angleMin ? angleMax : angleMin,
            angleNormal = { x: Math.cos(currentAngle), y: Math.sin(currentAngle) },
            angleDelta;

        if (constraint.length === 0) {
            // use absolute angle for pin constraints
            angleDelta = Common.angleDiff(angle, currentAngle);
        } else {
            // otherwise use relative angle
            angleDelta = Math.atan2(
                angleNormal.x * delta.y * direction - angleNormal.y * delta.x * direction,
                angleNormal.x * delta.x * direction + angleNormal.y * delta.y * direction
            );
        }

        // no impulse required if angle within limits
        if (angleDelta > min && angleDelta < max) {
            return null;
        }

        // find the clamped angle and clamp the normal
        var angleClamped = Common.clampAngle(angleDelta, min, max),
            normalLimited = Vector.rotate(angleNormal, angleClamped);

        // return the impulses required to correct the angle
        return {
            x: pointAWorld.x + normalLimited.x * currentLength - pointBWorld.x, 
            y: pointAWorld.y + normalLimited.y * currentLength - pointBWorld.y,
            angle: Common.angleDiff(angleDelta, angleClamped)
        };
    };

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * An integer `Number` uniquely identifying number generated in `Constraint.create` by `Common.nextId`.
     *
     * @property id
     * @type number
     */

    /**
     * A `String` denoting the type of object.
     *
     * @property type
     * @type string
     * @default "constraint"
     * @readOnly
     */

    /**
     * An arbitrary `String` name to help the user identify and manage bodies.
     *
     * @property label
     * @type string
     * @default "Constraint"
     */

    /**
     * An `Object` that defines the rendering properties to be consumed by the module `Matter.Render`.
     *
     * @property render
     * @type object
     */

    /**
     * A flag that indicates if the constraint should be rendered.
     *
     * @property render.visible
     * @type boolean
     * @default true
     */

    /**
     * A `Number` that defines the line width to use when rendering the constraint outline.
     * A value of `0` means no outline will be rendered.
     *
     * @property render.lineWidth
     * @type number
     * @default 2
     */

    /**
     * A `String` that defines the stroke style to use when rendering the constraint outline.
     * It is the same as when using a canvas, so it accepts CSS style property values.
     *
     * @property render.strokeStyle
     * @type string
     * @default a random colour
     */

    /**
     * A `String` that defines the constraint rendering type. 
     * The possible values are 'line', 'pin', 'spring'.
     * An appropriate render type will be automatically chosen unless one is given in options.
     *
     * @property render.type
     * @type string
     * @default 'line'
     */

    /**
     * A `Boolean` that defines if the constraint's anchor points should be rendered.
     *
     * @property render.anchors
     * @type boolean
     * @default true
     */

    /**
     * A `Boolean` that defines if the constraint's anglular limits should be rendered.
     *
     * @property render.angles
     * @type boolean
     * @default true
     */

    /**
     * The first possible `Body` that this constraint is attached to.
     *
     * @property bodyA
     * @type body
     * @default null
     */

    /**
     * The second possible `Body` that this constraint is attached to.
     *
     * @property bodyB
     * @type body
     * @default null
     */

    /**
     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyA` if defined, otherwise a world-space position.
     *
     * @property pointA
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Vector` that specifies the offset of the constraint from center of the `constraint.bodyB` if defined, otherwise a world-space position.
     *
     * @property pointB
     * @type vector
     * @default { x: 0, y: 0 }
     */

    /**
     * A `Number` that specifies the stiffness of the constraint, i.e. the rate at which it returns to its resting `constraint.length`.
     * 
     * A value of `1` means the constraint should be very stiff.
     * 
     * A value of `0.2` means the constraint acts like a soft spring.
     *
     * @property stiffness
     * @type number
     * @default 1
     */

    /**
     * A `Number` that specifies the damping of the constraint, 
     * i.e. the amount of resistance applied to each body based on their velocities to limit the amount of oscillation.
     * 
     * Damping will only be apparent when the constraint also has a very low `stiffness`.
     * 
     * A value of `0.1` means the constraint will apply heavy damping, resulting in little to no oscillation.
     * 
     * A value of `0` means the constraint will apply no damping.
     *
     * @property damping
     * @type number
     * @default 0
     */

    /**
     * A `Number` that specifies the target resting length of the constraint. 
     * 
     * It is calculated automatically in `Constraint.create` from initial positions of the `constraint.bodyA` and `constraint.bodyB`.
     *
     * @property length
     * @type number
     */

    /**
     * A `Number` in radians that specifies the limiting angle of the constraint about `constraint.pointA`.
     * 
     * Only applies if `constraint.angleAStiffness > 0`.
     * 
     * Defaults to the initial angle of the constraint or `0`.
     * 
     * The angle is relative to `constraint.bodyA.angle` if `constraint.bodyA` is set, otherwise is absolute.
     * 
     * When absolute the angle is measured between the vector `constraint.pointA - constraint.pointB` and the x-axis.
     *
     * @property angleA
     * @type number
     * @default the initial relative constraint angle
     */

    /**
     * A `Number` that specifies the stiffness of angular limits about `constraint.pointA`.  
     * 
     * A value of `0` (default) means the constraint will not limit the angle.  
     * 
     * A value of `0.01` means the constraint will softly limit the angle.  
     * 
     * A value of `1` means the constraint will rigidly limit the angle.  
     *
     * @property angleAStiffness
     * @type number
     * @default 0
     */

    /**
     * A `Number` in radians that specifies the lower angular limit 
     * about `constraint.pointA` relative to `constraint.angleA`.  
     * 
     * A value of `-0.5` means the constraint is limited to `0.5` radians 
     * anti-clockwise of `constraint.angleA`, or clockwise if the value is positive.
     *
     * @property angleAMin
     * @type number
     * @default 0
     */

    /**
     * A `Number` in radians that specifies the upper angular limit 
     * about `constraint.pointA` relative to `constraint.angleA`.
     * 
     * A value of `-0.5` means the constraint is limited to `0.5` radians 
     * anti-clockwise of `constraint.angleA`, or clockwise if the value is positive.
     *
     * @property angleAMax
     * @type number
     * @default 0
     */

    /**
     * A `Number` in radians that specifies the limiting angle of the constraint about `constraint.pointB`.
     * 
     * Only applies if `constraint.angleBStiffness > 0`.
     * 
     * Defaults to the initial angle of the constraint or `0`.
     * 
     * The angle is relative to `constraint.bodyB.angle` if `constraint.bodyB` is set, otherwise is absolute.
     * 
     * When absolute the angle is measured between the vector `constraint.pointA - constraint.pointB` and the x-axis.
     *
     * @property angleB
     * @type number
     * @default the initial relative constraint angle
     */

    /**
     * A `Number` that specifies the stiffness of angular limits about `constraint.pointB`.  
     * 
     * A value of `0` (default) means the constraint will not limit the angle.  
     * 
     * A value of `0.01` means the constraint will softly limit the angle.  
     * 
     * A value of `1` means the constraint will rigidly limit the angle.  
     *
     * @property angleBStiffness
     * @type number
     * @default 0
     */

    /**
     * A `Number` in radians that specifies the lower angular limit 
     * about `constraint.pointB` relative to `constraint.angleB`.  
     * 
     * A value of `-0.5` means the constraint is limited to `0.5` radians 
     * anti-clockwise of `constraint.angleB`, or clockwise if the value is positive.
     *
     * @property angleBMin
     * @type number
     * @default 0
     */

    /**
     * A `Number` in radians that specifies the upper angular limit 
     * about `constraint.pointB` relative to `constraint.angleB`.
     * 
     * A value of `-0.5` means the constraint is limited to `0.5` radians 
     * anti-clockwise of `constraint.angleB`, or clockwise if the value is positive.
     *
     * @property angleBMax
     * @type number
     * @default 0
     */

    /**
     * An object reserved for storing plugin-specific properties.
     *
     * @property plugin
     * @type {}
     */

})();
