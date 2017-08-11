/**
* The Matter.js demo page controller and example runner.
*
* NOTE: For the actual example code, refer to the source files in `/examples/`.
*
* @class Demo
*/

(function() {
    var sourceLinkRoot = 'https://github.com/liabru/matter-js/blob/master/examples';

    var demo = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js',
            url: 'https://github.com/liabru/matter-js',
            reset: true,
            source: true,
            inspector: true,
            tools: true,
            fullscreen: true,
            exampleSelect: true
        },
        tools: {
            inspector: true,
            gui: true
        },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: true,
        startExample: 'mixed',
        examples: [
            {
                name: 'Air Friction',
                id: 'airFriction',
                init: Example.airFriction,
                sourceLink: sourceLinkRoot + '/airFriction.js'
            },
            {
                name: 'Avalanche',
                id: 'avalanche',
                init: Example.avalanche,
                sourceLink: sourceLinkRoot + '/avalanche.js'
            },
            {
                name: 'Ball Pool',
                id: 'ballPool',
                init: Example.ballPool,
                sourceLink: sourceLinkRoot + '/ballPool.js'
            },
            {
                name: 'Bridge',
                id: 'bridge',
                init: Example.bridge,
                sourceLink: sourceLinkRoot + '/bridge.js'
            },
            {
                name: 'Broadphase',
                id: 'broadphase',
                init: Example.broadphase,
                sourceLink: sourceLinkRoot + '/broadphase.js'
            },
            {
                name: 'Car',
                id: 'car',
                init: Example.car,
                sourceLink: sourceLinkRoot + '/car.js'
            },
            {
                name: 'Catapult',
                id: 'catapult',
                init: Example.catapult,
                sourceLink: sourceLinkRoot + '/catapult.js'
            },
            {
                name: 'Chains',
                id: 'chains',
                init: Example.chains,
                sourceLink: sourceLinkRoot + '/chains.js'
            },
            {
                name: 'Circle Stack',
                id: 'circleStack',
                init: Example.circleStack,
                sourceLink: sourceLinkRoot + '/circleStack.js'
            },
            {
                name: 'Cloth',
                id: 'cloth',
                init: Example.cloth,
                sourceLink: sourceLinkRoot + '/cloth.js'
            },
            {
                name: 'Collision Filtering',
                id: 'collisionFiltering',
                init: Example.collisionFiltering,
                sourceLink: sourceLinkRoot + '/collisionFiltering.js'
            },
            {
                name: 'Composite Manipulation',
                id: 'compositeManipulation',
                init: Example.compositeManipulation,
                sourceLink: sourceLinkRoot + '/compositeManipulation.js'
            },
            {
                name: 'Compound Bodies',
                id: 'compound',
                init: Example.compound,
                sourceLink: sourceLinkRoot + '/compound.js'
            },
            {
                name: 'Compound Stack',
                id: 'compoundStack',
                init: Example.compoundStack,
                sourceLink: sourceLinkRoot + '/compoundStack.js'
            },
            {
                name: 'Concave',
                id: 'concave',
                init: Example.concave,
                sourceLink: sourceLinkRoot + '/concave.js'
            },
            {
                name: 'Constraints',
                id: 'constraints',
                init: Example.constraints,
                sourceLink: sourceLinkRoot + '/constraints.js'
            },
            {
                name: 'Double Pendulum',
                id: 'doublePendulum',
                init: Example.doublePendulum,
                sourceLink: sourceLinkRoot + '/doublePendulum.js'
            },
            {
                name: 'Events',
                id: 'events',
                init: Example.events,
                sourceLink: sourceLinkRoot + '/events.js'
            },
            {
                name: 'Friction',
                id: 'friction',
                init: Example.friction,
                sourceLink: sourceLinkRoot + '/friction.js'
            },
            {
                name: 'Reverse Gravity',
                id: 'gravity',
                init: Example.gravity,
                sourceLink: sourceLinkRoot + '/gravity.js'
            },
            {
                name: 'Gyroscope',
                id: 'gyro',
                init: Example.gyro,
                sourceLink: sourceLinkRoot + '/gyro.js'
            },
            {
                name: 'Manipulation',
                id: 'manipulation',
                init: Example.manipulation,
                sourceLink: sourceLinkRoot + '/manipulation.js'
            },
            {
                name: 'Mixed Shapes',
                id: 'mixed',
                init: Example.mixed,
                sourceLink: sourceLinkRoot + '/mixed.js'
            },
            {
                name: 'Newton\'s Cradle',
                id: 'newtonsCradle',
                init: Example.newtonsCradle,
                sourceLink: sourceLinkRoot + '/newtonsCradle.js'
            },
            {
                name: 'Ragdoll',
                id: 'ragdoll',
                init: Example.ragdoll,
                sourceLink: sourceLinkRoot + '/ragdoll.js'
            },
            {
                name: 'Pyramid',
                id: 'pyramid',
                init: Example.pyramid,
                sourceLink: sourceLinkRoot + '/pyramid.js'
            },
            {
                name: 'Raycasting',
                id: 'raycasting',
                init: Example.raycasting,
                sourceLink: sourceLinkRoot + '/raycasting.js'
            },
            {
                name: 'Restitution',
                id: 'restitution',
                init: Example.restitution,
                sourceLink: sourceLinkRoot + '/restitution.js'
            },
            {
                name: 'Rounded Corners (Chamfering)',
                id: 'rounded',
                init: Example.rounded,
                sourceLink: sourceLinkRoot + '/rounded.js'
            },
            {
                name: 'Sensors',
                id: 'sensors',
                init: Example.sensors,
                sourceLink: sourceLinkRoot + '/sensors.js'
            },
            {
                name: 'Sleeping',
                id: 'sleeping',
                init: Example.sleeping,
                sourceLink: sourceLinkRoot + '/sleeping.js'
            },
            {
                name: 'Slingshot',
                id: 'slingshot',
                init: Example.slingshot,
                sourceLink: sourceLinkRoot + '/slingshot.js'
            },
            {
                name: 'Soft Body',
                id: 'softBody',
                init: Example.softBody,
                sourceLink: sourceLinkRoot + '/softBody.js'
            },
            {
                name: 'Sprites',
                id: 'sprites',
                init: Example.sprites,
                sourceLink: sourceLinkRoot + '/sprites.js'
            },
            {
                name: 'Stack',
                id: 'stack',
                init: Example.stack,
                sourceLink: sourceLinkRoot + '/stack.js'
            },
            {
                name: 'Static Friction',
                id: 'staticFriction',
                init: Example.staticFriction,
                sourceLink: sourceLinkRoot + '/staticFriction.js'
            },
            {
                name: 'Stress',
                id: 'stress',
                init: Example.stress,
                sourceLink: sourceLinkRoot + '/stress.js'
            },
            {
                name: 'Stress 2',
                id: 'stress2',
                init: Example.stress2,
                sourceLink: sourceLinkRoot + '/stress2.js'
            },
            {
                name: 'Concave SVG Paths',
                id: 'svg',
                init: Example.svg,
                sourceLink: sourceLinkRoot + '/svg.js'
            },
            {
                name: 'Terrain',
                id: 'terrain',
                init: Example.terrain,
                sourceLink: sourceLinkRoot + '/terrain.js'
            },
            {
                name: 'Time Scaling',
                id: 'timescale',
                init: Example.timescale,
                sourceLink: sourceLinkRoot + '/timescale.js'
            },
            {
                name: 'Views',
                id: 'views',
                init: Example.views,
                sourceLink: sourceLinkRoot + '/views.js'
            },
            {
                name: 'Wrecking Ball',
                id: 'wreckingBall',
                init: Example.wreckingBall,
                sourceLink: sourceLinkRoot + '/wreckingBall.js'
            }
        ]
    });

    document.body.appendChild(demo.dom.root);

    MatterTools.Demo.start(demo);
})();
