/**
* The `Matter.Components` module contains factory methods for creating rigid body models 
* with commonly used body configurations (such as rectangles, circles and other polygons).
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Components
*/

// TODO: true circle bodies

var Components = {};

module.exports = Components;

var Vertices = require('../geometry/Vertices');
var Common = require('../core/Common');
var Body = require('../body/Body');
var Composite = require('../body/Composite');
var Bounds = require('../geometry/Bounds');
var Vector = require('../geometry/Vector');
var Bodies = require('./Bodies');


(function() {
    /**
     * Creates a new button body model with a regular rectangle hull with the given number of sides. 
     * The options parameter is an object that specifies any properties you wish to override the defaults.
     * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
     * @method button
     * @param {number} x
     * @param {number} y
     * @param {string} text
     * @param {object} [options]
     * @return {body} A new button
     */
    Components.button = function(x, y, width, height, content, options) {
        var button = Composite.create({ btype: 'Button', label: 'Button' });
        var defaults = {
            isStatic: true,
            isSensor: true,
            text: content,
            wireframes: false,
            chamfer: {
                radius: width / 15
            },
            events: [],
            property: {width, height},
            scaleFactor: 0.01,
            render : {
                fillStyle: "#426FC5",
                strokeStyle: "#ff00ff",
                shadowBlur: 10,
                shadowColor: "#4a4a4a",
                text: {
                    padding: 10,
                }
            },
        };
        var events = Common.extend({}, true, options.events);
        options = Common.extend(defaults, options);
        var btnEvent = buttonEvent();
        if (options.events) {
            options.events.push(...btnEvent);
        }
        var edge = Bodies.rectangle(x, y, width, height, options);
        edge.belong = button;
        Composite.addBody(button, edge);
        options.events = events;
        var text = Bodies.text(x, y, content, options);
        text.belong = button;
        Composite.addBody(button, text);
        return button;
    };

    function buttonEvent () {
        return [
            {
                name: 'mousedown',
                callback: (object) => {
                    var body = object.element;
                    // var belong = body.belong; // TODO: Composites.scale
                    body.vertices2 = body.vertices2 || Vertices.simpleCopy(body.vertices);
                    Body.scale(body, 1 - body.scaleFactor, 1 - body.scaleFactor, body.position);
                }
            },
            {
                name: 'mouseup',
                callback: (object) => {
                    var body = object.element;
                    if(body.vertices2) 
                        Body.setVertices(body, body.vertices2);
                    else
                        Body.setVertices(body, body.vertices);
                }
            },
        ];
    }

})();
