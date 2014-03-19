/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Render
*/

// TODO: viewports
// TODO: two.js, pixi.js

var Render = {};

(function() {
    
    /**
     * Description
     * @method create
     * @param {object} options
     * @return {render} A new renderer
     */
    Render.create = function(options) {
        var defaults = {
            controller: Render,
            element: null,
            canvas: null,
            options: {
                width: 800,
                height: 600,
                background: '#fafafa',
                wireframeBackground: '#222',
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false
            }
        };

        var render = Common.extend(defaults, options);

        render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
        render.context = render.canvas.getContext('2d');
        render.textures = {};

        Render.setBackground(render, render.options.background);

        if (Common.isElement(render.element)) {
            render.element.appendChild(render.canvas);
        } else {
            Common.log('No "render.element" passed, "render.canvas" was not inserted into document.', 'warn');
        }

        return render;
    };

    /**
     * Sets the background CSS property of the canvas 
     * @method setBackground
     * @param {render} render
     * @param {string} background
     */
    Render.setBackground = function(render, background) {
        if (render.currentBackground !== background) {
            var cssBackground = background;

            if (/(jpg|gif|png)$/.test(background))
                cssBackground = 'url(' + background + ')';

            render.canvas.style.background = cssBackground;
            render.canvas.style.backgroundSize = "contain";
            render.currentBackground = background;
        }
    };

    /**
     * Description
     * @method world
     * @param {engine} engine
     */
    Render.world = function(engine) {
        var render = engine.render,
            world = engine.world,
            canvas = render.canvas,
            context = render.context,
            options = render.options,
            i;

        if (options.wireframes) {
            Render.setBackground(render, options.wireframeBackground);
        } else {
            Render.setBackground(render, options.background);
        }

        // clear the canvas with a transparent fill, to allow the canvas background to show
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = "transparent";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = 'source-over';

        if (options.showShadows && !options.wireframes)
            for (i = 0; i < world.bodies.length; i++)
                Render.bodyShadow(engine, world.bodies[i], context);

        for (i = 0; i < world.bodies.length; i++)
            Render.body(engine, world.bodies[i], context);

        for (i = 0; i < world.constraints.length; i++)
            Render.constraint(world.constraints[i], context);

        if (options.showCollisions)
            for (i = 0; i < engine.pairs.list.length; i++)
                Render.collision(engine, engine.pairs.list[i], context);

        if (options.showBroadphase && engine.broadphase.current === 'grid')
            Render.grid(engine, engine.broadphase[engine.broadphase.current].instance, context);

        if (options.showDebug)
            Render.debug(engine, context);
    };

    /**
     * Description
     * @method debug
     * @param {engine} engine
     * @param {RenderingContext} context
     */
    Render.debug = function(engine, context) {
        var c = context,
            world = engine.world,
            render = engine.render,
            options = render.options,
            space = "    ";

        if (engine.timing.timestamp - (render.debugTimestamp || 0) >= 500) {
            var text = "";
            text += "delta: " + engine.timing.delta.toFixed(3) + space;
            text += "fps: " + Math.round(engine.timing.fps) + space;
            text += "correction: " + engine.timing.correction.toFixed(3) + space;
            text += "bodies: " + world.bodies.length + space;

            if (engine.broadphase.controller === Grid)
                text += "buckets: " + engine.metrics.buckets + space;

            text += "\n";

            text += "collisions: " + engine.metrics.collisions + space;
            text += "pairs: " + engine.pairs.list.length + space;
            text += "broad: " + engine.metrics.broadEff + space;
            text += "mid: " + engine.metrics.midEff + space;
            text += "narrow: " + engine.metrics.narrowEff + space;            
            render.debugString = text;
            render.debugTimestamp = engine.timing.timestamp;
        }

        if (render.debugString) {
            c.font = "12px Arial";

            if (options.wireframes) {
                c.fillStyle = 'rgba(255,255,255,0.5)';
            } else {
                c.fillStyle = 'rgba(0,0,0,0.5)';
            }

            var split = render.debugString.split('\n');

            for (var i = 0; i < split.length; i++) {
                c.fillText(split[i], 50, 50 + i * 18);
            }
        }
    };

    /**
     * Description
     * @method constraint
     * @param {constraint} constraint
     * @param {RenderingContext} context
     */
    Render.constraint = function(constraint, context) {
        var bodyA = constraint.bodyA,
            bodyB = constraint.bodyB,
            c = context;

        if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
            return;

        if (bodyA) {
            c.beginPath();
            c.moveTo(bodyA.position.x + constraint.pointA.x, bodyA.position.y + constraint.pointA.y);
        } else {
            c.beginPath();
            c.moveTo(constraint.pointA.x, constraint.pointA.y);
        }

        if (bodyB) {
            c.lineTo(bodyB.position.x + constraint.pointB.x, bodyB.position.y + constraint.pointB.y);
        } else {
            c.lineTo(constraint.pointB.x, constraint.pointB.y);
        }

        c.lineWidth = constraint.render.lineWidth;
        c.strokeStyle = constraint.render.strokeStyle;
        c.stroke();
    };
    
    /**
     * Description
     * @method bodyShadow
     * @param {engine} engine
     * @param {body} body
     * @param {RenderingContext} context
     */
    Render.bodyShadow = function(engine, body, context) {
        var c = context,
            render = engine.render;

        if (body.circleRadius) {
            c.beginPath();
            c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
            c.closePath();
        } else {
            c.beginPath();
            c.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (var j = 1; j < body.vertices.length; j++) {
                c.lineTo(body.vertices[j].x, body.vertices[j].y);
            }
            c.closePath();
        }

        var distanceX = body.position.x - render.options.width * 0.5,
            distanceY = body.position.y - render.options.height * 0.2,
            distance = Math.abs(distanceX) + Math.abs(distanceY);

        c.shadowColor = 'rgba(0,0,0,0.15)';
        c.shadowOffsetX = 0.05 * distanceX;
        c.shadowOffsetY = 0.05 * distanceY;
        c.shadowBlur = 1 + 12 * Math.min(1, distance / 1000);

        c.fill();

        c.shadowColor = null;
        c.shadowOffsetX = null;
        c.shadowOffsetY = null;
        c.shadowBlur = null;
    };

    /**
     * Description
     * @method body
     * @param {engine} engine
     * @param {body} body
     * @param {RenderingContext} context
     */
    Render.body = function(engine, body, context) {
        var c = context,
            render = engine.render,
            options = render.options;

        // body bounds
        if (options.showBounds) {
            c.beginPath();
            c.rect(body.bounds.min.x, body.bounds.min.y, body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y);
            c.lineWidth = 1;
            if (options.wireframes) {
                c.strokeStyle = 'rgba(255,255,255,0.08)';
            } else {
                c.strokeStyle = 'rgba(0,0,0,0.1)';
            }
            c.stroke();
        }

        // draw body
        if (body.render.visible) {
            if (body.render.sprite && !options.wireframes) {
                // body sprite
                var sprite = body.render.sprite,
                    texture = _getTexture(render, sprite.texture);

                if (options.showSleeping && body.isSleeping) 
                    c.globalAlpha = 0.5;

                c.translate(body.position.x, body.position.y); 
                c.rotate(body.angle);

                c.drawImage(texture, texture.width * -0.5 * sprite.xScale, texture.height * -0.5 * sprite.yScale, 
                            texture.width * sprite.xScale, texture.height * sprite.yScale);

                // revert translation, hopefully faster than save / restore
                c.rotate(-body.angle);
                c.translate(-body.position.x, -body.position.y); 

                if (options.showSleeping && body.isSleeping) 
                    c.globalAlpha = 1;
            } else {
                // body polygon
                if (body.circleRadius) {
                    c.beginPath();
                    c.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
                    c.closePath();
                } else {
                    c.beginPath();
                    c.moveTo(body.vertices[0].x, body.vertices[0].y);
                    for (var j = 1; j < body.vertices.length; j++) {
                        c.lineTo(body.vertices[j].x, body.vertices[j].y);
                    }
                    c.closePath();
                }

                if (!options.wireframes) {
                    c.fillStyle = body.render.fillStyle;
                    if (options.showSleeping && body.isSleeping)
                        c.fillStyle = Common.shadeColor(body.render.fillStyle, 50);
                    c.lineWidth = body.render.lineWidth;
                    c.strokeStyle = body.render.strokeStyle;
                    c.fill();
                    c.stroke();
                } else {
                    c.lineWidth = 1;
                    c.strokeStyle = '#bbb';
                    if (options.showSleeping && body.isSleeping)
                        c.strokeStyle = 'rgba(255,255,255,0.2)';
                    c.stroke();
                }
            }
        }

        // angle indicator
        if (options.showAngleIndicator && !options.showAxes) {
            c.beginPath();
            c.moveTo(body.position.x, body.position.y);
            c.lineTo((body.vertices[0].x + body.vertices[body.vertices.length-1].x) / 2, 
                     (body.vertices[0].y + body.vertices[body.vertices.length-1].y) / 2);
            c.lineWidth = 1;
            if (options.wireframes) {
                c.strokeStyle = 'indianred';
            } else {
                c.strokeStyle = body.render.strokeStyle;
            }
            c.stroke();
        }

        // axes
        if (options.showAxes) {
            for (var i = 0; i < body.axes.length; i++) {
                var axis = body.axes[i];
                c.beginPath();
                c.moveTo(body.position.x, body.position.y);
                c.lineTo(body.position.x + axis.x * 20, body.position.y + axis.y * 20);
                c.lineWidth = 1;
                if (options.wireframes) {
                    c.strokeStyle = 'indianred';
                } else {
                    c.strokeStyle = body.render.strokeStyle;
                }
                c.stroke();
            }
        }

        // positions
        if (options.showPositions) {
            c.beginPath();
            c.arc(body.position.x, body.position.y, 3, 0, 2 * Math.PI, false);
            if (options.wireframes) {
                c.fillStyle = 'indianred';
            } else {
                c.fillStyle = 'rgba(0,0,0,0.5)';
            }
            c.fill();
            c.beginPath();
            c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
            c.fillStyle = 'rgba(255,165,0,0.8)';
            c.fill();
        }
        
        // body velocity vector
        if (options.showVelocity) {
            c.beginPath();
            c.moveTo(body.position.x, body.position.y);
            c.lineTo(body.position.x + (body.position.x - body.positionPrev.x) * 2, body.position.y + (body.position.y - body.positionPrev.y) * 2);
            c.lineWidth = 3;
            c.strokeStyle = 'cornflowerblue';
            c.stroke();
        }

        // body id
        if (options.showIds) {
            c.font = "12px Arial";
            c.fillStyle = 'rgba(255,255,255,0.5)';
            c.fillText(body.id, body.position.x + 10, body.position.y - 10);
        }
    };

    /**
     * Description
     * @method collision
     * @param {engine} engine
     * @param {pair} pair
     * @param {RenderingContext} context
     */
    Render.collision = function(engine, pair, context) {
        var c = context,
            collision = pair.collision,
            options = engine.render.options;

        for (var i = 0; i < pair.activeContacts.length; i++) {
            var contact = pair.activeContacts[i],
                vertex = contact.vertex;
            c.beginPath();
            //c.arc(vertex.x, vertex.y, 2.5, 0, 2 * Math.PI, false);
            c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
            if (options.wireframes) {
                c.fillStyle = 'rgba(255,255,255,0.7)';
            } else {
                c.fillStyle = 'orange';
            }
            c.fill();
        }
        
        if (pair.activeContacts.length > 0) {
            var normalPosX = pair.activeContacts[0].vertex.x,
                normalPosY = pair.activeContacts[0].vertex.y;

            if (pair.activeContacts.length === 2) {
                normalPosX = (pair.activeContacts[0].vertex.x + pair.activeContacts[1].vertex.x) / 2;
                normalPosY = (pair.activeContacts[0].vertex.y + pair.activeContacts[1].vertex.y) / 2;
            }
            
            // collision normal
            c.beginPath();
            c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
            c.lineWidth = 1;
            c.lineTo(normalPosX, normalPosY);
            if (options.wireframes) {
                c.strokeStyle = 'rgba(255,165,0,0.7)';
            } else {
                c.strokeStyle = 'orange';
            }
            c.stroke();
        }
    };

    /**
     * Description
     * @method grid
     * @param {engine} engine
     * @param {grid} grid
     * @param {RenderingContext} context
     */
    Render.grid = function(engine, grid, context) {
        var c = context,
            options = engine.render.options;

        c.lineWidth = 1;

        if (options.wireframes) {
            c.strokeStyle = 'rgba(255,180,0,0.1)';
        } else {
            c.strokeStyle = 'rgba(255,180,0,0.5)';
        }

        var bucketKeys = Common.keys(grid.buckets);

        for (var i = 0; i < bucketKeys.length; i++) {
            var bucketId = bucketKeys[i];

            if (grid.buckets[bucketId].length < 2)
                continue;

            var region = bucketId.split(',');
            c.beginPath();
            c.rect(0.5 + parseInt(region[0], 10) * grid.bucketWidth, 
                    0.5 + parseInt(region[1], 10) * grid.bucketHeight, 
                    grid.bucketWidth, 
                    grid.bucketHeight);
            c.stroke();
        }
    };

    /**
     * Description
     * @method _createCanvas
     * @private
     * @param {} width
     * @param {} height
     * @return canvas
     */
    var _createCanvas = function(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.oncontextmenu = function() { return false; };
        canvas.onselectstart = function() { return false; };
        return canvas;
    };

    /**
     * Gets the requested texture (an Image) via its path
     * @method _getTexture
     * @private
     * @param {render} render
     * @param {string} imagePath
     * @return {Image} texture
     */
    var _getTexture = function(render, imagePath) {
        var image = render.textures[imagePath];

        if (image)
            return image;

        image = render.textures[imagePath] = new Image();
        image.src = imagePath;

        return image;
    };

})();