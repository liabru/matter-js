/**
* The `Matter.Runner` module is an optional utility which provides a game loop, 
* that handles updating and rendering a `Matter.Engine` for you within a browser.
* Note that the method `Engine.run` is an alias for `Runner.run`.
*
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Runner
*/

var Runner = {};

(function() {

    if (typeof window === 'undefined') {
        // TODO: support Runner on non-browser environments.
        return;
    }

    var _fps = 60,
        _deltaSampleSize = _fps,
        _delta = 1000 / _fps;

    var _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                      || window.mozRequestAnimationFrame || window.msRequestAnimationFrame 
                                      || function(callback){ window.setTimeout(function() { callback(Common.now()); }, _delta); };
   
    var _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                      || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;

    /**
     * Provides a basic game loop that handles updating the engine for you.
     * Calls `Engine.update` and `Engine.render` on the `requestAnimationFrame` event automatically.
     * Handles time correction and non-fixed dynamic timing (if enabled). 
     * Triggers `beforeTick`, `tick` and `afterTick` events.
     * @method run
     * @param {engine} engine
     */
    Runner.run = function(engine) {
        var counterTimestamp = 0,
            frameCounter = 0,
            deltaHistory = [],
            timePrev,
            timeScalePrev = 1;

        (function render(time){
            var timing = engine.timing,
                delta,
                correction = 1;

            timing.frameRequestId = _requestAnimationFrame(render);

            if (!engine.enabled)
                return;

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
            if (engine.world.isModified 
                && engine.render
                && engine.render.controller
                && engine.render.controller.clear) {
                engine.render.controller.clear(engine.render);
            }

            // update
            Engine.update(engine, delta, correction);

            // render
            if (engine.render) {
                Engine.render(engine);
            }

            Events.trigger(engine, 'afterTick', event);
        })();
    };

    /**
     * Ends execution of `Runner.run` on the given `engine`, by canceling the animation frame request event loop.
     * If you wish to only temporarily pause the engine, see `engine.enabled` instead.
     * @method stop
     * @param {engine} engine
     */
    Runner.stop = function(engine) {
        _cancelAnimationFrame(engine.timing.frameRequestId);
    };

})();
