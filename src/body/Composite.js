// TODO: composite translate, rotate

var Composite = {};

(function() {

    Composite.create = function(options) {
        return Common.extend({ bodies: [], constraints: [], composites: [] }, options);
    };

    Composite.add = function(compositeA, compositeB) {
        if (compositeA.bodies && compositeB.bodies)
            compositeA.bodies = compositeA.bodies.concat(compositeB.bodies);

        if (compositeA.constraints && compositeB.constraints)
            compositeA.constraints = compositeA.constraints.concat(compositeB.constraints);

        if (compositeA.composites && compositeB.composites)
            compositeA.composites = compositeA.composites.concat(compositeB.composites);

        return compositeA;
    };

    Composite.addBody = function(composite, body) {
        composite.bodies = composite.bodies || [];
        composite.bodies.push(body);
        return composite;
    };

    Composite.addConstraint = function(composite, constraint) {
        composite.constraints = composite.constraints || [];
        composite.constraints.push(constraint);
        return composite;
    };

})();