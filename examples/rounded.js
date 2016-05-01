(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies;

    Example.rounded = function(demo) {
        var engine = demo.engine,
            world = engine.world;

        World.add(world, [
            Bodies.rectangle(200, 200, 100, 100, { 
                chamfer: { radius: 20 }
            }),

            Bodies.rectangle(300, 200, 100, 100, { 
                chamfer: { radius: [90, 0, 0, 0] }
            }),

            Bodies.rectangle(400, 200, 200, 200, { 
                chamfer: { radius: [150, 20, 40, 20] }
            }),

            Bodies.rectangle(200, 200, 200, 200, { 
                chamfer: { radius: [150, 20, 150, 20] }
            }),

            Bodies.rectangle(300, 200, 200, 50, { 
                chamfer: { radius: [25, 25, 0, 0] }
            }),

            Bodies.polygon(200, 100, 8, 80, { 
                chamfer: { radius: 30 }
            }),

            Bodies.polygon(300, 100, 5, 80, { 
                chamfer: { radius: [10, 40, 20, 40, 10] }
            }),

            Bodies.polygon(400, 200, 3, 50, { 
                chamfer: { radius: [20, 0, 20] }
            })
        ]);

        var renderOptions = demo.render.options;
        renderOptions.showAxes = true;
        renderOptions.showCollisions = true;
    };

})();