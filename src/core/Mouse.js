/**
* _Internal Class_, not generally used outside of the engine's internals.
*
* @class Mouse
*/

var Mouse;

(function() {
    
    /**
     * Description
     * @param {HTMLElement} element
     */
    Mouse = function(element) {
        var mouse = this;
        
        this.element = element || document.body;
        this.position = { x: 0, y: 0 };
        this.mousedownPosition = { x: 0, y: 0 };
        this.mouseupPosition = { x: 0, y: 0 };
        this.button = -1;

        this.sourceEvents = {
            mousemove: null,
            mousedown: null,
            mouseup: null
        };
        
        this.mousemove = function(event) { 
            var position = _getRelativeMousePosition(event, mouse.element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            }

            mouse.position = position;
            mouse.sourceEvents.mousemove = event;
        };
        
        this.mousedown = function(event) {
            var position = _getRelativeMousePosition(event, mouse.element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            } else {
                mouse.button = event.button;
            }

            mouse.position = mouse.mousedownPosition = position;
            mouse.sourceEvents.mousedown = event;
        };
        
        this.mouseup = function(event) {
            var position = _getRelativeMousePosition(event, mouse.element),
                touches = event.changedTouches;

            if (touches) {
                event.preventDefault();
            }
            
            mouse.button = -1;
            mouse.position = mouse.mouseupPosition = position;
            mouse.sourceEvents.mouseup = event;
        };

        Mouse.setElement(mouse, mouse.element);
    };

    /**
     * Description
     * @method create
     * @param {HTMLElement} element
     * @return {mouse} A new mouse
     */
    Mouse.create = function(element) {
        return new Mouse(element);
    };

    /**
     * Sets the element the mouse is bound to (and relative to)
     * @method setElement
     * @param {mouse} mouse
     * @param {HTMLElement} element
     */
    Mouse.setElement = function(mouse, element) {
        mouse.element = element;

        element.addEventListener('mousemove', mouse.mousemove);
        element.addEventListener('mousedown', mouse.mousedown);
        element.addEventListener('mouseup', mouse.mouseup);
        
        element.addEventListener('touchmove', mouse.mousemove);
        element.addEventListener('touchstart', mouse.mousedown);
        element.addEventListener('touchend', mouse.mouseup);
    };

    /**
     * Clears all captured source events
     * @method create
     * @param {mouse} mouse
     */
    Mouse.clearSourceEvents = function(mouse) {
        mouse.sourceEvents.mousemove = null;
        mouse.sourceEvents.mousedown = null;
        mouse.sourceEvents.mouseup = null;
    };
    
    /**
     * Description
     * @method _getRelativeMousePosition
     * @private
     * @param {} event
     * @param {} element
     * @return ObjectExpression
     */
    var _getRelativeMousePosition = function(event, element) {
        var elementBounds = element.getBoundingClientRect(),
            scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
            touches = event.changedTouches,
            x, y;
        
        if (touches) {
            x = touches[0].pageX - elementBounds.left - scrollX;
            y = touches[0].pageY - elementBounds.top - scrollY;
        } else {
            x = event.pageX - elementBounds.left - scrollX;
            y = event.pageY - elementBounds.top - scrollY;
        }
        
        return { 
            x: x / (element.clientWidth / element.width), 
            y: y / (element.clientHeight / element.height)
        };
    };

})();