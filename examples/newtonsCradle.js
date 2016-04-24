(function() {

    var World = Matter.World,
        Body = Matter.Body,
        Composites = Matter.Composites;

    Example.newtonsCradle = function(demo) {
        var engine = demo.engine,
            world = engine.world;
        
        var cradle = Composites.newtonsCradle(280, 100, 5, 30, 200);
        World.add(world, cradle);
        Body.translate(cradle.bodies[0], { x: -180, y: -100 });
        
        cradle = Composites.newtonsCradle(280, 380, 7, 20, 140);
        World.add(world, cradle);
        Body.translate(cradle.bodies[0], { x: -140, y: -100 });
        
        var renderOptions = demo.render.options;
        renderOptions.showVelocity = true;
    };

})();