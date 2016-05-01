var _isBrowser = typeof window !== 'undefined' && window.location,
    Matter = _isBrowser ? window.Matter : require('../../build/matter-dev.js');

var Example = {};
Matter.Example = Example;

if (!_isBrowser) {
    module.exports = Example;
}

(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies;

    Example.airFriction = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        World.add(world, [
            Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
            Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
            Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 })
        ]);

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.showVelocity = true;
    };
    
})();