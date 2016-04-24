(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Query = Matter.Query,
        Svg = Matter.Svg;

    Example.terrain = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        world.bodies = [];

        var terrain;

        $.get('./svg/terrain.svg').done(function(data) {
            var vertexSets = [],
                color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

            $(data).find('path').each(function(i, path) {
                vertexSets.push(Svg.pathToVertices(path, 30));
            });

            terrain = Bodies.fromVertices(400, 350, vertexSets, {
                isStatic: true,
                render: {
                    fillStyle: color,
                    strokeStyle: color
                }
            }, true);

            World.add(world, terrain);

            var bodyOptions = {
                frictionAir: 0, 
                friction: 0.0001,
                restitution: 0.6
            };
            
            World.add(world, Composites.stack(80, 100, 20, 20, 10, 10, function(x, y) {
                if (Query.point([terrain], { x: x, y: y }).length === 0) {
                    return Bodies.polygon(x, y, 5, 12, bodyOptions);
                }
            }));
        });

        var renderOptions = demo.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.showVelocity = true;
    };

})();