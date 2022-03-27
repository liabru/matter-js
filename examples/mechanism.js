var Example = Example || {};

Example.mechanism = function() {
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        World = Matter.World,
        Constraint = Matter.Constraint,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies;

    const engine = Engine.create();
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            wireframes: false,
            background: '#99cdee',
        }
    });

    engine.world.gravity.y = 0; // 今回は重力を使わない

    // 円盤を追加
    const disk = Bodies.circle(200, 200, 50, {
        render: {
            fillStyle: '#dd4444',
            strokeStyle: '#222222',
            lineWidth: 3,
        }
    });
    World.add(engine.world, disk);

    // 円盤の中心を空間に固定
    const anchor = Constraint.create({
        pointA: {x: 0, y: 0}, // 円盤の中心
        bodyA: disk,
        pointB: {x: 200, y: 200}, // 空間のこの位置に固定
        length: 0,
    });
    World.add(engine.world, anchor);

    // ピストンを追加
    const piston = Bodies.rectangle(500, 200, 100, 50, {
        isStaticX: true,
        render: {
            fillStyle: '#4444dd',
            strokeStyle: '#222222',
            lineWidth: 3,
        },
    });
    World.add(engine.world, piston);

    // ピストンと円盤の間に束縛を追加
    const diskPistonJoint = Constraint.create( {
        pointA: {x: -30, y: 0}, // 中心から少しずらす
        bodyA: disk,
        pointB: {x: -40, y: 0},
        bodyB: piston,
        length: 230,
        render: {
            anchor: false
        }
    });
    World.add(engine.world, diskPistonJoint);

    // シリンダーを追加
    const cylinder = Body.create( {
        parts: [
            Bodies.rectangle(450, 170, 300, 10, {render: {fillStyle: 'red'}}),
            Bodies.rectangle(450, 230, 300, 10, {render: {fillStyle: 'green'}}),
            Bodies.rectangle(605, 200, 10, 70, {render: {fillStyle: 'blue'}}),
        ],
        isStatic: true,
    });
    World.add(engine.world, cylinder);

    // 円盤を回転
    setInterval( () => {
        Body.setAngularVelocity(disk, 0.1);
    }, 100);

    Render.run(render);
    
    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

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

    Composite.add(engine.world, mouseConstraint);

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

Example.mechanism.title = 'Mechanism';
Example.mechanism.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.mechanism;
}
