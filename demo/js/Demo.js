/**
* The Matter.js development demo and testing tool.
*
* This demo uses MatterTools, you can see the wiki for a simple example instead:
* https://github.com/liabru/matter-js/wiki/Getting-started
*
* NOTE: For the actual example code, refer to the source files in `/examples/`.
*
* @class Demo
*/

(function() {
    var examples = [ 
        { name: 'Air Friction', id: 'airFriction' },
        { name: 'Avalanche', id: 'avalanche' },
        { name: 'Ball Pool', id: 'ballPool' },
        { name: 'Bridge', id: 'bridge' },
        { name: 'Broadphase', id: 'broadphase' },
        { name: 'Car', id: 'car' },
        { name: 'Catapult', id: 'catapult' },
        { name: 'Chains', id: 'chains' },
        { name: 'Circle Stack', id: 'circleStack' },
        { name: 'Cloth', id: 'cloth' },
        { name: 'Collision Filtering', id: 'collisionFiltering' },
        { name: 'Composite Manipulation', id: 'compositeManipulation' },
        { name: 'Compound Bodies', id: 'compound' },
        { name: 'Compound Stack', id: 'compoundStack' },
        { name: 'Concave', id: 'concave' },
        { name: 'Constraints', id: 'constraints' },
        { name: 'Double Pendulum', id: 'doublePendulum' },
        { name: 'Events', id: 'events' },
        { name: 'Friction', id: 'friction' },
        { name: 'Reverse Gravity', id: 'gravity' },
        { name: 'Gyroscope', id: 'gyro' },
        { name: 'Manipulation', id: 'manipulation' },
        { name: 'Mixed Shapes', id: 'mixed' },
        { name: 'Newton\'s Cradle', id: 'newtonsCradle' },
        { name: 'Ragdoll', id: 'ragdoll' },
        { name: 'Pyramid', id: 'pyramid' },
        { name: 'Raycasting', id: 'raycasting' },
        { name: 'Restitution', id: 'restitution' },
        { name: 'Rounded Corners (Chamfering)', id: 'rounded' },
        { name: 'Sensors', id: 'sensors' },
        { name: 'Sleeping', id: 'sleeping' },
        { name: 'Slingshot', id: 'slingshot' },
        { name: 'Soft Body', id: 'softBody' },
        { name: 'Sprites', id: 'sprites' },
        { name: 'Stack', id: 'stack' },
        { name: 'Static Friction', id: 'staticFriction' },
        { name: 'Stress', id: 'stress' },
        { name: 'Stress 2', id: 'stress2' },
        { name: 'Concave SVG Paths', id: 'svg' },
        { name: 'Terrain', id: 'terrain' },
        { name: 'Time Scaling', id: 'timescale' },
        { name: 'Views', id: 'views' },
        { name: 'Wrecking Ball', id: 'wreckingBall' } 
    ];

    var sourceLinkRoot = 'https://github.com/liabru/matter-js/blob/master/examples';

    for (var i = 0; i < examples.length; i += 1) {
        var example = examples[i];
        example.sourceLink = sourceLinkRoot + '/' + example.id + '.js';
        example.init = window.Example[example.id];

        if (!example.init) {
            console.warn('Example not loaded:', example.id);
        }
    }

    if (window.location.search.indexOf('compare') >= 0) {
        var compareScript = document.createElement('script');
        compareScript.src = '../js/Compare.js';
        window.MatterDemo = { examples: examples };
        document.body.append(compareScript);
        return;
    }

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
        examples: examples
    });

    document.body.appendChild(demo.dom.root);

    MatterTools.Demo.start(demo);
})();
