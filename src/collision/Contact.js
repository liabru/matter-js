var Contact = {};

(function() {

    Contact.create = function(vertex) {
        return {
            id: Contact.id(vertex),
            vertex: vertex,
            normalImpulse: 0,
            tangentImpulse: 0
        };
    };
    
    Contact.id = function(vertex) {
        return vertex.body.id + '_' + vertex.index;
    };

})();