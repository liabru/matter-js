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

    Runner._timeBufferMargin = 1.5;
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
            frameDelta: 0,
            frameDeltaSmoothing: true,
            frameDeltaSnapping: true,
            frameDeltaHistory: [],
            frameDeltaHistorySize: 100,
            frameRequestId: null,
            timeBuffer: 0,
            timeLastTick: null,
            maxUpdates: null,
            maxFrameTime: 1000 / 50,
            maxFrameDelta: 1000 / 10,
            lastUpdatesDeferred: 0,
            enabled: true
        };

        var runner = Common.extend(defaults, options);

        if (runner.maxUpdates === null) {
            runner.maxUpdates = Math.ceil(runner.maxFrameTime / runner.delta);
        }

        // for temporary back compatibility only
        runner.fps = 0;

        return runner;
    };

    /**
     * Continuously updates a `Matter.Engine` on every browser frame whilst synchronising updates with the browser frame rate.
     * It is intended for development and debugging purposes inside a browser environment.
     * This runner favours a smoother user experience over perfect time keeping.
     * The number of updates per frame is kept within limits specified by `runner.maxFrameTime`, `runner.maxUpdates` and `runner.maxFrameDelta`.
     * When device performance is too limited the simulation may appear to slow down compared to real time.
     * As an alternative, to directly step the engine in your own game loop implementation, see `Engine.update`.
     * @method run
     * @param {runner} runner
     * @param {engine} [engine]
     * @return {runner} runner
     */
    Runner.run = function(runner, engine) {
        // initial time buffer for the first frame
        runner.timeBuffer = runner.delta * Runner._timeBufferMargin;

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
     * As an alternative to directly step the engine in your own game loop implementation, see `Engine.update`.
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

        // fallback for unexpected frame delta values (e.g. 0, NaN or from long pauses)
        if (!frameDelta || frameDelta > runner.maxFrameDelta) {
            // reuse last accepted frame delta or fallback to one update
            frameDelta = runner.frameDelta || engineDelta;
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

        // get max updates per second
        var maxUpdates = runner.maxUpdates;

        // create event object
        var event = {
            timestamp: engine.timing.timestamp
        };

        // tick events before update
        Events.trigger(runner, 'beforeTick', event);
        Events.trigger(runner, 'tick', event);

        // simulate time elapsed between calls
        while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
            var updateStartTime = Common.now();

            // update the engine
            Events.trigger(runner, 'beforeUpdate', event);
            Engine.update(engine, engineDelta);
            Events.trigger(runner, 'afterUpdate', event);

            // consume time simulated from buffer
            runner.timeBuffer -= engineDelta;
            updateCount += 1;

            // find elapsed time during this tick
            var elapsedTimeTotal = Common.now() - tickStartTime,
                elapsedTimeUpdate = Common.now() - updateStartTime;

            // defer updates if over performance budgets for this frame
            if (updateCount >= maxUpdates || elapsedTimeTotal + elapsedTimeUpdate > runner.maxFrameTime) {
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
     * To temporarily pause the runner, see `runner.enabled`.
     * @method stop
     * @param {runner} runner
     */
    Runner.stop = function(runner) {
        Runner._cancelNextFrame(runner);
    };

    /**
     * Schedules a `callback` on this `runner` for the next animation frame.
     * @private
     * @method _onNextFrame
     * @param {runner} runner
     * @param {function} callback
     * @return {number} frameRequestId
     */
    Runner._onNextFrame = function(runner, callback) {
        if (typeof window !== 'undefined') {
            runner.frameRequestId = window.requestAnimationFrame(callback);
        } else {
            Common.warnOnce('Matter.Runner: missing required global window.requestAnimationFrame.');
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
        if (typeof window !== 'undefined') {
            window.cancelAnimationFrame(runner.frameRequestId);
        } else {
            Common.warnOnce('Matter.Runner: missing required global window.cancelAnimationFrame.');
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
     * This `delta` value is recommended to be `16.666` ms or lower (equivalent to at least 60hz).
     * 
     * Lower `delta` values provide a higher quality results at the cost of performance.
     * 
     * This value should be held fixed during running, otherwise quality may be affected. 
     * 
     * For smoothest results choose an evenly divisible factor of your target framerates, this helps provide an equal number of updates per frame.
     * 
     * Rounding to the nearest 1 Hz is recommended for smoother results (see `runner.frameDeltaSnapping`).
     * 
     * For example with a `delta` of `1000 / 60` the runner will on average perform one update per frame for displays at 60 FPS, or one update every two frames for displays at 120 FPS.
     * 
     * `Runner.run` will call multiple engine updates to simulate the time elapsed between frames, but the number of allowed calls may be limited by the runner's performance budgets.
     * 
     * These performance budgets are specified by `runner.maxFrameTime`, `runner.maxUpdates`, `runner.maxFrameDelta`. See those properties for details.
     *
     * @property delta
     * @type number
     * @default 1000 / 60
     */

    /**
     * A flag that can be toggled to enable or disable tick calls on this runner, therefore pausing engine updates while the loop remains running.
     *
     * @property enabled
     * @type boolean
     * @default true
     */

    /**
     * The accumulated time elapsed that has yet to be simulated, in milliseconds.
     * This value is clamped within some limits (see `Runner.tick` code).
     *
     * @private
     * @property timeBuffer
     * @type number
     * @default 0
     */

    /**
     * The measured time elapsed between the last two browser frames in milliseconds.
     * This value is clamped inside `runner.maxFrameDelta`.
     * 
     * You may use this to estimate the browser FPS (for the current instant) whilst running use `1000 / runner.frameDelta`.
     *
     * @readonly
     * @property frameDelta
     * @type number
     */

    /**
     * This option applies averaging to the frame delta to smooth noisy frame rates.
     *
     * @property frameDeltaSmoothing
     * @type boolean
     * @default true
     */

    /**
     * Rounds frame delta to the nearest 1 Hz.
     * It follows that your choice of `runner.delta` should be rounded to the nearest 1 Hz for best results.
     * This option helps smooth noisy refresh rates and simplify hardware differences e.g. 59.94Hz vs 60Hz display refresh rates.
     *
     * @property frameDeltaSnapping
     * @type boolean
     * @default true
     */

    /**
     * Clamps the maximum `runner.frameDelta` in milliseconds.
     * This is to avoid simulating periods where the browser thread is paused e.g. whilst minimised.
     *
     * @property maxFrameDelta
     * @type number
     * @default 500
     */

    /**
     * The runner will attempt to limit engine update rate should the browser frame rate drop below a set level (50 FPS using the default `runner.maxFrameTime` value `1000 / 50` milliseconds).
     * 
     * This budget is intended to help maintain browser interactivity and help improve framerate recovery during temporary high CPU spikes.
     * 
     * It will only cover time elapsed whilst executing the functions called in the scope of this runner, including `Engine.update` etc. and its related event callbacks.
     * 
     * For any significant additional processing you perform on the same thread but outside the scope of this runner e.g. rendering time, you may wish to reduce this budget.
     * 
     * See also `runner.maxUpdates`.
     *
     * @property maxFrameTime
     * @type number
     * @default 1000 / 50
     */

    /**
     * A hard limit for maximum engine updates allowed per frame.
     * 
     * If not provided, it is automatically set by `Runner.create` based on `runner.delta` and `runner.maxFrameTime`.
     * If you change `runner.delta` or `runner.maxFrameTime`, you may need to manually update this value afterwards.
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
