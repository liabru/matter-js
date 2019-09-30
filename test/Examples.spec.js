/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const { 
    stubBrowserFeatures, engineSnapshot, toMatchExtrinsics, toMatchIntrinsics 
} = require('./TestTools');

const totalUpdates = 120;
const isCompare = process.env.COMPARE === 'true';
const excludeExamples = ['stress', 'stress2', 'svg', 'terrain'];

const MatterBuild = require('../build/matter');
const MatterDev = require('../src/module/main');

jest.mock('matter-wrap', () => require('../demo/lib/matter-wrap'), { virtual: true });
jest.mock('poly-decomp', () => require('../demo/lib/decomp'), { virtual: true });

const runExamples = (matter) => {
    let snapshots = {};
    matter = stubBrowserFeatures(matter);
    global.Matter = matter;
    matter.use(require('matter-wrap'));

    const Example = require('../examples/index');
    const examples = Object.keys(Example).filter(key => !excludeExamples.includes(key));

    const consoleOriginal = global.console;
    global.console = { log: () => {} };

    for (name of examples) {
        matter.Common._nextId = matter.Common._seed = 0;

        const example = Example[name]();
        const engine = example.engine;

        for (let i = 0; i < totalUpdates; i += 1) {
            matter.Engine.update(engine, 1000 / 60);
        }
    
        snapshots[name] = isCompare ? engineSnapshot(engine) : {};
    }

    global.console = consoleOriginal;
    global.Matter = undefined;
    return snapshots;
};

const snapshotsDev = runExamples(MatterDev);
const snapshotsBuild = runExamples(MatterBuild);
const examples = Object.keys(snapshotsDev);

describe(`Integration tests (${examples.length})`, () => {
    test(`Examples run without throwing`, () => {
        expect(Object.keys(snapshotsDev)).toEqual(examples);
        expect(Object.keys(snapshotsBuild)).toEqual(examples);
    });
});

if (isCompare) {
    describe(`Regression tests (${examples.length})`, () => {
        expect.extend(toMatchExtrinsics);
        expect.extend(toMatchIntrinsics);

        test(`Examples match properties with release build`, () => {
            expect(snapshotsDev).toMatchIntrinsics(snapshotsBuild, totalUpdates);
        });

        test(`Examples match positions and velocities with release build`, () => {
            expect(snapshotsDev).toMatchExtrinsics(snapshotsBuild, totalUpdates);
        });
    });
}