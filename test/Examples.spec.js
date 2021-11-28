/* eslint-env es6 */
"use strict";

jest.setTimeout(30 * 1000);

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

const testComparison = process.env.COMPARE === 'true';
const saveComparison = process.env.SAVE === 'true';
const excludeExamples = ['svg', 'terrain'];
const excludeJitter = ['stack', 'circleStack', 'restitution', 'staticFriction', 'friction', 'newtonsCradle', 'catapult'];

const examples = Object.keys(Example).filter(key => {
    const excluded = excludeExamples.includes(key);
    const buildVersion = MatterBuild.version;
    const exampleFor = Example[key].for;
    const supported = versionSatisfies(buildVersion, exampleFor);
    return !excluded && supported;
});

const captureExamples = async useDev => {
    const worker = new Worker(require.resolve('./ExampleWorker'), {
        enableWorkerThreads: true,
        numWorkers: 1
    });

    const result = await Promise.all(examples.map(name => worker.runExample({
        name,
        useDev,
        totalUpdates: 120,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    await worker.end();

    return result.reduce((out, capture) => (out[capture.name] = capture, out), {});
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