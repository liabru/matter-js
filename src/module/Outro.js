// aliases

World.add = Composite.add;
World.remove = Composite.remove;
World.addComposite = Composite.addComposite;
World.addBody = Composite.addBody;
World.addConstraint = Composite.addConstraint;
World.clear = Composite.clear;

Engine.run = Runner.run;

// exports

Matter.Body = Body;
Matter.Composite = Composite;
Matter.World = World;
Matter.Contact = Contact;
Matter.Detector = Detector;
Matter.Grid = Grid;
Matter.Pairs = Pairs;
Matter.Pair = Pair;
Matter.Resolver = Resolver;
Matter.SAT = SAT;
Matter.Constraint = Constraint;
Matter.MouseConstraint = MouseConstraint;
Matter.Common = Common;
Matter.Engine = Engine;
Matter.Mouse = Mouse;
Matter.Sleeping = Sleeping;
Matter.Bodies = Bodies;
Matter.Composites = Composites;
Matter.Axes = Axes;
Matter.Bounds = Bounds;
Matter.Vector = Vector;
Matter.Vertices = Vertices;
Matter.Render = Render;
Matter.RenderPixi = RenderPixi;
Matter.Events = Events;
Matter.Query = Query;
Matter.Runner = Runner;
Matter.Svg = Svg;

// @if DEBUG
Matter.Metrics = Metrics;
// @endif

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