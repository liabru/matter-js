var Example = Example || {};

Example.sprites = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
        Components = Matter.Components,
        Body = Matter.Body,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            background: "#ffffff",
            showAngleIndicator: false,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    var offset = 10,
        options = { 
            isStatic: true
        };

    world.bodies = [];

    // these static walls will not be rendered in this sprites example, see options
    Composite.add(world, [
        Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, options),
        Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, options),
        Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, options)
    ]);
    var text = Bodies.text(400, 300, "这是一个测试的文本", {
        render: {
            text: {
                color: '#000000',
                padding: 10,
                family: 'italic small-caps bold arial',
                width: 2000,
                height: 30,
                textAlign: "center"
            },
        },
        events: [
            {
                name: "click",
                callback: (object, event) => {
                    console.log('click', object, event);
                }
            },
            {
                name: "longpress",
                callback: (object, event) => {
                    console.log('longpress',object, event);
                }
            },
            {
                name: "startdrag",
                callback: (object, event) => {
                    console.log('startdrag',object, event);
                }
            },
            {
                name: "enddrag",
                callback: (object, event) => {
                    console.log('enddrag',object, event);
                }
            },
            {
                name: 'mousedown',
                callback: (object) => {
                    var body = object.element;
                    Body.updateRender(body, {render: { opacity: 0.85, text: {content: "这是一个测试的文本222222222222"} }});
                }
            },
            {
                name: 'mouseup',
                callback: (object) => {
                    var body = object.element;
                    Body.recoverRender(body);
                }
            },
        ],
    });
    Composite.add(world, text);
    Composite.add(world, Bodies.line(0, 0, 800, 600, {
        isStatic: true,
        render: {
            strokeStyle: 'red',
            lineCap: 'round',
        }
    }));
    Composite.add(world, Bodies.line(0, 600, 800, 0, {
        isStatic: true,
        render: {
            strokeStyle: 'red',
            lineCap: 'round',
        }
    }));

    Composite.add(world, Bodies.line(200, 100, 200 + 200, 100, {
        isStatic: true,
        render: {
            strokeStyle: 'red',
            lineCap: 'round',
            lineWidth: 10,
        }
    }));

    Composite.add(world, Bodies.line(200 + 200, 100, 200 + 200, 100 + 200, {
        isStatic: true,
        render: {
            strokeStyle: 'blue',
            lineCap: 'round',
            lineWidth: 10,
        }
    }));
    
    Composite.add(world, Bodies.line(200 + 200, 100 + 200, 200, 100 + 200, {
        isStatic: true,
        render: {
            strokeStyle: 'orange',
            lineCap: 'round',
            lineDash: [10,20],
            lineWidth: 10,
        }
    }));

    Composite.add(world, Bodies.line(200, 100 + 200, 200, 100, {
        isStatic: true,
        render: {
            strokeStyle: 'black',
            lineCap: 'round',
            lineWidth: 10,
        }
    }));

    Composite.add(world, Components.button(800 / 2, 800 / 2, 100, 50, "button", {
        events: [
            {
                name: "click",
                callback: (object) => {
                    console.log('click', object);
                }
            },
            {
                name: "collisionStart",
                callback: (object, event) => {
                    var pair = object.pair;
                    var bodyA = pair.bodyA, bodyB = pair.bodyB;
                    Body.setPosition(bodyA, bodyA.position);
                    Body.setPosition(bodyB, bodyA.position);
                    // Body.setStatic(bodyA, true);
                    bodyB.isSensor = true;
                    Body.setStatic(bodyB, true);
                    console.log('collisionStart', pair, event);
                }
            },
        ],
        render : {
            // fillStyle: "red",
            // shadowBlur: 20,
        },
    }));

    var stack = Composites.stack(20, 20, 1, 2, 0, 0, function(x, y) {
        if (Common.random() > 0.5) {
            return Bodies.rectangle(x, y, 64, 64, {
                save: true,
                render: {
                    strokeStyle: '#ffffff',
                    sprite: {
                        texture: './img/box.png'
                    }
                },
                events: [
                    {
                        name: "longpress",
                        callback: (object, event) => {
                            var body = object.element;
                            Body.setAntigravity(body, {
                                x: 1,
                                y: 0,
                                scale: 1,
                            });
                            Body.setMass(body, body.mass * 100);
                            console.log('longpress',object, event);
                        }
                    },
                ],
            });
        } else {
            return Bodies.circle(x, y, 46, {
                density: 0.0005,
                frictionAir: 0.06,
                restitution: 0.3,
                friction: 0.01,
                render: {
                    sprite: {
                        texture: './img/ball.png'
                    }
                }
            });
        }
    });

    var trail = [];

    // var lowerArm = stack.bodies[1];
    // Events.on(render, 'afterRender', function() {
    //     trail.unshift({
    //         position: Vector.clone(lowerArm.position),
    //         speed: lowerArm.speed
    //     });

    //     Render.startViewTransform(render);
    //     render.context.globalAlpha = 0.7;

    //     for (var i = 0; i < trail.length; i += 1) {
    //         var point = trail[i].position,
    //             speed = trail[i].speed;
            
    //         var hue = 250 + Math.round((1 - Math.min(1, speed / 10)) * 170);
    //         render.context.fillStyle = 'hsl(' + hue + ', 100%, 55%)';
    //         render.context.fillRect(point.x, point.y, 2, 2);
    //     }

    //     render.context.globalAlpha = 1;
    //     Render.endViewTransform(render);

    //     if (trail.length > 2000) {
    //         trail.pop();
    //     }
    // });

    Composite.add(world, stack);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

Example.sprites.title = 'Sprites';
Example.sprites.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.sprites;
}
