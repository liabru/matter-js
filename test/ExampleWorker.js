/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const stubBrowserFeatures = M => {
  const noop = () => ({ collisionFilter: {}, mouse: {} });
  M.Render.create = () => ({ options: {}, bounds: { min: { x: 0, y: 0 }, max: { x: 800, y: 600 }}});
  M.Render.run = M.Render.lookAt = noop;
  M.Runner.create = M.Runner.run = noop;
  M.MouseConstraint.create = M.Mouse.create = noop;
  M.Common.log = M.Common.info = M.Common.warn = noop;
  return M;
};

const reset = M => {
  M.Common._nextId = M.Common._seed = 0;
  M.Body._nextCollidingGroupId = 1;
  M.Body._nextNonCollidingGroupId = -1;
  M.Body._nextCategory = 0x0001;
};

const { engineCapture } = require('./TestTools');
const MatterDev = stubBrowserFeatures(require('../src/module/main'));
const MatterBuild = stubBrowserFeatures(require('../build/matter'));
const Example = require('../examples/index');
const decomp = require('../demo/lib/decomp');

const runExample = options => {
  const Matter = options.useDev ? MatterDev : MatterBuild;
  const consoleOriginal = global.console;

  global.console = { log: () => {} };
  global.document = {};
  global.decomp = decomp;
  global.Matter = Matter;

  reset(Matter);

  const example = Example[options.name]();
  const engine = example.engine;
  const startTime = process.hrtime();

  for (let i = 0; i < options.totalUpdates; i += 1) {
      Matter.Engine.update(engine, 1000 / 60);
  }

  const duration = process.hrtime(startTime);

  global.console = consoleOriginal;
  global.document = undefined;
  global.decomp = undefined;
  global.Matter = undefined;

  return {
    name: options.name,
    duration: duration[0] * 1e9 + duration[1],
    ...engineCapture(engine)
  };
};

module.exports = { runExample };