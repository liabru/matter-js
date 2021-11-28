/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const mock = require('mock-require');
const { requireUncached } = require('./TestTools');
const consoleOriginal = global.console;

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

const limitPrecision = (val, precision=3) => parseFloat(val.toPrecision(precision));

const sortById = (objs) => {
  objs.sort((objA, objB) => objA.id - objB.id);
  return objs;
};

const engineCapture = (engine, Matter) => ({
  timestamp: limitPrecision(engine.timing.timestamp),
  extrinsic: worldCaptureExtrinsic(engine.world, Matter),
  intrinsic: worldCaptureIntrinsic(engine.world, Matter)
});

const worldCaptureExtrinsic = (world, Matter) => ({
  bodies: sortById(Matter.Composite.allBodies(world)).reduce((bodies, body) => {
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
  constraints: sortById(Matter.Composite.allConstraints(world)).reduce((constraints, constraint) => {
      const positionA = Matter.Constraint.pointAWorld(constraint);
      const positionB = Matter.Constraint.pointBWorld(constraint);

      constraints[constraint.id] = [
          positionA.x,
          positionA.y,
          positionB.x,
          positionB.y
      ];

      return constraints;
  }, {})
});

const worldCaptureIntrinsic = (world, Matter) => worldCaptureIntrinsicBase({
  bodies: sortById(Matter.Composite.allBodies(world)).reduce((bodies, body) => {
      bodies[body.id] = body;
      return bodies;
  }, {}),
  constraints: sortById(Matter.Composite.allConstraints(world)).reduce((constraints, constraint) => {
      constraints[constraint.id] = constraint;
      return constraints;
  }, {}),
  composites: sortById(Matter.Composite.allComposites(world)).reduce((composites, composite) => {
      composites[composite.id] = {
          bodies: sortById(Matter.Composite.allBodies(composite)).map(body => body.id), 
          constraints: sortById(Matter.Composite.allConstraints(composite)).map(constraint => constraint.id), 
          composites: sortById(Matter.Composite.allComposites(composite)).map(composite => composite.id)
      };
      return composites;
  }, {})
});

const worldCaptureIntrinsicBase = (obj, depth=0) => {
  if (obj === Infinity) {
      return 'Infinity';
  } else if (typeof obj === 'number') {
      return limitPrecision(obj);
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

const runExample = options => {
  const Matter = prepareMatter(options);
  const logs = prepareEnvironment(Matter);

  const Examples = requireUncached('../examples/index');
  const example = Examples[options.name]();
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
    ...engineCapture(engine, Matter)
  };
};

module.exports = { runExample };