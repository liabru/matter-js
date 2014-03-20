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
        var _datGuiSupported = window.dat && window.localStorage,
            _serializer;
        
        if (!_datGuiSupported) {
            console.log("Could not create GUI. Check dat.gui library is loaded first.");
            return;
        }

        var datGui = new dat.GUI(options);
        
        if (Resurrect) {
            _serializer = new Resurrect({ prefix: '$' });
            _serializer.parse = _serializer.resurrect;
        } else {
            _serializer = JSON;
        }

        var gui = {
            datGui: datGui,
            amount: 1,
            size: 40,
            sides: 4,
            density: 0.001,
            restitution: 0,
            friction: 0.1,
            frictionAir: 0.01,
            renderer: 'canvas'
        };

        var funcs = {

            addBody: function() {
                var options = { 
                    density: gui.density,
                    friction: gui.friction,
                    frictionAir: gui.frictionAir,
                    restitution: gui.restitution
                };

                for (var i = 0; i < gui.amount; i++) {
                    World.addBody(engine.world, Bodies.polygon(120 + i * gui.size + i * 50, 200, gui.sides, gui.size, options));
                }
            },

            clear: function() {
                World.clear(engine.world, true);
                Engine.clear(engine);

                // clear scene graph (if defined in controller)
                var renderController = engine.render.controller;
                if (renderController.clear)
                    renderController.clear(engine.render);
            },

            save: function() {
                if (localStorage && _serializer) {
                    localStorage.setItem('world', _serializer.stringify(engine.world));
                }
            },

            load: function() {
                var loadedWorld;

                if (localStorage && _serializer) {
                    loadedWorld = _serializer.parse(localStorage.getItem('world'));
                }

                if (loadedWorld) {
                    Engine.merge(engine, { world: loadedWorld });
                }
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
        physics.add(engine.broadphase, 'current', ['grid', 'bruteForce']);
        physics.add(engine, 'timeScale', 0.1, 2).step(0.1);
        physics.add(engine, 'velocityIterations', 1, 10).step(1);
        physics.add(engine, 'positionIterations', 1, 10).step(1);
        physics.add(engine, 'enabled');
        physics.open();

        var render = datGui.addFolder('Render');

        render.add(gui, 'renderer', ['canvas', 'webgl'])
            .onFinishChange(function(value) {
                var controller;

                if (value === 'canvas')
                    controller = Render;

                if (value === 'webgl')
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

                // update mouse
                engine.input.mouse = Mouse.create(engine.render.canvas);
                engine.mouseConstraint.mouse = engine.input.mouse;
            });

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

        //datGui.remember(world)
        
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

})();