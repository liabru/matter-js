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
        
        element = element || document.body;
        
        this.position = { x: 0, y: 0 };
        this.mousedownPosition = { x: 0, y: 0 };
        this.mouseupPosition = { x: 0, y: 0 };
        this.button = -1;
        
        var mousemove = function(event) { 
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            }

            mouse.position = position;
        };
        
        var mousedown = function(event) {
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                mouse.button = 0;
                event.preventDefault();
            } else {
                mouse.button = event.button;
            }

            mouse.position = mouse.mousedownPosition = position;
        };
        
        var mouseup = function(event) {
            var position = _getRelativeMousePosition(event, element),
                touches = event.changedTouches;

            if (touches) {
                event.preventDefault();
            }
            
            mouse.button = -1;

            mouse.position = mouse.mouseupPosition = position;
        };
        
        element.addEventListener('mousemove', mousemove);
        element.addEventListener('mousedown', mousedown);
        element.addEventListener('mouseup', mouseup);
        
        element.addEventListener('touchmove', mousemove);
        element.addEventListener('touchstart', mousedown);
        element.addEventListener('touchend', mouseup);
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