/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class World
*/

var World = {};

(function() {

    /**
     * Description
     * @method create
     * @constructor
     * @param {} options
     * @return {world} A new world
     */
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
    
    /**
     * Description
     * @method clear
     * @param {world} world
     * @param {boolean} keepStatic
     */
    World.clear = function(world, keepStatic) {
        world.bodies = keepStatic ? world.bodies.filter(function(body) { return body.isStatic; }) : [];
        world.constraints = [];
    };

    // World is a Composite body
    // see src/module/Outro.js for these aliases:
    
    /**
     * An alias for Composite.add since World is also a Composite (see Outro.js)
     * @method addComposite
     * @param {world} world
     * @param {composite} composite
     * @return {world} The original world with the objects from composite added
     */
    
     /**
      * An alias for Composite.addBody since World is also a Composite (see Outro.js)
      * @method addBody
      * @param {world} world
      * @param {body} body
      * @return {world} The original world with the body added
      */

     /**
      * An alias for Composite.addConstraint since World is also a Composite (see Outro.js)
      * @method addConstraint
      * @param {world} world
      * @param {constraint} constraint
      * @return {world} The original world with the constraint added
      */

})();