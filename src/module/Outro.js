// aliases

World.addComposite = Composite.add;
World.addBody = Composite.addBody;
World.addConstraint = Composite.addConstraint;

// exports

Matter.Body = Body;
Matter.Composite = Composite;
Matter.World = World;
Matter.Contact = Contact;
Matter.Detector = Detector;
Matter.Grid = Grid;
Matter.Manager = Manager;
Matter.Pair = Pair;
Matter.Resolver = Resolver;
Matter.SAT = SAT;
Matter.Constraint = Constraint;
Matter.MouseConstraint = MouseConstraint;
Matter.Common = Common;
Matter.Engine = Engine;
Matter.Metrics = Metrics;
Matter.Mouse = Mouse;
Matter.Sleeping = Sleeping;
Matter.Bodies = Bodies;
Matter.Composites = Composites;
Matter.Axes = Axes;
Matter.Bounds = Bounds;
Matter.Vector = Vector;
Matter.Vertices = Vertices;
Matter.Gui = Gui;
Matter.Render = Render;
Matter.RenderPixi = RenderPixi;
Matter.Events = Events;

// CommonJS module
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Matter;
    }
    exports.Matter = Matter;
}

// AMD module
if (typeof define === 'function' && define.amd) {
    define('Matter', [], function () {
        return Matter;
    });
}

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
    window.Matter = Matter;
}

// End Matter namespace closure

})();