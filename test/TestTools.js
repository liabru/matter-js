/* eslint-env es6 */
"use strict";

const fs = require('fs');
const compactStringify = require('json-stringify-pretty-compact');
const { Composite, Constraint } = require('../src/module/main');

const comparePath = './test/__compare__';
const compareCommand = 'open http://localhost:8000/?compare';
const diffSaveCommand = 'npm run test-save';
const diffCommand = 'code -n -d test/__compare__/examples-build.json test/__compare__/examples-dev.json';
const equalityThreshold = 0.99999;

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

const colors = { Red: 31, Green: 32, Yellow: 33, White: 37, BrightWhite: 90, BrightCyan: 36 };
const color = (text, number) => number ? `\x1b[${number}m${text}\x1b[0m` : text;
const limit = (val, precision=3) => parseFloat(val.toPrecision(precision));
const toPercent = val => (100 * val).toPrecision(3);

const engineCapture = (engine) => ({
    timestamp: limit(engine.timing.timestamp),
    extrinsic: worldCaptureExtrinsic(engine.world),
    intrinsic: worldCaptureIntrinsic(engine.world)
});

const worldCaptureExtrinsic = world => ({
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

const worldCaptureIntrinsic = world => worldCaptureIntrinsicBase({
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

const worldCaptureIntrinsicBase = (obj, depth=0) => {
    if (obj === Infinity) {
        return 'Infinity';
    } else if (typeof obj === 'number') {
        return limit(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => worldCaptureIntrinsicBase(item, depth + 1));
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

            cleaned[key] = worldCaptureIntrinsicBase(val, depth + 1);
            return cleaned;
        }, {});

    return Object.keys(result).sort()
        .reduce((sorted, key) => (sorted[key] = result[key], sorted), {});
};

const similarity = (a, b) => {
    const distance = Math.sqrt(a.reduce(
        (sum, _val, i) => sum + Math.pow((a[i] || 0) - (b[i] || 0), 2), 0)
    );
    return 1 / (1 + (distance / a.length));
};

const captureSimilarityExtrinsic = (currentCaptures, referenceCaptures) => {
    const result = {};

    Object.entries(currentCaptures).forEach(([name, current]) => {
        const reference = referenceCaptures[name];
        const worldVector = [];
        const worldVectorRef = [];

        Object.keys(current.extrinsic).forEach(objectType => {
            Object.keys(current.extrinsic[objectType]).forEach(objectId => {
                worldVector.push(...current.extrinsic[objectType][objectId]);
                worldVectorRef.push(...reference.extrinsic[objectType][objectId]);
            });
        });

        result[name] = similarity(worldVector, worldVectorRef);
    });

    return result;
};

const writeResult = (name, obj) => {
    try {
        fs.mkdirSync(comparePath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    if (typeof obj === 'string') {
        fs.writeFileSync(`${comparePath}/${name}.md`, obj, 'utf8');
    } else {
        fs.writeFileSync(`${comparePath}/${name}.json`, compactStringify(obj, { maxLength: 100 }), 'utf8');
    }
};

const toMatchExtrinsics = {
    toMatchExtrinsics(received, value) {
        const similaritys = captureSimilarityExtrinsic(received, value);
        const pass = Object.values(similaritys).every(similarity => similarity >= equalityThreshold);

        return {
            message: () => 'Expected positions and velocities to match between builds.',
            pass
        };
    }
};

const toMatchIntrinsics = {
    toMatchIntrinsics(currentCaptures, referenceCaptures) {
        const entries = Object.entries(currentCaptures);
        let changed = false;

        entries.forEach(([name, current]) => {
            const reference = referenceCaptures[name];
            if (!this.equals(current.intrinsic, reference.intrinsic)) {
                changed = true;
            }
        });

        return {
            message: () => 'Expected intrinsic properties to match between builds.',
            pass: !changed
        };
    }
};

const similarityRatings = similarity => similarity < equalityThreshold ? color('●', colors.Yellow) : '·';
const changeRatings = isChanged => isChanged ? color('◆', colors.White) : '·';

const equals = (a, b) => {
    try {
        expect(a).toEqual(b);
    } catch (e) {
        return false;
    }
    return true;
};

const logReport = (captures, version) => {
    let report = '';

    for (const capture of Object.values(captures)) {
        if (!capture.logs.length) {
            continue;
        }

        report += `  ${capture.name}\n`;

        for (const log of capture.logs) {
            report += `    ${log}\n`;
        }
    }

    return `Output logs from ${color(version, colors.Yellow)} version on last run\n\n` 
        + (report ? report : '  None\n');
};

const comparisonReport = (capturesDev, capturesBuild, buildVersion, save) => {
    const similaritys = captureSimilarityExtrinsic(capturesDev, capturesBuild);
    const similarityEntries = Object.entries(similaritys);
    const devIntrinsicsChanged = {};
    const buildIntrinsicsChanged = {};
    let intrinsicChangeCount = 0;
    let totalTimeBuild = 0;
    let totalTimeDev = 0;
    let totalOverlapBuild = 0;
    let totalOverlapDev = 0;

    const capturePerformance = Object.entries(capturesDev).map(([name]) => {
        totalTimeBuild += capturesBuild[name].duration;
        totalTimeDev += capturesDev[name].duration;
        totalOverlapBuild += capturesBuild[name].overlap;
        totalOverlapDev += capturesDev[name].overlap;

        const changedIntrinsics = !equals(capturesDev[name].intrinsic, capturesBuild[name].intrinsic);
        if (changedIntrinsics) {
            capturesDev[name].changedIntrinsics = true;
            if (intrinsicChangeCount < 2) {
                devIntrinsicsChanged[name] = capturesDev[name].intrinsic;
                buildIntrinsicsChanged[name] = capturesBuild[name].intrinsic;
                intrinsicChangeCount += 1;
            }
        }
        
        return { name };
    });

    capturePerformance.sort((a, b) => a.name.localeCompare(b.name));
    similarityEntries.sort((a, b) => a[1] - b[1]);

    let perfChange = 1 - (totalTimeDev / totalTimeBuild);
    
    const perfChangeThreshold = 0.075;
    const perfChangeLarge = Math.abs(perfChange) > perfChangeThreshold;
    perfChange = perfChangeLarge ? perfChange : 0;

    let similarityAvg = 0;
    similarityEntries.forEach(([_, similarity]) => {
        similarityAvg += similarity;
    });

    similarityAvg /= similarityEntries.length;

    const overlapChange = (totalOverlapDev / (totalOverlapBuild || 1)) - 1;

    const report = (breakEvery, format) => [
        [`Output comparison of ${similarityEntries.length}`,
         `examples against previous release ${format('matter-js@' + buildVersion, colors.Yellow)}`
        ].join(' '),
        `\n\n${format('Similarity', colors.White)}`,
        `${format(toPercent(similarityAvg), similarityAvg === 1 ? colors.Green : colors.Yellow)}%`,
        `${format('Performance', colors.White)}`,
        `${format((perfChange >= 0 ? '+' : '') + toPercent(perfChange), perfChange >= 0 ? colors.Green : colors.Red)}%`,
        `${format('Overlap', colors.White)}`,
        `${format((overlapChange >= 0 ? '+' : '') + toPercent(overlapChange), overlapChange > 0 ? colors.Red : colors.Green)}%`,
        capturePerformance.reduce((output, p, i) => {
            output += `${p.name} `;
            output += `${similarityRatings(similaritys[p.name])} `;
            output += `${changeRatings(capturesDev[p.name].changedIntrinsics)} `;
            if (i > 0 && i < capturePerformance.length && breakEvery > 0 && i % breakEvery === 0) {
                output += '\n';
            }
            return output;
        }, '\n\n'),
        `\nwhere  · no change  ● extrinsics changed  ◆ intrinsics changed\n`,
        similarityAvg < 1 ? `\n${format('▶', colors.White)} ${format(compareCommand + '=' + 120 + '#' + similarityEntries[0][0], colors.BrightCyan)}` : '',
        intrinsicChangeCount > 0 ? `\n${format('▶', colors.White)} ${format((save ? diffCommand : diffSaveCommand), colors.BrightCyan)}` : ''
    ].join('  ');

    if (save) {
        writeResult('examples-dev', devIntrinsicsChanged);
        writeResult('examples-build', buildIntrinsicsChanged);
        writeResult('examples-report', report(5, s => s));
    }

    return report(5, color);
};

module.exports = {
    engineCapture, comparisonReport, logReport,
    toMatchExtrinsics, toMatchIntrinsics
};