/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const mock = require('mock-require');
const { requireUncached, engineCapture } = require('./TestTools');
const Example = require('../examples/index');
const consoleOriginal = global.console;

const prepareMatter = (options) => {
  const Matter = requireUncached(options.useDev ? '../build/matter.dev' : '../build/matter');

  if (Matter.Common._nextId !== 0) {
    throw 'Matter instance has already been used.';
  }

  const noop = () => ({ collisionFilter: {}, mouse: {} });

  Matter.Render.create = () => ({ options: {}, bounds: { min: { x: 0, y: 0 }, max: { x: 800, y: 600 }}});
  Matter.Render.run = Matter.Render.lookAt = noop;
  Matter.Runner.create = Matter.Runner.run = noop;
  Matter.MouseConstraint.create = Matter.Mouse.create = noop;
  Matter.Common.info = Matter.Common.warn = Matter.Common.log;
  
  return Matter;
};

const prepareEnvironment = Matter => {
  mock('matter-js', Matter);
  global.Matter = Matter;

  const logs = [];
  global.document = global.window = { addEventListener: () => {} };
  global.console = { 
    log: (...args) => {
      logs.push(args.join(' '));
    }
  };

  return logs;
};

const resetEnvironment = () => {
  global.console = consoleOriginal;
  global.window = undefined;
  global.document = undefined;
  global.Matter = undefined;
  mock.stopAll();
};

const runExample = options => {
  const Matter = prepareMatter(options);
  const logs = prepareEnvironment(Matter);

  const example = Example[options.name]();
  const engine = example.engine;
  
  let totalMemory = 0;
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

  global.gc();

  for (let i = 0; i < options.totalUpdates; i += 1) {
      const startTime = process.hrtime();
      totalMemory += process.memoryUsage().heapUsed;
      
      Matter.Engine.update(engine, 1000 / 60);

      const duration = process.hrtime(startTime);
      totalDuration += duration[0] * 1e9 + duration[1];
      totalMemory += process.memoryUsage().heapUsed;

      const pairsList = engine.pairs.list;
      const pairsListLength = engine.pairs.list.length;

      for (let p = 0; p < pairsListLength; p += 1) {
        const pair = pairsList[p];
        const separation = pair.separation - pair.slop;

        if (pair.isActive && !pair.isSensor) {
          overlapTotal += separation > 0 ? separation : 0;
          overlapCount += 1;
        }
      }
  }

  resetEnvironment();

  return {
    name: options.name,
    duration: totalDuration,
    overlap: overlapTotal / (overlapCount || 1),
    memory: totalMemory,
    logs,
    ...engineCapture(engine)
  };
};

module.exports = { runExample };