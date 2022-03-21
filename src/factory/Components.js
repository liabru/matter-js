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
            chamfer: {
                radius: width * 0.05
            },
            wireframes: false,
            events: [],
            property: { width, height },
            translateFactor: 0, //width * 0.01,
            render : {
                fillStyle: "#4caf50",
                strokeStyle: "#4caf50",
                shadowBlur: 15,
                shadowColor: "#4a4a4a",
                lineWidth: 2,
                text: {
                    color: '#ffffff',
                    padding: 0,
                    width: width * 0.8,
                    height: height * 0.6,
                    textAlign: 'center',
                }
            },
        };
        if (defaults.wireframes == true) {
            defaults.render.strokeStyle = "#4caf50";
            defaults.render.text.color = "#000000";
        } else {
            defaults.render.fillStyle = "#4caf50";
            defaults.render.text.color = "#ffffff";
        }
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
                    var belong = body.belong;
                    if (body.translateFactor && typeof body.translateFactor == "number" && body.translateFactor != 0)
                        Composite.translate(belong, { x: body.translateFactor, y: body.translateFactor });
                    Composite.updateRender(belong, null, {render: { opacity: 0.85 }});
                }
            },
            {
                name: 'mouseup',
                callback: (object) => {
                    var body = object.element;
                    var belong = body.belong;
                    if (body.translateFactor && typeof body.translateFactor == "number" && body.translateFactor != 0)
                        Composite.translate(belong, { x: -body.translateFactor, y: -body.translateFactor });
                    Composite.recoverRender(belong);
                }
            },
        ];
    }

})();
