/**
* Pre-release beta version.
*
* The `Matter.Runner` module is a lightweight, optional utility which provides a game loop.
* It is intended for development and debugging purposes inside a browser environment.
* It will continuously update a `Matter.Engine` with a given fixed timestep whilst synchronising updates with the browser frame rate.
* This runner favours a smoother user experience over perfect time keeping.
* To directly step the engine as part of your own alternative game loop implementation, see `Engine.update`.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Runner
*/

var Runner = {};

module.exports = Runner;

var Events = require('./Events');
var Engine = require('./Engine');
var Common = require('./Common');

(function() {

    Runner._maxFrameDelta = 1000 / 5;
    Runner._frameDeltaFallback = 1000 / 60;
    Runner._timeBufferMargin = 1.5;
    Runner._elapsedNextEstimate = 1;
    Runner._smoothingLowerBound = 0.1;
    Runner._smoothingUpperBound = 0.9;

    /**
     * Creates a new Runner.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {} options
     */
    Runner.create = function(options) {
        var defaults = {
            delta: 1000 / 60,
            frameDelta: null,
            frameDeltaSmoothing: true,
            frameDeltaSnapping: true,
            frameDeltaHistory: [],
            frameDeltaHistorySize: 100,
            frameRequestId: null,
            timeBuffer: 0,
            timeLastTick: null,
            maxUpdates: null,
            maxFrameTime: 1000 / 30,
            lastUpdatesDeferred: 0,
            enabled: true
        };

        var runner = Common.extend(defaults, options);

        // for temporary back compatibility only
        runner.fps = 0;

        return runner;
    };

    /**
     * Continuously updates a `Matter.Engine` on every browser frame whilst synchronising updates with the browser frame rate.
     * It is intended for development and debugging purposes inside a browser environment.
     * This runner favours a smoother user experience over perfect time keeping.
     * The number of updates per frame is kept within performance budgets specified by `runner.maxFrameTime` and `runner.maxUpdates`.
     * When device performance is too limited the simulation may appear to slow down compared to real time.
     * As an alternative see `Engine.update` to directly step the engine in your own game loop implementation.
     * @method run
     * @param {runner} runner
     * @param {engine} [engine]
     * @return {runner} runner
     */
    Runner.run = function(runner, engine) {
        // initial time buffer for the first frame
        runner.timeBuffer = Runner._frameDeltaFallback;

        (function onFrame(time){
            runner.frameRequestId = Runner._onNextFrame(runner, onFrame);

            if (time && runner.enabled) {
                Runner.tick(runner, engine, time);
            }
        })();

        return runner;
    };

    /**
     * Used by the game loop inside `Runner.run`.
     * 
     * As an alternative see `Engine.update` to directly step the engine in your own game loop implementation.
     * @method tick
     * @param {runner} runner
     * @param {engine} engine
     * @param {number} time
     */
    Runner.tick = function(runner, engine, time) {
        var tickStartTime = Common.now(),
            engineDelta = runner.delta,
            updateCount = 0;

        // find frame delta time since last call
        var frameDelta = time - runner.timeLastTick;

        // fallback for unusable frame delta values (e.g. 0, NaN, on first frame or long pauses)
        if (!frameDelta || !runner.timeLastTick || frameDelta > Runner._maxFrameDelta) {
            // reuse last accepted frame delta else fallback
            frameDelta = runner.frameDelta || Runner._frameDeltaFallback;
        }

        if (runner.frameDeltaSmoothing) {
            // record frame delta over a number of frames
            runner.frameDeltaHistory.push(frameDelta);
            runner.frameDeltaHistory = runner.frameDeltaHistory.slice(-runner.frameDeltaHistorySize);

            // sort frame delta history
            var deltaHistorySorted = runner.frameDeltaHistory.slice(0).sort();

            // sample a central window to limit outliers
            var deltaHistoryWindow = runner.frameDeltaHistory.slice(
                deltaHistorySorted.length * Runner._smoothingLowerBound, 
                deltaHistorySorted.length * Runner._smoothingUpperBound
            );

            // take the mean of the central window
            var frameDeltaSmoothed = _mean(deltaHistoryWindow);
            frameDelta = frameDeltaSmoothed || frameDelta;
        }

        if (runner.frameDeltaSnapping) {
            // snap frame delta to the nearest 1 Hz
            frameDelta = 1000 / Math.round(1000 / frameDelta);
        }

        // update runner values for next call
        runner.frameDelta = frameDelta;
        runner.timeLastTick = time;

        // accumulate elapsed time
        runner.timeBuffer += runner.frameDelta;

        // limit time buffer size to a single frame of updates
        runner.timeBuffer = Common.clamp(
            runner.timeBuffer, 0, runner.frameDelta + engineDelta * Runner._timeBufferMargin
        );

        // reset count of over budget updates
        runner.lastUpdatesDeferred = 0;

        // get max updates per frame
        var maxUpdates = runner.maxUpdates || Math.ceil(runner.maxFrameTime / engineDelta);

        // create event object
        var event = {
            timestamp: engine.timing.timestamp
        };

        // tick events before update
        Events.trigger(runner, 'beforeTick', event);
        Events.trigger(runner, 'tick', event);

        var updateStartTime = Common.now();

        // simulate time elapsed between calls
        while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
            // update the engine
            Events.trigger(runner, 'beforeUpdate', event);
            Engine.update(engine, engineDelta);
            Events.trigger(runner, 'afterUpdate', event);

            // consume time simulated from buffer
            runner.timeBuffer -= engineDelta;
            updateCount += 1;

            // find elapsed time during this tick
            var elapsedTimeTotal = Common.now() - tickStartTime,
                elapsedTimeUpdates = Common.now() - updateStartTime,
                elapsedNextEstimate = elapsedTimeTotal + Runner._elapsedNextEstimate * elapsedTimeUpdates / updateCount;

            // defer updates if over performance budgets for this frame
            if (updateCount >= maxUpdates || elapsedNextEstimate > runner.maxFrameTime) {
                runner.lastUpdatesDeferred = Math.round(Math.max(0, (runner.timeBuffer / engineDelta) - Runner._timeBufferMargin));
                break;
            }
        }

        // track timing metrics
        engine.timing.lastUpdatesPerFrame = updateCount;

        // tick events after update
        Events.trigger(runner, 'afterTick', event);

        // show useful warnings if needed
        if (runner.frameDeltaHistory.length >= 100) {
            if (runner.lastUpdatesDeferred && Math.round(runner.frameDelta / engineDelta) > maxUpdates) {
                Common.warnOnce('Matter.Runner: runner reached runner.maxUpdates, see docs.');
            } else if (runner.lastUpdatesDeferred) {
                Common.warnOnce('Matter.Runner: runner reached runner.maxFrameTime, see docs.');
            }

            if (typeof runner.isFixed !== 'undefined') {
                Common.warnOnce('Matter.Runner: runner.isFixed is now redundant, see docs.');
            }

            if (runner.deltaMin || runner.deltaMax) {
                Common.warnOnce('Matter.Runner: runner.deltaMin and runner.deltaMax were removed, see docs.');
            }

            if (runner.fps !== 0) {
                Common.warnOnce('Matter.Runner: runner.fps was replaced by runner.delta, see docs.');
            }
        }
    };

    /**
     * Ends execution of `Runner.run` on the given `runner`, by canceling the frame loop.
     * 
     * Alternatively to temporarily pause the runner, see `runner.enabled`.
     * @method stop
     * @param {runner} runner
     */
    Runner.stop = function(runner) {
        Runner._cancelNextFrame(runner);
    };

    /**
     * Schedules `callback` on this `runner` for the next animation frame.
     * @private
     * @method _onNextFrame
     * @param {runner} runner
     * @param {function} callback
     * @return {number} frameRequestId
     */
    Runner._onNextFrame = function(runner, callback) {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            runner.frameRequestId = window.requestAnimationFrame(callback);
        } else {
            throw new Error('Matter.Runner: missing required global window.requestAnimationFrame.');
        }

        return runner.frameRequestId;
    };

    /**
     * Cancels the last callback scheduled on this `runner` by `Runner._onNextFrame`.
     * @private
     * @method _cancelNextFrame
     * @param {runner} runner
     */
    Runner._cancelNextFrame = function(runner) {
        if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
            window.cancelAnimationFrame(runner.frameRequestId);
        } else {
            throw new Error('Matter.Runner: missing required global window.cancelAnimationFrame.');
        }
    };

    /**
     * Returns the mean of the given numbers.
     * @method _mean
     * @private
     * @param {Number[]} values
     * @return {Number} the mean of given values.
     */
    var _mean = function(values) {
        var result = 0,
            valuesLength = values.length;

        for (var i = 0; i < valuesLength; i += 1) {
            result += values[i];
        }

        return (result / valuesLength) || 0;
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired once at the start of the browser frame, before any engine updates.
    *
    * @event beforeTick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired once at the start of the browser frame, after `beforeTick`.
    *
    * @event tick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired once at the end of the browser frame, after `beforeTick`, `tick` and after any engine updates.
    *
    * @event afterTick
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired before each and every update in this browser frame (if any). 
    * There may be multiple calls per browser frame (or none), depending on framerate and engine delta.
    *
    * @event beforeUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after each and every update in this browser frame (if any). 
    * There may be multiple calls per browser frame (or none), depending on framerate and engine delta.
    *
    * @event afterUpdate
    * @param {} event An event object
    * @param {number} event.timestamp The engine.timing.timestamp of the event
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /*
    *
    *  Properties Documentation
    *
    */

    /**
     * The fixed timestep size used for `Engine.update` calls in milliseconds.
     * 
     * This `delta` value is recommended to be `1000 / 60` ms or smaller (i.e. equivalent to at least 60hz).
     * 
     * Smaller `delta` values provide higher quality results at the cost of performance.
     * 
     * You should avoid changing `delta` during running, otherwise quality may be affected. 
     * 
     * For smoothest results choose a `delta` using an integer multiple of display FPS, i.e. `1000 / (n * fps)` as this helps distribute an equal number of updates over each display frame.
     * 
     * For example with a 60 Hz `delta` i.e. `1000 / 60` the runner will on average perform one update per frame on displays running 60 FPS, or one update every two frames on displays running 120 FPS, etc.
     * 
     * Where as e.g. using a 240 Hz `delta` i.e. `1000 / 240` the runner will on average perform four updates per frame on displays running 60 FPS, or two updates per frame on displays running 120 FPS, etc.
     * 
     * Therefore note that `Runner.run` can call multiple engine updates to simulate the time elapsed between frames, but the number of actual updates in any particular frame may be restricted by the runner's performance budgets.
     * 
     * These performance budgets are specified by `runner.maxFrameTime` and `runner.maxUpdates`. See those properties for details.
     * 
     * @property delta
     * @type number
     * @default 1000 / 60
     */

    /**
     * A flag that can be toggled to enable or disable tick calls on this runner, therefore pausing engine updates while the runner loop remains running.
     *
     * @property enabled
     * @type boolean
     * @default true
     */

    /**
     * The accumulated time elapsed that has yet to be simulated in milliseconds.
     * This value is clamped within some limits (see `Runner.tick` code).
     *
     * @private
     * @property timeBuffer
     * @type number
     * @default 0
     */

    /**
     * The measured time elapsed between the last two browser frames measured in milliseconds.
     * You may use this to estimate the browser FPS (for the current frame) whilst running as `1000 / runner.frameDelta`.
     *
     * @readonly
     * @property frameDelta
     * @type number
     */

    /**
     * Applies averaging to smooth frame rate measurements and therefore stabilise play rate.
     *
     * @property frameDeltaSmoothing
     * @type boolean
     * @default true
     */

    /**
     * Rounds measured frame delta to the nearest 1 Hz.
     * Your choice of `runner.delta` should be rounded to the nearest 1 Hz for best results.
     * This option helps smooth frame rate measurements and unify display hardware differences e.g. 59.94Hz vs 60Hz refresh rates.
     *
     * @property frameDeltaSnapping
     * @type boolean
     * @default true
     */

    /**
     * A performance budget that limits execution time allowed for this runner per display frame in milliseconds.
     * 
     * To calculate the display FPS at which this throttle is applied use `1000 / maxFrameTime`.
     * 
     * This performance budget is intended to help maintain browser interactivity and help improve framerate recovery during temporary high CPU usage.
     * 
     * This only covers the measured time elapsed executing the functions called in the scope of the runner tick, including `Engine.update` etc. and its related user event callbacks.
     * 
     * You may wish to reduce this budget to allow for any significant additional processing you perform on the same thread outside the scope of this runner, e.g. rendering time.
     * 
     * See also `runner.maxUpdates`.
     *
     * @property maxFrameTime
     * @type number
     * @default 1000 / 30
     */

    /**
     * An optional hard limit for maximum engine updates allowed per frame tick in addition to `runner.maxFrameTime`.
     * 
     * Unless you set a value it is automatically chosen based on `runner.delta` and `runner.maxFrameTime`.
     * 
     * See also `runner.maxFrameTime`.
     * 
     * @property maxUpdates
     * @type number
     * @default null
     */

    /**
     * The timestamp of the last call to `Runner.tick`, used to measure `frameDelta`.
     *
     * @private
     * @property timeLastTick
     * @type number
     * @default 0
     */

    /**
     * The id of the last call to `Runner._onNextFrame`.
     *
     * @private
     * @property frameRequestId
     * @type number
     * @default null
     */

})();
