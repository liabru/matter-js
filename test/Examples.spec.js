"use strict";

const Common = require('./Common');
const fs = require('fs');
const execSync = require('child_process').execSync;
const useSnapshots = process.env.TEST_SNAPSHOTS === 'true';
const useBuild = process.env.TEST_BUILD === 'true';

console.info(`Testing Matter from ${useBuild ? `build '../build/matter'.` : `source '../src/module/main'.`}`);

// mock modules
if (useBuild) {
    jest.mock('matter-js', () => require('../build/matter'), { virtual: true });
} else {
    jest.mock('matter-js', () => require('../src/module/main'), { virtual: true });
}

jest.mock('matter-wrap', () => require('../demo/lib/matter-wrap'), { virtual: true });
jest.mock('poly-decomp', () => require('../demo/lib/decomp'), { virtual: true });

// import mocked Matter and plugins
const Matter = global.Matter = require('matter-js');
Matter.Plugin.register(require('matter-wrap'));

// import Examples after Matter
const Example = require('../examples/index');

// stub out browser-only functions
const noop = () => ({ collisionFilter: {}, mouse: {} });
Matter.Render.create = () => ({ options: {}, bounds: { min: { x: 0, y: 0 }, max: { x: 800, y: 600 }}});
Matter.Render.run = Matter.Render.lookAt = noop;
Matter.Runner.create = Matter.Runner.run = noop;
Matter.MouseConstraint.create = Matter.Mouse.create = noop;
Matter.Common.log = Matter.Common.info = Matter.Common.warn = noop;

// check initial snapshots if enabled (experimental)
if (useSnapshots && !fs.existsSync('./test/__snapshots__')) {
    const gitState = execSync('git log -n 1 --pretty=%d HEAD').toString().trim();
    const gitIsClean = execSync('git status --porcelain').toString().trim().length === 0;
    const gitIsMaster = gitState.startsWith('(HEAD -> master, origin/master');

    if (!gitIsMaster || !gitIsClean) {
        throw `Snapshots are experimental and are not currently committed due to size.
        Stash changes and switch to HEAD on origin/master.
        Use 'npm run test-snapshot-update' to generate initial snapshots.
        Then run 'npm run test-snapshot' to test against these snapshots.
        Currently on ${gitState}.
        `;
    }
}

// prevent examples from logging
const consoleOriginal = console;
beforeEach(() => { global.console = { log: noop }; });
afterEach(() => { global.console = consoleOriginal; });

// list the examples to test
const examplesExtended = ['constraints'];
const examples = [
    'airFriction', 'ballPool', 'bridge', 'broadphase', 'car', 'catapult', 'chains', 'circleStack', 
    'cloth', 'collisionFiltering', 'compositeManipulation', 'compound', 'compoundStack', 'concave', 
    'constraints', 'doublePendulum', 'events', 'friction', 'gravity', 'gyro', 'manipulation', 'mixed', 
    'newtonsCradle', 'ragdoll', 'pyramid', 'raycasting', 'restitution', 'rounded', 'sensors', 'sleeping', 
    'slingshot', 'softBody', 'sprites', 'stack', 'staticFriction', 'timescale', 'views', 'wreckingBall'
];

// perform integration tests using listed examples
const testName = `Example.%s simulates without throwing${useSnapshots ? ' and matches snapshot' : ''}`;
test.each(examples.map(key => [key]))(testName, exampleName => {
        let engine, startSnapshot, endSnapshot;

        const simulate = () => {
            const example = Example[exampleName]();
            const extended = examplesExtended.includes(exampleName);
            engine = example.engine;
            startSnapshot = Common.engineSnapshot(engine, extended);
            
            for (let i = 0; i < 100; i += 1) {
                Matter.Engine.update(engine, 1000 / 60);
            }

            endSnapshot = Common.engineSnapshot(engine, extended);
        };

        // simulate and assert nothing is thrown
        expect(simulate).not.toThrow();

        // assert there has been some change to the world
        expect(startSnapshot.world).not.toEqual(endSnapshot.world);

        // compare to stored snapshot (experimental)
        if (useSnapshots) {
            expect(endSnapshot).toMatchSnapshot();
        }
    }
);