/* eslint-env es6 */
"use strict";

const fs = require('fs');
const compactStringify = require('json-stringify-pretty-compact');
const { Composite, Constraint } = require('../src/module/main');

const comparePath = './test/__compare__';
const compareCommand = 'open http://localhost:8000/?compare'
const diffCommand = 'code -n -d test/__compare__/examples-dev.json test/__compare__/examples-build.json';

const intrinsicProps = [
    // Common
    'id', 'label', 

    // Constraint
    'angularStiffness', 'bodyA', 'bodyB', 'damping', 'length', 'stiffness',

    // Body
    'area', 'axes', 'collisionFilter', 'category', 'mask', 
    'group', 'density', 'friction', 'frictionAir', 'frictionStatic', 'inertia', 'inverseInertia', 'inverseMass', 'isSensor', 
    'isSleeping', 'isStatic', 'mass', 'parent', 'parts', 'restitution', 'sleepThreshold', 'slop', 
    'timeScale', 'vertices',

    // Composite
    'bodies', 'constraints', 'composites'
];

const stubBrowserFeatures = M => {
    const noop = () => ({ collisionFilter: {}, mouse: {} });
    M.Render.create = () => ({ options: {}, bounds: { min: { x: 0, y: 0 }, max: { x: 800, y: 600 }}});
    M.Render.run = M.Render.lookAt = noop;
    M.Runner.create = M.Runner.run = noop;
    M.MouseConstraint.create = M.Mouse.create = noop;
    M.Common.log = M.Common.info = M.Common.warn = noop;
    return M;
};

const colors = { White: 37, BrightWhite: 90, BrightCyan: 36 };
const color = (text, number) => `\x1b[${number}m${text}\x1b[0m`;
const limit = (val, precision=3) => parseFloat(val.toPrecision(precision));

const engineSnapshot = (engine) => ({
    timestamp: limit(engine.timing.timestamp),
    world: worldSnapshotExtrinsic(engine.world),
    worldIntrinsic: worldSnapshotIntrinsic(engine.world)
});

const worldSnapshotExtrinsic = world => ({
    bodies: Composite.allBodies(world).reduce((bodies, body) => {
        bodies[body.id] = [
            body.position.x,
            body.position.y,
            body.positionPrev.x,
            body.positionPrev.y,
            body.angle,
            body.anglePrev,
            ...body.vertices.reduce((flat, vertex) => (flat.push(vertex.x, vertex.y), flat), [])
        ];

        return bodies;
    }, {}),
    constraints: Composite.allConstraints(world).reduce((constraints, constraint) => {
        const positionA = Constraint.pointAWorld(constraint);
        const positionB = Constraint.pointBWorld(constraint);

        constraints[constraint.id] = [
            positionA.x,
            positionA.y,
            positionB.x,
            positionB.y
        ];

        return constraints;
    }, {})
});

const worldSnapshotIntrinsic = world => worldSnapshotIntrinsicBase({
    bodies: Composite.allBodies(world).reduce((bodies, body) => {
        bodies[body.id] = body;
        return bodies;
    }, {}),
    constraints: Composite.allConstraints(world).reduce((constraints, constraint) => {
        constraints[constraint.id] = constraint;
        return constraints;
    }, {}),
    composites: Composite.allComposites(world).reduce((composites, composite) => {
        composites[composite.id] = {
            bodies: Composite.allBodies(composite).map(body => body.id), 
            constraints: Composite.allConstraints(composite).map(constraint => constraint.id), 
            composites: Composite.allComposites(composite).map(composite => composite.id)
        };
        return composites;
    }, {})
});

const worldSnapshotIntrinsicBase = (obj, depth=0) => {
    if (obj === Infinity) {
        return 'Infinity';
    } else if (typeof obj === 'number') {
        return limit(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => worldSnapshotIntrinsicBase(item, depth + 1));
    } else if (typeof obj !== 'object') {
        return obj;
    }

    const result = Object.entries(obj)
        .filter(([key]) => depth <= 1 || intrinsicProps.includes(key))
        .reduce((cleaned, [key, val]) => {
            if (val && val.id && String(val.id) !== key) {
                val = val.id;
            }
            
            if (Array.isArray(val) && !['composites', 'constraints', 'bodies'].includes(key)) {
                val = `[${val.length}]`;
            }

            cleaned[key] = worldSnapshotIntrinsicBase(val, depth + 1);
            return cleaned;
        }, {});

    return Object.keys(result).sort()
        .reduce((sorted, key) => (sorted[key] = result[key], sorted), {});
};

const similarity = (a, b) => {
    const distance = Math.sqrt(a.reduce((sum, _val, i) => sum + Math.pow(a[i] - b[i], 2), 0));
    return 1 / (1 + (distance / a.length));
};

const snapshotSimilarityExtrinsic = (currentSnapshots, referenceSnapshots) => {
    const result = {};

    Object.entries(currentSnapshots).forEach(([name, current]) => {
        const reference = referenceSnapshots[name];
        const worldVector = [];
        const worldVectorRef = [];

        Object.keys(current.world).forEach(objectType => {
            Object.keys(current.world[objectType]).forEach(objectId => {
                worldVector.push(...current.world[objectType][objectId]);
                worldVectorRef.push(...reference.world[objectType][objectId]);
            });
        });

        result[name] = similarity(worldVector, worldVectorRef);
    });

    return result;
};

const writeSnapshots = (name, obj) => {
    try {
        fs.mkdirSync(comparePath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
    fs.writeFileSync(`${comparePath}/${name}.json`, compactStringify(obj, { maxLength: 100 }), 'utf8');
};

const toMatchExtrinsics = {
    toMatchExtrinsics(received, value, ticks) {
        const changed = [];
        const borderline = [];
        const equal = [];
        const similaritys = snapshotSimilarityExtrinsic(received, value);
        const entries = Object.entries(similaritys);

        entries.sort(([_nameA, similarityA], [_nameB, similarityB]) => similarityA - similarityB);

        entries.forEach(([name, similarity], i) => {
            const percentSimilar = similarity * 100;

            if (percentSimilar < 99.99) {
                const col = i < 5 ? colors.White : colors.BrightWhite;
                changed.push(color(`◇ ${name}`, col) + ` ${percentSimilar.toFixed(2)}%`);
            } else if (percentSimilar !== 100) {
                borderline.push(`~ ${name}`);
            } else {
                equal.push(`✓ ${name}`);
            }
        });

        const pass = equal.length === entries.length && changed.length === 0 && borderline.length === 0;

        return {
            message: () => `Expected positions and velocities to match between builds.

${color('▶', colors.White)} Debug using ${color(compareCommand + '=' + ticks + '#' + entries[0][0], colors.BrightCyan)}

(${changed.length}) Changed

    ${changed.join(' ')}

(${borderline.length}) Borderline (> 99.99%)

    ${borderline.join(' ').slice(0, 80)}...

(${equal.length}) Equal

    ${equal.join(' ').slice(0, 80)}...`,
            pass
        };
    }
};

const toMatchIntrinsics = {
    toMatchIntrinsics(currentSnapshots, referenceSnapshots) {
        const changed = [];
        const equal = [];
        const currentChanged = {};
        const referenceChanged = {};
        const entries = Object.entries(currentSnapshots);

        entries.forEach(([name, current]) => {
            const reference = referenceSnapshots[name];
            const endWorld = current.worldIntrinsic;
            const endWorldRef = reference.worldIntrinsic;

            if (this.equals(endWorld, endWorldRef)) {
                equal.push(`✓ ${name}`);
            } else {
                changed.push(color(`◇ ${name}`, changed.length < 5 ? colors.White : colors.BrightWhite));

                if (changed.length < 2) {
                    currentChanged[name] = endWorld;
                    referenceChanged[name] = endWorldRef;
                }
            }
        });

        const pass = equal.length === entries.length && changed.length === 0;

        writeSnapshots('examples-dev', currentChanged);
        writeSnapshots('examples-build', referenceChanged);

        return {
            message: () => `Expected intrinsic properties to match between builds.

(${changed.length}) Changed

${changed.join(' ')}

(${equal.length}) Equal

${equal.join(' ').slice(0, 80)}...

${color('▶', colors.White)} Inspect using ${color(diffCommand, colors.BrightCyan)}`,
            pass
        };
    }
};

module.exports = {
    stubBrowserFeatures, engineSnapshot, toMatchExtrinsics, toMatchIntrinsics
};