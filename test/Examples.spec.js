/* eslint-env es6 */
"use strict";

jest.setTimeout(2 * 60 * 1000);

const fs = require('fs');

const {
    requireUncached,
    comparisonReport, 
    logReport, 
    toMatchExtrinsics, 
    toMatchIntrinsics 
} = require('./TestTools');

const Example = requireUncached('../examples/index');
const MatterBuild = requireUncached('../build/matter');
const { versionSatisfies } = requireUncached('../src/core/Plugin');
const Worker = require('jest-worker').default;

const specificExamples = process.env.EXAMPLES ? process.env.EXAMPLES.split(' ') : null;
const testComparison = process.env.COMPARE === 'true';
const saveComparison = process.env.SAVE === 'true';

const excludeExamples = ['svg', 'terrain'];
const excludeJitter = ['stack', 'circleStack', 'restitution', 'staticFriction', 'friction', 'newtonsCradle', 'catapult'];

const examples = (specificExamples || Object.keys(Example)).filter(key => {
    const excluded = excludeExamples.includes(key);
    const buildVersion = MatterBuild.version;
    const exampleFor = Example[key].for;
    const supported = versionSatisfies(buildVersion, exampleFor);
    return !excluded && supported;
});

const captureExamples = async useDev => {
    const multiThreadWorker = new Worker(require.resolve('./ExampleWorker'), {
        enableWorkerThreads: true
    });

    const overlapRuns = await Promise.all(examples.map(name => multiThreadWorker.runExample({
        name,
        useDev,
        updates: 2,
        stableSort: true,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    const behaviourRuns = await Promise.all(examples.map(name => multiThreadWorker.runExample({
        name,
        useDev,
        updates: 2,
        stableSort: true,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    const similarityRuns = await Promise.all(examples.map(name => multiThreadWorker.runExample({
        name,
        useDev,
        updates: 2,
        stableSort: false,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    await multiThreadWorker.end();

    const singleThreadWorker = new Worker(require.resolve('./ExampleWorker'), {
        enableWorkerThreads: true,
        numWorkers: 1
    });

    const completeRuns = await Promise.all(examples.map(name => singleThreadWorker.runExample({
        name,
        useDev,
        updates: 150,
        stableSort: false,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    await singleThreadWorker.end();

    const capture = {};

    for (const completeRun of completeRuns) {
        const behaviourRun = behaviourRuns.find(({ name }) => name === completeRun.name);
        const similarityRun = similarityRuns.find(({ name }) => name === completeRun.name);
        const overlapRun = overlapRuns.find(({ name }) => name === completeRun.name);

        capture[overlapRun.name] = {
            ...completeRun,
            behaviourExtrinsic: behaviourRun.extrinsic,
            similarityExtrinsic: similarityRun.extrinsic,
            overlap: overlapRun.overlap
        };
    }

    return capture;
};

const capturesDev = captureExamples(true);
const capturesBuild = captureExamples(false);

afterAll(async () => {
    // Report experimental capture comparison.
    const dev = await capturesDev;
    const build = await capturesBuild;

    const buildSize = fs.statSync('./build/matter.min.js').size;
    const devSize = fs.statSync('./build/matter.dev.min.js').size;

    console.log(
        'Examples ran against previous release and current build\n\n'
        + logReport(build, `release`) + '\n'
        + logReport(dev, `current`) + '\n'
        + comparisonReport(dev, build, devSize, buildSize, MatterBuild.version, saveComparison)
    );
});

describe(`Integration checks (${examples.length})`, () => {
    test(`Examples run without throwing`, async () => {
        const dev = await capturesDev;
        const build = await capturesBuild;
        expect(Object.keys(dev)).toEqual(examples);
        expect(Object.keys(build)).toEqual(examples);
    });
});

// Experimental regression comparison checks.
if (testComparison) {
    describe(`Regression checks (${examples.length})`, () => {
        expect.extend(toMatchExtrinsics);
        expect.extend(toMatchIntrinsics);

        test(`Examples match intrinsic properties with release build`, async () => {
            const dev = await capturesDev;
            const build = await capturesBuild;
            // compare mass, inertia, friction etc.
            expect(dev).toMatchIntrinsics(build);
        });

        test(`Examples match extrinsic positions and velocities with release build`, async () => {
            const dev = await capturesDev;
            const build = await capturesBuild;
            // compare position, linear and angular velocity
            expect(dev).toMatchExtrinsics(build);
        });
    });
}