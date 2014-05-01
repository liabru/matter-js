/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Gui
*/

var Gui = {};

(function() {

    /**
     * Description
     * @method create
     * @param {engine} engine
     * @param {object} options
     * @return {gui} A container for a configured dat.gui
     */
    Gui.create = function(engine, options) {
        var _datGuiSupported = window.dat && window.localStorage;

        if (!_datGuiSupported) {
            console.log("Could not create GUI. Check dat.gui library is loaded first.");
            return;
        }

        var datGui = new dat.GUI(options);

        var gui = {
            engine: engine,
            datGui: datGui,
            amount: 1,
            size: 40,
            sides: 4,
            density: 0.001,
            restitution: 0,
            friction: 0.1,
            frictionAir: 0.01,
            offset: { x: 0, y: 0 },
            renderer: 'canvas'
        };
        
        if (Resurrect) {
            gui.serializer = new Resurrect({ prefix: '$', cleanup: true });
            gui.serializer.parse = gui.serializer.resurrect;
        }

        _initDatGui(gui);

        return gui;
    };
    
    /**
     * Description
     * @method update
     * @param {gui} gui
     * @param {datGui} datGui
     */
    Gui.update = function(gui, datGui) {
        var i;
        datGui = datGui || gui.datGui;
        
        for (i in datGui.__folders) {
            Gui.update(gui, datGui.__folders[i]);
        }
        
        for (i in datGui.__controllers) {
            var controller = datGui.__controllers[i];
            if (controller.updateDisplay)
                controller.updateDisplay();
        }
    };

    /**
     * Description
     * @method closeAll
     * @param {gui} gui
     */
    Gui.closeAll = function(gui) {
        var datGui = gui.datGui;
        
        for (var i in datGui.__folders) {
            datGui.__folders[i].close();
        }
    };

    /**
     * Saves world state to local storage
     * @method saveState
     * @param {object} serializer
     * @param {engine} engine
     * @param {string} key
     */
    Gui.saveState = function(serializer, engine, key) {
        if (localStorage && serializer)
            localStorage.setItem(key, Gui.serialise(serializer, engine.world));
    };

    /**
     * Loads world state from local storage
     * @method loadState
     * @param {object} serializer
     * @param {engine} engine
     * @param {string} key
     */
    Gui.loadState = function(serializer, engine, key) {
        var loadedWorld;

        if (localStorage && serializer)
            loadedWorld = serializer.parse(localStorage.getItem(key));

        if (loadedWorld)
            Engine.merge(engine, { world: loadedWorld });
    };

    /**
     * Serialises the object using the given serializer and a Matter-specific replacer
     * @method serialise
     * @param {object} serializer
     * @param {object} object
     * @param {number} indent
     * @return {string} The serialised object
     */
    Gui.serialise = function(serializer, object, indent) {
        indent = indent || 0;
        return serializer.stringify(object, function(key, value) {
            // skip non-required values
            if (key === 'path')
                return undefined;

            // limit precision of floats
            if (!/^#/.exec(key) && typeof value === 'number') {
                var fixed = parseFloat(value.toFixed(3));

                // do not limit if limiting will cause value to zero
                // TODO: this should ideally dynamically find the SF precision required
                if (fixed === 0 && value !== 0)
                    return value;

                return fixed;
            }

            return value;
        }, indent);
    };

    var _initDatGui = function(gui) {
        var engine = gui.engine,
            datGui = gui.datGui;

        var funcs = {
            addBody: function() { _addBody(gui); },
            clear: function() { _clear(gui); },
            save: function() { Gui.saveState(gui.serializer, engine, 'guiState'); Events.trigger(gui, 'save'); },
            load: function() { Gui.loadState(gui.serializer, engine, 'guiState'); Events.trigger(gui, 'load'); },
            inspect: function() { 
                if (!Inspector.instance)
                    gui.inspector = Inspector.create(gui.engine); 
            }
        };

        var metrics = datGui.addFolder('Metrics');
        metrics.add(engine.timing, 'fps').listen();

        if (engine.metrics.extended) {
            metrics.add(engine.timing, 'delta').listen();
            metrics.add(engine.timing, 'correction').listen();
            metrics.add(engine.metrics, 'bodies').listen();
            metrics.add(engine.metrics, 'collisions').listen();
            metrics.add(engine.metrics, 'pairs').listen();
            metrics.add(engine.metrics, 'broadEff').listen();
            metrics.add(engine.metrics, 'midEff').listen();
            metrics.add(engine.metrics, 'narrowEff').listen();
            metrics.add(engine.metrics, 'narrowReuse').listen();
            metrics.close();
        } else {
            metrics.open();
        }

        var controls = datGui.addFolder('Add Body');
        controls.add(gui, 'amount', 1, 5).step(1);
        controls.add(gui, 'size', 5, 150).step(1);
        controls.add(gui, 'sides', 1, 8).step(1);
        controls.add(gui, 'density', 0.0001, 0.01).step(0.001);
        controls.add(gui, 'friction', 0, 1).step(0.05);
        controls.add(gui, 'frictionAir', 0, gui.frictionAir * 10).step(gui.frictionAir / 10);
        controls.add(gui, 'restitution', 0, 1).step(0.1);
        controls.add(funcs, 'addBody');
        controls.open();

        var worldGui = datGui.addFolder('World');
        worldGui.add(funcs, 'inspect');
        worldGui.add(funcs, 'load');
        worldGui.add(funcs, 'save');
        worldGui.add(funcs, 'clear');
        worldGui.open();
        
        var gravity = worldGui.addFolder('Gravity');
        gravity.add(engine.world.gravity, 'x', -1, 1).step(0.01);
        gravity.add(engine.world.gravity, 'y', -1, 1).step(0.01);
        gravity.open();

        var physics = datGui.addFolder('Engine');
        physics.add(engine, 'enableSleeping');

        physics.add(engine.broadphase, 'current', ['grid', 'bruteForce'])
            .onFinishChange(function(value) {
                Composite.setModified(engine.world, true, false, false);
            });

        physics.add(engine.timing, 'timeScale', 0, 1.2).step(0.05).listen();
        physics.add(engine, 'velocityIterations', 1, 10).step(1);
        physics.add(engine, 'positionIterations', 1, 10).step(1);
        physics.add(engine, 'enabled');
        physics.open();

        var render = datGui.addFolder('Render');

        render.add(gui, 'renderer', ['canvas', 'webgl'])
            .onFinishChange(function(value) { _setRenderer(gui, value); });

        render.add(engine.render.options, 'wireframes');
        render.add(engine.render.options, 'showDebug');
        render.add(engine.render.options, 'showPositions');
        render.add(engine.render.options, 'showBroadphase');
        render.add(engine.render.options, 'showBounds');
        render.add(engine.render.options, 'showVelocity');
        render.add(engine.render.options, 'showCollisions');
        render.add(engine.render.options, 'showAxes');
        render.add(engine.render.options, 'showAngleIndicator');
        render.add(engine.render.options, 'showSleeping');
        render.add(engine.render.options, 'showIds');
        render.add(engine.render.options, 'showShadows');
        render.add(engine.render.options, 'enabled');
        render.open();
    };

    var _setRenderer = function(gui, rendererName) {
        var engine = gui.engine,
            controller;

        if (rendererName === 'canvas')
            controller = Render;

        if (rendererName === 'webgl')
            controller = RenderPixi;

        // remove old canvas
        engine.render.element.removeChild(engine.render.canvas);

        // create new renderer using the same options object
        var options = engine.render.options;

        engine.render = controller.create({
            element: engine.render.element,
            options: options
        });

        engine.render.options = options;

        // bind the mouse to the new canvas
        Mouse.setElement(engine.input.mouse, engine.render.canvas);
    };

    var _addBody = function(gui) {
        var engine = gui.engine;

        var options = { 
            density: gui.density,
            friction: gui.friction,
            frictionAir: gui.frictionAir,
            restitution: gui.restitution
        };

        for (var i = 0; i < gui.amount; i++) {
            World.add(engine.world, Bodies.polygon(gui.offset.x + 120 + i * gui.size + i * 50, gui.offset.y + 200, gui.sides, gui.size, options));
        }
    };

    var _clear = function(gui) {
        var engine = gui.engine;

        World.clear(engine.world, true);
        Engine.clear(engine);

        // clear scene graph (if defined in controller)
        var renderController = engine.render.controller;
        if (renderController.clear)
            renderController.clear(engine.render);

        Events.trigger(gui, 'clear');
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired after the gui's clear button pressed
    *
    * @event clear
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the gui's save button pressed
    *
    * @event save
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the gui's load button pressed
    *
    * @event load
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

})();