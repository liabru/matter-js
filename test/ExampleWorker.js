/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const mock = require('mock-require');
const { requireUncached, serialize, smoothExp } = require('./TestTools');
const consoleOriginal = global.console;
const DateOriginal = global.Date;

const runExample = options => {
  const { 
    Matter,
    logs,
    frameCallbacks
  } = prepareEnvironment(options);

  let memoryDeltaAverage = 0;
  let timeDeltaAverage = 0;
  let overlapTotal = 0;
  let overlapCount = 0;
  let i;
  let j;

  try {
    let runner;
    let engine;
    let render;
    let extrinsicCapture;

    const pairOverlap = (pair) => {
      const collision = Matter.Collision.collides(pair.bodyA, pair.bodyB);
      return collision ? Math.max(collision.depth - pair.slop, 0) : -1;
    };

    for (i = 0; i < options.repeats; i += 1) {
      if (global.gc) {
        global.gc();
      }

      const Examples = requireUncached('../examples/index');
      const example = Examples[options.name]();

      runner = example.runner;
      engine = example.engine;
      render = example.render;

      for (j = 0; j < options.updates; j += 1) {
        const time = j * runner.delta;
        const callbackCount = frameCallbacks.length;

        global.timeNow = time;

        for (let p = 0; p < callbackCount; p += 1) {
          const frameCallback = frameCallbacks.shift();
          const memoryBefore = process.memoryUsage().heapUsed;
          const timeBefore = process.hrtime();

          frameCallback(time);

          const timeDuration = process.hrtime(timeBefore);
          const timeDelta = timeDuration[0] * 1e9 + timeDuration[1];
          const memoryAfter = process.memoryUsage().heapUsed;
          const memoryDelta = Math.max(memoryAfter - memoryBefore, 0);

          memoryDeltaAverage = smoothExp(memoryDeltaAverage, memoryDelta);
          timeDeltaAverage = smoothExp(timeDeltaAverage, timeDelta);
        }

        let overlapTotalUpdate = 0;
        let overlapCountUpdate = 0;

        const pairsList = engine.pairs.list;
        const pairsListLength = engine.pairs.list.length;

        for (let p = 0; p < pairsListLength; p += 1) {
          const pair = pairsList[p];

          if (pair.isActive && !pair.isSensor){
            const overlap = pairOverlap(pair);

            if (overlap >= 0) {
              overlapTotalUpdate += overlap;
              overlapCountUpdate += 1;
            }
          }
        }

        if (overlapCountUpdate > 0) {
          overlapTotal += overlapTotalUpdate / overlapCountUpdate;
          overlapCount += 1;
        }

        if (!extrinsicCapture && engine.timing.timestamp >= 1000) {
          extrinsicCapture = captureExtrinsics(engine, Matter);
          extrinsicCapture.updates = j;
        }
      }
    }

    resetEnvironment();

    return {
      name: options.name,
      duration: timeDeltaAverage,
      memory: memoryDeltaAverage,
      overlap: overlapTotal / (overlapCount || 1),
      extrinsic: extrinsicCapture,
      intrinsic: captureIntrinsics(engine, Matter),
      state: captureState(engine, runner, render),
      logs
    };

  } catch (err) {
    err.message = `On example '${options.name}' update ${j}:\n\n  ${err.message}`;
    throw err;
  }
};

const prepareMatter = (options) => {
  const Matter = requireUncached(options.useDev ? '../build/matter.dev' : '../build/matter');

  if (Matter.Common._nextId !== 0) {
    throw 'Matter instance has already been used.';
  }

  Matter.Common.info = Matter.Common.warn = Matter.Common.log;

  if (options.stableSort) {
    if (Matter.Collision) {
      const MatterCollisionCollides = Matter.Collision.collides;
      Matter.Collision.collides = function(bodyA, bodyB, pairs) {
        const _bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
        const _bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
        return MatterCollisionCollides(_bodyA, _bodyB, pairs);
      };
    } else {
      const MatterSATCollides = Matter.SAT.collides;
      Matter.SAT.collides = function(bodyA, bodyB, previousCollision, pairActive) {
        const _bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
        const _bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
        return MatterSATCollides(_bodyA, _bodyB, previousCollision, pairActive);
      };
    }

    Matter.after('Detector.collisions', function() { this.sort(collisionCompareId); });
    Matter.after('Composite.allBodies', function() { sortById(this); });
    Matter.after('Composite.allConstraints', function() { sortById(this); });
    Matter.after('Composite.allComposites', function() { sortById(this); });

    Matter.before('Pairs.update', function(pairs) {
      pairs.list.sort((pairA, pairB) => collisionCompareId(pairA.collision, pairB.collision));
    });

    Matter.after('Pairs.update', function(pairs) {
      pairs.list.sort((pairA, pairB) => collisionCompareId(pairA.collision, pairB.collision));
    });
  }

  if (options.jitter) {
    Matter.after('Body.create', function() {
      Matter.Body.applyForce(this, this.position, { 
        x: Math.cos(this.id * this.id) * options.jitter * this.mass, 
        y: Math.sin(this.id * this.id) * options.jitter * this.mass
      });
    });
  }
  
  return Matter;
};

const prepareEnvironment = options => {
  const logs = [];
  const frameCallbacks = [];

  global.document = global.window = {
    performance: {},
    addEventListener: () => {},
    requestAnimationFrame: callback => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    },
    createElement: () => ({
      parentNode: {},
      width: 800,
      height: 600,
      style: {},
      addEventListener: () => {},
      getAttribute: name => ({
        'data-pixel-ratio': '1'
      }[name]),
      getContext: () => new Proxy({}, {
        get() { return () => {}; }
      })
    })
  };

  global.document.body = global.document.createElement();

  global.Image = function Image() { };

  global.console = { 
    log: (...args) => {
      logs.push(args.join(' '));
    }
  };

  global.Math.random = () => {
    throw new Error("Math.random was called during tests, output can not be compared.");
  };

  global.timeNow = 0;

  global.window.performance.now = () => global.timeNow;

  global.Date = function() {
    this.toString = () => global.timeNow.toString();
    this.valueOf = () => global.timeNow;
  };

  global.Date.now = () => global.timeNow;

  const Matter = prepareMatter(options);
  mock('matter-js', Matter);
  global.Matter = Matter;

  return {
    Matter,
    logs,
    frameCallbacks
  };
};

const resetEnvironment = () => {
  global.console = consoleOriginal;
  global.Date = DateOriginal;
  global.window = undefined;
  global.document = undefined;
  global.Matter = undefined;
  mock.stopAll();
};

const captureExtrinsics = ({ world }, Matter) => ({
  bodies: Matter.Composite.allBodies(world).reduce((bodies, body) => {
      bodies[body.id] = {
        position: { x: body.position.x, y: body.position.y },
        vertices: body.vertices.map(vertex => ({ x: vertex.x, y: vertex.y }))
      };

      return bodies;
  }, {})
});

const captureIntrinsics = ({ world, timing }, Matter) => serialize({
  engine: {
    timing: {
      timeScale: timing.timeScale,
      timestamp: timing.timestamp
    }
  },
  bodies: Matter.Composite.allBodies(world).reduce((bodies, body) => {
      bodies[body.id] = body;
      return bodies;
  }, {}),
  constraints: Matter.Composite.allConstraints(world).reduce((constraints, constraint) => {
      constraints[constraint.id] = constraint;
      return constraints;
  }, {}),
  composites: Matter.Composite.allComposites(world).reduce((composites, composite) => {
      composites[composite.id] = {
          bodies: Matter.Composite.allBodies(composite).map(body => body.id), 
          constraints: Matter.Composite.allConstraints(composite).map(constraint => constraint.id), 
          composites: Matter.Composite.allComposites(composite).map(composite => composite.id)
      };
      return composites;
  }, {})
}, (key) => !Number.isInteger(parseInt(key)) && !intrinsicProperties.includes(key));

const captureState = (engine, runner, render, excludeKeys=excludeStateProperties) => (
  serialize({ engine, runner, render }, (key) => excludeKeys.includes(key))
);

const intrinsicProperties = [
  // Composite
  'bodies', 'constraints', 'composites',

  // Common
  'id', 'label', 

  // Constraint
  'angularStiffness', 'bodyA', 'bodyB', 'damping', 'length', 'stiffness',

  // Body
  'area', 'collisionFilter', 'category', 'mask', 'group', 'density', 'friction', 
  'frictionAir', 'frictionStatic', 'inertia', 'inverseInertia', 'inverseMass', 
  'isSensor', 'isSleeping', 'isStatic', 'mass', 'parent', 'parts', 'restitution', 
  'sleepThreshold', 'slop', 'timeScale',

  // Composite
  'bodies', 'constraints', 'composites'
];

const extrinsicProperties = [
  'axes',
  'vertices',
  'bounds',
  'angle',
  'anglePrev',
  'angularVelocity',
  'angularSpeed',
  'speed',
  'velocity',
  'position',
  'positionPrev',
  'motion',
  'sleepCounter',
  'positionImpulse'
];

const excludeStateProperties = [
  'cache',
  'grid',
  'context',
  'broadphase',
  'metrics',
  'controller',
  'detector',
  'pairs',
  'lastElapsed',
  'deltaHistory',
  'elapsedHistory',
  'engineDeltaHistory',
  'engineElapsedHistory',
  'timestampElapsedHistory',
].concat(extrinsicProperties);

const collisionId = (collision) => 
  Math.min(collision.bodyA.id, collision.bodyB.id) + Math.max(collision.bodyA.id, collision.bodyB.id) * 10000;

const collisionCompareId = (collisionA, collisionB) => collisionId(collisionA) - collisionId(collisionB);

const sortById = (objs) => objs.sort((objA, objB) => objA.id - objB.id);

module.exports = { runExample };
