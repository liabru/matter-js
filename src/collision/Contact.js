/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Contact
*/

var Contact = {};

(function() {

    /**
     * Description
     * @method create
     * @param {vertex} vertex
     * @return {contact} A new contact
     */
    Contact.create = function(vertex) {
        return {
            id: Contact.id(vertex),
            vertex: vertex,
            normalImpulse: 0,
            tangentImpulse: 0
        };
    };
    
    /**
     * Description
     * @method id
     * @param {vertex} vertex
     * @return {Number} Unique contactID
     */
    Contact.id = function(vertex) {
        return vertex.body.id + '_' + vertex.index;
    };

})();