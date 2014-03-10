/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Events
*/

var Events = {};

(function() {

    /**
     * Subscribes a callback function to the given object's eventName
     * @method on
     * @param {} object
     * @param {string} eventNames
     * @param {function} callback
     */
    Events.on = function(object, eventNames, callback) {
        var names = eventNames.split(' '),
            name;

        for (var i = 0; i < names.length; i++) {
            name = names[i];
            object.events = object.events || {};
            object.events[name] = object.events[name] || [];
            object.events[name].push(callback);
        }
    };

    /**
     * Fires all the callbacks subscribed to the given object's eventName, in the order they subscribed, if any
     * @method fire
     * @param {} object
     * @param {string} eventNames
     * @param {} event
     */
    Events.trigger = function(object, eventNames, event) {
        var names,
            name,
            callbacks,
            eventClone;

        if (object.events) {
            event = event || {};
            names = eventNames.split(' ');

            for (var i = 0; i < names.length; i++) {
                name = names[i];

                if (name in object.events) {
                    callbacks = object.events[name];
                    eventClone = Common.clone(event, false);
                    eventClone.name = name;
                    eventClone.source = object;

                    for (var j = 0; j < callbacks.length; j++) {
                        callbacks[j].apply(object, [eventClone]);
                    }
                }
            }
        }
    };

    /**
     * Clears all callbacks for the given event names if supplied, otherwise all events
     * @method clear
     * @param {} object
     * @param {string} eventNames
     */
    Events.clear = function(object, eventNames) {
        if (!eventNames) {
            object.events = {};
            return;
        }

        var names = eventNames.split(' ');
        for (var i = 0; i < names.length; i++) {
            object.events[names[i]] = [];
        }
    };

})();