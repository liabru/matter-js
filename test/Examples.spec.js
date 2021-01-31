/* eslint-env es6 */
"use strict";

jest.setTimeout(30 * 1000);

const { 
    comparisonReport, 
    logReport, 
    toMatchExtrinsics, 
    toMatchIntrinsics 
} = require('./TestTools');

const Example = require('../examples/index');
const MatterBuild = require('../build/matter');
const { versionSatisfies } = require('../src/core/Plugin');
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

const runExamples = async useDev => {
    const worker = new Worker(require.resolve('./ExampleWorker'), {
        enableWorkerThreads: true
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

const capturesDev = runExamples(true);
const capturesBuild = runExamples(false);

afterAll(async () => {
    // Report experimental capture comparison.
    const dev = await capturesDev;
    const build = await capturesBuild;

    console.log(
        'Examples ran against previous release and current version\n\n'
        + logReport(build, `release`) + '\n'
        + logReport(dev, `current`) + '\n'
        + comparisonReport(dev, build, MatterBuild.version, saveComparison)
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