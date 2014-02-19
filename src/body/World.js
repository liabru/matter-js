var World = {};

(function() {

    World.create = function(options) {
        var defaults = {
            gravity: { x: 0, y: 1 },
            bodies: [],
            constraints: [],
            bounds: { 
                min: { x: 0, y: 0 }, 
                max: { x: 800, y: 600 } 
            }
        };
        
        return Common.extend(defaults, options);
    };
    
    World.clear = function(world, keepStatic) {
        world.bodies = keepStatic ? world.bodies.filter(function(body) { return body.isStatic; }) : [];
        world.constraints = [];
    };

    // world is a composite body
    // see src/module/Outro.js for these aliases:
    
    // World.addComposite = Composite.add;
    // World.addBody = Composite.addBody;
    // World.addConstraint = Composite.addConstraint;

})();