(function() {

    // Matter aliases
    var Engine = Matter.Engine,
        Gui = Matter.Gui,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint;

    var Demo = {};

    var _engine,
        _sceneName = 'mixed',
        _sceneWidth,
        _sceneHeight;

    Demo.init = function() {
        var canvasContainer = document.getElementById('canvas-container'),
            demoStart = document.getElementById('demo-start');
        
        demoStart.addEventListener('click', function() {
            demoStart.style.display = 'none';
        
            _engine = Engine.create(canvasContainer, {
                render: {
                    options: {
                        wireframes: true,
                        showAngleIndicator: true,
                        showDebug: true
                    }
                }
            });

            Demo.fullscreen();

            setTimeout(function() {
                Engine.run(_engine);
                Demo.updateScene();
            }, 800);
        });
        
        window.addEventListener('deviceorientation', Demo.updateGravity, true);
        window.addEventListener('touchstart', Demo.fullscreen);
        window.addEventListener('orientationchange', function() {
            Demo.updateGravity();
            Demo.updateScene();
            Demo.fullscreen();
        }, false);
    };

    window.addEventListener('load', Demo.init);

    Demo.mixed = function() {
        var _world = _engine.world;
        
        Demo.reset();

        World.add(_world, MouseConstraint.create(_engine));
        
        var stack = Composites.stack(20, 20, 10, 5, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {
                
            case 0:
                if (Math.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 40), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), { friction: 0.01, restitution: 0.4 });
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(4, 6)), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
            
            }
        });
        
        World.add(_world, stack);
    };
    
    Demo.updateScene = function() {
        if (!_engine)
            return;
        
        _sceneWidth = document.documentElement.clientWidth;
        _sceneHeight = document.documentElement.clientHeight;

        var boundsMax = _engine.world.bounds.max,
            renderOptions = _engine.render.options,
            canvas = _engine.render.canvas;

        boundsMax.x = _sceneWidth;
        boundsMax.y = _sceneHeight;

        canvas.width = renderOptions.width = _sceneWidth;
        canvas.height = renderOptions.height = _sceneHeight;

        Demo[_sceneName]();
    };
    
    Demo.updateGravity = function () {
        if (!_engine)
            return;
        
        var orientation = window.orientation,
            gravity = _engine.world.gravity;

        if (orientation === 0) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(event.beta, -90, 90) / 90;
        } else if (orientation === 180) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
        } else if (orientation === 90) {
            gravity.x = Common.clamp(event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
        } else if (orientation === -90) {
            gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
        }
    };
    
    Demo.fullscreen = function(){
        var _fullscreenElement = _engine.render.canvas;
        
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (_fullscreenElement.requestFullscreen) {
                _fullscreenElement.requestFullscreen();
            } else if (_fullscreenElement.mozRequestFullScreen) {
                _fullscreenElement.mozRequestFullScreen();
            } else if (_fullscreenElement.webkitRequestFullscreen) {
                _fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    };
    
    Demo.reset = function() {
        var _world = _engine.world;
        
        World.clear(_world);
        Engine.clear(_engine);
        
        var offset = 5;
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, -offset, _sceneWidth + 0.5, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + offset, _sceneWidth + 0.5, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth + offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(-offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, { isStatic: true }));
    };

})();