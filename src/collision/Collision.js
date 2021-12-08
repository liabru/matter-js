/**
* The `Matter.Collision` module contains methods for managing collision records.
*
* @class Collision
*/

var Collision = {};

module.exports = Collision;

(function() {

    /**
     * Creates a new collision record.
     * @method create
     * @param {body} bodyA
     * @param {body} bodyB
     * @return {collision} A new collision record
     */
    Collision.create = function(bodyA, bodyB) {
        return { 
            pair: null,
            collided: false,
            bodyA: bodyA,
            bodyB: bodyB,
            parentA: bodyA.parent,
            parentB: bodyB.parent,
            depth: 0,
            normal: { x: 0, y: 0 },
            tangent: { x: 0, y: 0 },
            penetration: { x: 0, y: 0 },
            supports: []
        };
    };

})();
