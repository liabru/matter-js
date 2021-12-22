/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const mock = require('mock-require');
const { requireUncached, serialize } = require('./TestTools');
const consoleOriginal = global.console;

const runExample = options => {
  const { 
    Matter,
    logs,
    frameCallbacks
  } = prepareEnvironment(options);

  const Examples = requireUncached('../examples/index');
  const example = Examples[options.name]();

  const engine = example.engine;
  const runner = example.runner;
  const render = example.render;
  
  let totalMemory = 0;
  let totalDuration = 0;
  let overlapTotal = 0;
  let overlapCount = 0;
  let i;

  if (global.gc) {
    global.gc();
  }

  try {
    for (i = 0; i < options.updates; i += 1) {
      const time = i * runner.delta;
      const callbackCount = frameCallbacks.length;

      for (let p = 0; p < callbackCount; p += 1) {
        totalMemory += process.memoryUsage().heapUsed;
        const callback = frameCallbacks.shift();
        const startTime = process.hrtime();

        callback(time);

        const duration = process.hrtime(startTime);
        totalMemory += process.memoryUsage().heapUsed;
        totalDuration += duration[0] * 1e9 + duration[1];
      }

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
      logs: logs,
      extrinsic: captureExtrinsics(engine, Matter),
      intrinsic: captureIntrinsics(engine, Matter),
      state: captureState(engine, runner, render)
    };

  } catch (err) {
    err.message = `On example '${options.name}' update ${i}:\n\n  ${err.message}`;
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
  global.window = undefined;
  global.document = undefined;
  global.Matter = undefined;
  mock.stopAll();
};

const captureExtrinsics = ({ world }, Matter) => ({
  bodies: Matter.Composite.allBodies(world).reduce((bodies, body) => {
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
  constraints: Matter.Composite.allConstraints(world).reduce((constraints, constraint) => {
      let positionA;
      let positionB;

      try {
        positionA = Matter.Constraint.pointAWorld(constraint);
      } catch (err) { 
        positionA = { x: 0, y: 0 };
      }

      try {
        positionB = Matter.Constraint.pointBWorld(constraint);
      } catch (err) {
        positionB = { x: 0, y: 0 };
      }

      constraints[constraint.id] = [
          positionA.x,
          positionA.y,
          positionB.x,
          positionB.y
      ];

      return constraints;
  }, {})
});

const captureIntrinsics = ({ world }, Matter) => serialize({
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
