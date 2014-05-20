/**
* The `Matter.Engine` module contains methods for creating and manipulating engines.
* An engine is a controller that manages updating and rendering the simulation of the world.
*
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Engine
*/

var Engine = {};

(function() {

    var _fps = 60,
        _deltaSampleSize = _fps,
        _delta = 1000 / _fps;
        
    var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, _delta); };
   
    /**
     * Creates a new engine. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properites section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {HTMLElement} element
     * @param {object} [options]
     * @return {engine} engine
     */
    Engine.create = function(element, options) {

        // options may be passed as the first (and only) argument
        options = Common.isElement(element) ? options : element;
        element = Common.isElement(element) ? element : null;

        var defaults = {
            enabled: true,
            positionIterations: 6,
            velocityIterations: 4,
            constraintIterations: 2,
            enableSleeping: false,
            timeScale: 1,
            input: {},
            events: [],
            timing: {
                fps: _fps,
                timestamp: 0,
                delta: _delta,
                correction: 1,
                deltaMin: 1000 / _fps,
                deltaMax: 1000 / (_fps * 0.5),
                timeScale: 1,
                isFixed: false
            },
            render: {
                element: element,
                controller: Render
            }
        };
        
        var engine = Common.extend(defaults, options);

        engine.render = engine.render.controller.create(engine.render);
        engine.world = World.create(engine.world);
        engine.pairs = Pairs.create();
        engine.metrics = engine.metrics || Metrics.create();
        engine.input.mouse = engine.input.mouse || Mouse.create(engine.render.canvas);

        engine.broadphase = engine.broadphase || {
            current: 'grid',
            grid: {
                controller: Grid,
                instance: Grid.create(),
                detector: Detector.collisions
            },
            bruteForce: {
                detector: Detector.bruteForce
            }
        };

        return engine;
    };

    /**
     * An optional utility function that provides a game loop, that handles updating the engine for you.
     * Calls `Engine.update` and `Engine.render` on the `requestAnimationFrame` event automatically.
     * Handles time correction and non-fixed dynamic timing (if enabled). 
     * Triggers `beforeTick`, `tick` and `afterTick` events.
     * @method run
     * @param {engine} engine
     */
    Engine.run = function(engine) {
        var counterTimestamp = 0,
            frameCounter = 0,
            deltaHistory = [],
            timePrev,
            timeScalePrev = 1;

        (function render(time){
            _requestAnimationFrame(render);

            if (!engine.enabled)
                return;

            var timing = engine.timing,
                delta,
                correction;

            // create an event object
            var event = {
                timestamp: time
            };

            Events.trigger(engine, 'beforeTick', event);

            if (timing.isFixed) {
                // fixed timestep
                delta = timing.delta;
            } else {
                // dynamic timestep based on wall clock between calls
                delta = (time - timePrev) || timing.delta;
                timePrev = time;

                // optimistically filter delta over a few frames, to improve stability
                deltaHistory.push(delta);
                deltaHistory = deltaHistory.slice(-_deltaSampleSize);
                delta = Math.min.apply(null, deltaHistory);
                
                // limit delta
                delta = delta < timing.deltaMin ? timing.deltaMin : delta;
                delta = delta > timing.deltaMax ? timing.deltaMax : delta;

                // time correction for delta
                correction = delta / timing.delta;

                // update engine timing object
                timing.delta = delta;
            }

            // time correction for time scaling
            if (timeScalePrev !== 0)
                correction *= timing.timeScale / timeScalePrev;

            if (timing.timeScale === 0)
                correction = 0;

            timeScalePrev = timing.timeScale;
            
            // fps counter
            frameCounter += 1;
            if (time - counterTimestamp >= 1000) {
                timing.fps = frameCounter * ((time - counterTimestamp) / 1000);
                counterTimestamp = time;
                frameCounter = 0;
            }

            Events.trigger(engine, 'tick', event);

            // if world has been modified, clear the render scene graph
            if (engine.world.isModified)
                engine.render.controller.clear(engine.render);

            // update
            Engine.update(engine, delta, correction);

            // trigger events that may have occured during the step
            _triggerCollisionEvents(engine);
            _triggerMouseEvents(engine);

            // render
            Engine.render(engine);

            Events.trigger(engine, 'afterTick', event);
        })();
    };

    /**
     * Moves the simulation forward in time by `delta` ms. Triggers `beforeUpdate` and `afterUpdate` events.
     * @method update
     * @param {engine} engine
     * @param {number} delta
     * @param {number} [correction]
     */
    Engine.update = function(engine, delta, correction) {
        correction = (typeof correction !== 'undefined') ? correction : 1;

        var world = engine.world,
            timing = engine.timing,
            broadphase = engine.broadphase[engine.broadphase.current],
            broadphasePairs = [],
            i;

        // increment timestamp
        timing.timestamp += delta * timing.timeScale;
        timing.correction = correction;

        // create an event object
        var event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(engine, 'beforeUpdate', event);

        // get lists of all bodies and constraints, no matter what composites they are in
        var allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world);

        // reset metrics logging
        Metrics.reset(engine.metrics);

        // if sleeping enabled, call the sleeping controller
        if (engine.enableSleeping)
            Sleeping.update(allBodies);

        // applies gravity to all bodies
        Body.applyGravityAll(allBodies, world.gravity);

        // update all body position and rotation by integration
        Body.updateAll(allBodies, delta, timing.timeScale, correction, world.bounds);

        // update all constraints
        for (i = 0; i < engine.constraintIterations; i++) {
            Constraint.solveAll(allConstraints, timing.timeScale);
        }
        Constraint.postSolveAll(allBodies);

        // broadphase pass: find potential collision pairs
        if (broadphase.controller) {

            // if world is dirty, we must flush the whole grid
            if (world.isModified)
                broadphase.controller.clear(broadphase.instance);

            // update the grid buckets based on current bodies
            broadphase.controller.update(broadphase.instance, allBodies, engine, world.isModified);
            broadphasePairs = broadphase.instance.pairsList;
        } else {

            // if no broadphase set, we just pass all bodies
            broadphasePairs = allBodies;
        }

        // narrowphase pass: find actual collisions, then create or update collision pairs
        var collisions = broadphase.detector(broadphasePairs, engine);

        // update collision pairs
        var pairs = engine.pairs,
            timestamp = timing.timestamp;
        Pairs.update(pairs, collisions, timestamp);
        Pairs.removeOld(pairs, timestamp);

        // wake up bodies involved in collisions
        if (engine.enableSleeping)
            Sleeping.afterCollisions(pairs.list);

        // iteratively resolve velocity between collisions
        Resolver.preSolveVelocity(pairs.list);
        for (i = 0; i < engine.velocityIterations; i++) {
            Resolver.solveVelocity(pairs.list, timing.timeScale);
        }
        
        // iteratively resolve position between collisions
        for (i = 0; i < engine.positionIterations; i++) {
            Resolver.solvePosition(pairs.list, timing.timeScale);
        }
        Resolver.postSolvePosition(allBodies);

        // update metrics log
        Metrics.update(engine.metrics, engine);

        // clear force buffers
        Body.resetForcesAll(allBodies);

        // clear all composite modified flags
        if (world.isModified)
            Composite.setModified(world, false, false, true);

        Events.trigger(engine, 'afterUpdate', event);

        return engine;
    };

    /**
     * Renders the world by calling its defined renderer `engine.render.controller`. Triggers `beforeRender` and `afterRender` events.
     * @method render
     * @param {engine} engineA
     * @param {engine} engineB
     */
    Engine.render = function(engine) {
        // create an event object
        var event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(engine, 'beforeRender', event);
        engine.render.controller.world(engine);
        Events.trigger(engine, 'afterRender', event);
    };
    
    /**
     * Merges two engines by keeping the configuration of `engineA` but replacing the world with the one from `engineB`.
     * @method merge
     * @param {engine} engineA
     * @param {engine} engineB
     */
    Engine.merge = function(engineA, engineB) {
        Common.extend(engineA, engineB);
        
        if (engineB.world) {
            engineA.world = engineB.world;

            Engine.clear(engineA);

            var bodies = Composite.allBodies(engineA.world);

            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                Sleeping.set(body, false);
                body.id = Common.nextId();
            }
        }
    };

    /**
     * Clears the engine including the world, pairs and broadphase.
     * @method clear
     * @param {engine} engine
     */
    Engine.clear = function(engine) {
        var world = engine.world;
        
        Pairs.clear(engine.pairs);

        var broadphase = engine.broadphase[engine.broadphase.current];
        if (broadphase.controller) {
            var bodies = Composite.allBodies(world);
            broadphase.controller.clear(broadphase.instance);
            broadphase.controller.update(broadphase.instance, bodies, engine, true);
        }
    };

    /**
     * Triggers mouse events
     * @method _triggerMouseEvents
     * @private
     * @param {engine} engine
     */
    var _triggerMouseEvents = function(engine) {
        var mouse = engine.input.mouse,
            mouseEvents = mouse.sourceEvents;

        if (mouseEvents.mousemove) {
            Events.trigger(engine, 'mousemove', {
                mouse: mouse
            });
        }

        if (mouseEvents.mousedown) {
            Events.trigger(engine, 'mousedown', {
                mouse: mouse
            });
        }

        if (mouseEvents.mouseup) {
            Events.trigger(engine, 'mouseup', {
                mouse: mouse
            });
        }

        // reset the mouse state ready for the next step
        Mouse.clearSourceEvents(mouse);
    };

    /**
     * Triggers collision events
     * @method _triggerMouseEvents
     * @private
     * @param {engine} engine
     */
    var _triggerCollisionEvents = function(engine) {
        var pairs = engine.pairs;

        if (pairs.collisionStart.length > 0) {
            Events.trigger(engine, 'collisionStart', {
                pairs: pairs.collisionStart
            });
        }

        if (pairs.collisionActive.length > 0) {
            Events.trigger(engine, 'collisionActive', {
                pairs: pairs.collisionActive
            });
        }

        if (pairs.collisionEnd.length > 0) {
            Events.trigger(engine, 'collisionEnd', {
                pairs: pairs.collisionEnd
            });
        }
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired at the start of a tick, before any updates to the engine or timing
    *
    * @event beforeTick
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine timing updated, but just before engine state updated
    *
    * @event tick
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired just before an update
    *
    * @event beforeUpdate
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update and all collision events
    *
    * @event afterUpdate
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired just before rendering
    *
    * @event beforeRender
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after rendering
    *
    * @event afterRender
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update and after rendering
    *
    * @event afterTick
    * @param {} event An event object
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the mouse has moved (or a touch moves) during the last step
    *
    * @event mousemove
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the mouse is down (or a touch has started) during the last step
    *
    * @event mousedown
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired when the mouse is up (or a touch has ended) during the last step
    *
    * @event mouseup
    * @param {} event An event object
    * @param {mouse} event.mouse The engine's mouse instance
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that have started to collide in the current tick (if any)
    *
    * @event collisionStart
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that are colliding in the current tick (if any)
    *
    * @event collisionActive
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after engine update, provides a list of all pairs that have ended collision in the current tick (if any)
    *
    * @event collisionEnd
    * @param {} event An event object
    * @param {} event.pairs List of affected pairs
    * @param {DOMHighResTimeStamp} event.timestamp The timestamp of the current tick
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * A flag that specifies whether the engine is running or not.
     *
     * @property enabled
     * @type boolean
     * @default true
     */

    /**
     * An integer `Number` that specifies the number of position iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     *
     * @property positionIterations
     * @type number
     * @default 6
     */

    /**
     * An integer `Number` that specifies the number of velocity iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     *
     * @property velocityIterations
     * @type number
     * @default 4
     */

    /**
     * An integer `Number` that specifies the number of constraint iterations to perform each update.
     * The higher the value, the higher quality the simulation will be at the expense of performance.
     * The default value of `2` is usually very adequate.
     *
     * @property constraintIterations
     * @type number
     * @default 2
     */

    /**
     * A flag that specifies whether the engine should allow sleeping via the `Matter.Sleeping` module.
     * Sleeping can improve stability and performance, but often at the expense of accuracy.
     *
     * @property enableSleeping
     * @type boolean
     * @default false
     */

    /**
     * An `Object` containing properties regarding the timing systems of the engine. 
     *
     * @property timing
     * @type object
     */

    /**
     * A `Number` that specifies the global scaling factor of time for all bodies.
     * A value of `0` freezes the simulation.
     * A value of `0.1` gives a slow-motion effect.
     * A value of `1.2` gives a speed-up effect.
     *
     * @property timing.timeScale
     * @type number
     * @default 1
     */

    /**
     * A `Number` that specifies the current simulation-time in milliseconds starting from `0`. 
     * It is incremented on every `Engine.update` by the `timing.delta`. 
     *
     * @property timing.timestamp
     * @type number
     * @default 0
     */

    /**
     * A `Number` that specifies the time step between updates in milliseconds.
     * If `engine.timing.isFixed` is set to `true`, then `delta` is fixed.
     * If it is `false`, then `delta` can dynamically change to maintain the correct apparant simulation speed.
     *
     * @property timing.delta
     * @type number
     * @default 1000 / 60
     */

    /**
     * A `Number` that specifies the time correction factor to apply to the current timestep.
     * It is automatically handled when using `Engine.run`, but is also only optional even if you use your own game loop.
     * The value is defined as `delta / lastDelta`, i.e. the percentage change of `delta` between steps.
     * This value is always `1` (no correction) when frame rate is constant or `engine.timing.isFixed` is `true`.
     * If the framerate and hence `delta` are changing, then correction should be applied to the current update to account for the change.
     * See the paper on <a href="http://lonesock.net/article/verlet.html">Time Corrected Verlet</a> for more information.
     *
     * @property timing.correction
     * @type number
     * @default 1
     */

    /**
     * An instance of a `Render` controller. The default value is a `Matter.Render` instance created by `Engine.create`.
     * One may also develop a custom renderer module based on `Matter.Render` and pass an instance of it to `Engine.create` via `options.render`.
     *
     * A minimal custom renderer object must define at least three functions: `create`, `clear` and `world` (see `Matter.Render`).
     * It is also possible to instead pass the _module_ reference via `options.render.controller` and `Engine.create` will instantiate one for you.
     *
     * @property render
     * @type render
     * @default a Matter.Render instance
     */

    /**
     * A `World` composite object that will contain all simulated bodies and constraints.
     *
     * @property world
     * @type world
     * @default a Matter.World instance
     */

})();