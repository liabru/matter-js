/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const stubBrowserFeatures = M => {
  const noop = () => ({ collisionFilter: {}, mouse: {} });
  M.Render.create = () => ({ options: {}, bounds: { min: { x: 0, y: 0 }, max: { x: 800, y: 600 }}});
  M.Render.run = M.Render.lookAt = noop;
  M.Runner.create = M.Runner.run = noop;
  M.MouseConstraint.create = M.Mouse.create = noop;
  M.Common.info = M.Common.warn = M.Common.log;
  return M;
};

const reset = M => {
  M.Common._nextId = M.Common._seed = 0;
  M.Body._nextCollidingGroupId = 1;
  M.Body._nextNonCollidingGroupId = -1;
  M.Body._nextCategory = 0x0001;
};

const mock = require('mock-require');
const { engineCapture } = require('./TestTools');
const MatterDev = stubBrowserFeatures(require('../src/module/main'));
const MatterBuild = stubBrowserFeatures(require('../build/matter'));
const Example = require('../examples/index');

const runExample = options => {
  const Matter = options.useDev ? MatterDev : MatterBuild;
  const consoleOriginal = global.console;
  const logs = [];

  mock('matter-js', Matter);
  global.Matter = Matter;

  global.document = global.window = { addEventListener: () => {} };
  global.console = { 
    log: (...args) => {
      logs.push(args.join(' '));
    }
  };

  reset(Matter);

  const example = Example[options.name]();
  const engine = example.engine;
  
  let totalDuration = 0;
  let overlapTotal = 0;
  let overlapCount = 0;

  const bodies = Matter.Composite.allBodies(engine.world);

  if (options.jitter) {
    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i];

      Matter.Body.applyForce(body, body.position, { 
        x: Math.cos(i * i) * options.jitter * body.mass, 
        y: Math.sin(i * i) * options.jitter * body.mass
      });
    }
  }

  for (let i = 0; i < options.totalUpdates; i += 1) {
      const startTime = process.hrtime();

      Matter.Engine.update(engine, 1000 / 60);

      const duration = process.hrtime(startTime);
      totalDuration += duration[0] * 1e9 + duration[1];

      for (let p = 0; p < engine.pairs.list.length; p += 1) {
        const pair = engine.pairs.list[p];
        const separation = pair.separation - pair.slop;

        if (pair.isActive && !pair.isSensor) {
          overlapTotal += separation > 0 ? separation : 0;
          overlapCount += 1;
        }
      }
  }

  global.console = consoleOriginal;
  global.window = undefined;
  global.document = undefined;
  global.Matter = undefined;
  mock.stopAll();

  return {
    name: options.name,
    duration: totalDuration,
    overlap: overlapTotal / (overlapCount || 1),
    logs,
    ...engineCapture(engine)
  };
};

module.exports = { runExample };