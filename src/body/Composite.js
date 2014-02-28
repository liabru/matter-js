/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Composite
*/

// TODO: composite translate, rotate

var Composite = {};

(function() {

    /**
     * Description
     * @method create
     * @param {} options
     * @return {composite} A new composite
     */
    Composite.create = function(options) {
        return Common.extend({ bodies: [], constraints: [], composites: [] }, options);
    };

    /**
     * Description
     * @method add
     * @param {composite} compositeA
     * @param {composite} compositeB
     * @return {composite} The original compositeA with the objects from compositeB added
     */
    Composite.add = function(compositeA, compositeB) {
        if (compositeA.bodies && compositeB.bodies)
            compositeA.bodies = compositeA.bodies.concat(compositeB.bodies);

        if (compositeA.constraints && compositeB.constraints)
            compositeA.constraints = compositeA.constraints.concat(compositeB.constraints);

        if (compositeA.composites && compositeB.composites)
            compositeA.composites = compositeA.composites.concat(compositeB.composites);

        return compositeA;
    };

    /**
     * Description
     * @method addBody
     * @param {composite} composite
     * @param {body} body
     * @return {composite} The original composite with the body added
     */
    Composite.addBody = function(composite, body) {
        composite.bodies = composite.bodies || [];
        composite.bodies.push(body);
        return composite;
    };

    /**
     * Description
     * @method addConstraint
     * @param {composite} composite
     * @param {constraint} constraint
     * @return {composite} The original composite with the constraint added
     */
    Composite.addConstraint = function(composite, constraint) {
        composite.constraints = composite.constraints || [];
        composite.constraints.push(constraint);
        return composite;
    };

})();