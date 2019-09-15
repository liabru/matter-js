const { Composite, Constraint, Vertices } = require('../src/module/main');

const includeKeys = [
    // Common
    'id', 'label', 

    // Constraint
    'angularStiffness', 'bodyA', 'bodyB', 'pointA', 'pointB', 'damping', 'length', 'stiffness',

    // Body
    'angle', 'anglePrev', 'area', 'axes', 'bounds', 'min', 'max', 'x', 'y', 'collisionFilter', 'category', 'mask', 
    'group', 'density', 'friction', 'frictionAir', 'frictionStatic', 'inertia', 'inverseInertia', 'inverseMass', 'isSensor', 
    'isSleeping', 'isStatic', 'mass', 'parent', 'parts', 'position', 'positionPrev', 'restitution', 'sleepThreshold', 'slop', 
    'timeScale', 'vertices'
];

const limit = (val, precision=3) => {
    if (typeof val === 'number') {
        return parseFloat(val.toPrecision(precision));
    }

    return val;
};

const engineSnapshot = (engine, extended=false) => {
    const { 
        positionIterations, velocityIterations,
        constraintIterations, timing, world
    } = engine;

    const bodies = Composite.allBodies(world);
    const constraints = Composite.allConstraints(world);
    const composites = Composite.allComposites(world);

    return {
        positionIterations,
        velocityIterations,
        constraintIterations,
        timing,
        bodyCount: bodies.length,
        constraintCount: constraints.length,
        compositeCount: composites.length,
        averageBodyPosition: Vertices.mean(bodies.map(body => body.position)),
        averageBodyPositionPrev: Vertices.mean(bodies.map(body => body.positionPrev)),
        averageBodyAngle: bodies.reduce((angle, body) => angle + body.angle, 0) / bodies.length,
        averageBodyAnglePrev: bodies.reduce((angle, body) => angle + body.anglePrev, 0) / bodies.length,
        averageConstraintPosition: Vertices.mean(
            constraints.reduce((positions, constraint) => {
                positions.push(
                    Constraint.pointAWorld(constraint), 
                    Constraint.pointBWorld(constraint)
                );
                return positions;
            }, []).concat({ x: 0, y: 0 })
        ),
        world: extended ? worldSnapshotExtended(engine.world) : worldSnapshot(engine.world)
    };
};

const worldSnapshot = world => ({
        ...Composite.allBodies(world).reduce((bodies, body) => {
            bodies[`${body.id} ${body.label}`] =
                `${limit(body.position.x)} ${limit(body.position.y)} ${limit(body.angle)}`
                 + ` ${limit(body.position.x - body.positionPrev.x)} ${limit(body.position.y - body.positionPrev.y)}`
                 + ` ${limit(body.angle - body.anglePrev)}`;
            return bodies;
        }, {}),
        ...Composite.allConstraints(world).reduce((constraints, constraint) => {
            const positionA = Constraint.pointAWorld(constraint);
            const positionB = Constraint.pointBWorld(constraint);

            constraints[`${constraint.id} ${constraint.label}`] =
                `${limit(positionA.x)} ${limit(positionA.y)} ${limit(positionB.x)} ${limit(positionB.y)}`
                + ` ${constraint.bodyA ? constraint.bodyA.id : null} ${constraint.bodyB ? constraint.bodyB.id : null}`;

            return constraints;
        }, {})
});

const worldSnapshotExtended = world => worldSnapshotExtendedBase({
    ...Composite.allBodies(world).reduce((bodies, body) => {
        bodies[body.id] = body;
        return bodies;
    }, {}),
    ...Composite.allConstraints(world).reduce((constraints, constraint) => {
        constraints[constraint.id] = constraint;
        return constraints;
    }, {})
});

const worldSnapshotExtendedBase = (obj, depth=0) => {
    if (typeof obj === 'number') {
        return limit(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => worldSnapshotExtendedBase(item, depth + 1));
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    return Object.entries(obj)
        .filter(([key]) => depth === 0 || includeKeys.includes(key))
        .reduce((cleaned, [key, val]) => {
            if (val && val.id && String(val.id) !== key) {
                val = val.id;
            }
            
            if (Array.isArray(val)) {
                val = `[${val.length}]`;
            }

            return { ...cleaned, [key]: worldSnapshotExtendedBase(val, depth + 1) };
        }, {});
};

module.exports = { engineSnapshot };