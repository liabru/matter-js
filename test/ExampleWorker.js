/* eslint-env es6 */
/* eslint no-global-assign: 0 */
"use strict";

const mock = require('mock-require');
const { requireUncached } = require('./TestTools');
const consoleOriginal = global.console;

const runExample = options => {
  const Matter = prepareMatter(options);
  const logs = prepareEnvironment(Matter);

  const Examples = requireUncached('../examples/index');
  const example = Examples[options.name]();

  const engine = example.engine;
  const runner = example.runner;
  
  runner.delta = 1000 / 60;
  runner.isFixed = true;
  
  let totalMemory = 0;
  let totalDuration = 0;
  let overlapTotal = 0;
  let overlapCount = 0;

  global.gc();

  for (let i = 0; i < options.updates; i += 1) {
      const startTime = process.hrtime();
      totalMemory += process.memoryUsage().heapUsed;

      Matter.Runner.tick(runner, engine, i * runner.delta);

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
    logs: logs,
    extrinsic: captureExtrinsics(engine, Matter),
    intrinsic: captureIntrinsics(engine, Matter),
  };
};

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

const captureIntrinsics = ({ world }, Matter) => formatIntrinsics({
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
});

const formatIntrinsics = (obj, depth=0) => {
  if (obj === Infinity) {
      return 'Infinity';
  } else if (typeof obj === 'number') {
      return limitPrecision(obj);
  } else if (Array.isArray(obj)) {
      return obj.map(item => formatIntrinsics(item, depth + 1));
  } else if (typeof obj !== 'object') {
      return obj;
  }

  const result = Object.entries(obj)
      .filter(([key]) => depth <= 1 || intrinsicProperties.includes(key))
      .reduce((cleaned, [key, val]) => {
          if (val && val.id && String(val.id) !== key) {
              val = val.id;
          }
          
          if (Array.isArray(val) && !['composites', 'constraints', 'bodies'].includes(key)) {
              val = `[${val.length}]`;
          }

          cleaned[key] = formatIntrinsics(val, depth + 1);
          return cleaned;
      }, {});

  return Object.keys(result).sort()
      .reduce((sorted, key) => (sorted[key] = result[key], sorted), {});
};

const intrinsicProperties = [
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

const collisionId = (collision) => 
  Math.min(collision.bodyA.id, collision.bodyB.id) + Math.max(collision.bodyA.id, collision.bodyB.id) * 10000;

const collisionCompareId = (collisionA, collisionB) => collisionId(collisionA) - collisionId(collisionB);

const sortById = (objs) => objs.sort((objA, objB) => objA.id - objB.id);

const limitPrecision = (val, precision=3) => parseFloat(val.toPrecision(precision));

module.exports = { runExample };