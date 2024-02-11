/**
* A Matter.js multi example testbed based on MatterTools.
*
* Tool to interactively test multiple examples at once.
*
* USAGE: [host]?multi#[example1,example2,example3...]
*  e.g. http://localhost:8000/?multi#mixed
*
* @module Multi
*/

var MatterTools = require('matter-tools');

var multi = function(examples, isDev) {
    var demo = MatterTools.Demo.create({
        toolbar: {
            title: 'matter-js ・ ' + (isDev ? 'dev' : '') + ' ・ multi',
            url: 'https://github.com/liabru/matter-js',
            reset: false,
            source: false,
            inspector: false,
            tools: false,
            fullscreen: false,
            exampleSelect: false
        },
        tools: {
            inspector: false,
            gui: false
        },
        inline: false,
        preventZoom: false,
        resetOnOrientation: false,
        routing: false,
        startExample: false
    });

    var urlHash = window.location.hash,
        allExampleIds = examples.map(function(example) { return example.id; }),
        exampleIds = urlHash ? urlHash.slice(1).split(',') : allExampleIds.slice(0, 4),
        exampleCount = Math.ceil(Math.sqrt(exampleIds.length));

    var container = document.createElement('div');
    container.style = 'display: grid; grid-template-columns: repeat(' + exampleCount + ', 1fr); grid-template-rows: repeat(' + exampleCount + ', 1fr); max-width: calc(100vmin * 1.25 - 40px); max-height: 100vmin;';

    demo.dom.root.appendChild(container);
    document.body.appendChild(demo.dom.root);

    document.title = 'Matter.js Multi' + (isDev ? ' ・ Dev' : '');
    console.info('Demo.Multi: matter-js@' + Matter.version);

    // always show debug info
    Matter.before('Render.create', function(renderOptions) {
        renderOptions.options.showDebug = true;
    });

    Matter.after('Runner.create', function() {
        this.isFixed = true;
    });

    var runExamples = function(exampleIds) {
        for (var i = 0; i < exampleIds.length; i += 1) {
            var exampleId = exampleIds[i],
                example = examples.find(function(example) { return example.id === exampleId; });

            if (!example) {
                continue;
            }

            var canvas = example.init().render.canvas;
            container.appendChild(canvas);
        }
    };

    runExamples(exampleIds);

    // arrow key navigation of examples
    document.addEventListener('keyup', function(event) {
        var isBackKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp',
            isForwardKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';

        if (isBackKey || isForwardKey) {
            var direction = isBackKey ? -1 : 1;

            var currentExampleIndex = allExampleIds.findIndex(function(exampleId) { 
                return exampleId === exampleIds[0];
            });

            var nextExampleId = (allExampleIds.length + currentExampleIndex + direction * exampleIds.length) % allExampleIds.length,
                nextExamples = allExampleIds.slice(nextExampleId, (nextExampleId + exampleIds.length) % allExampleIds.length);

            window.location.hash = nextExamples.join(',');
            window.location.reload();
        }
    });
};

module.exports = { multi: multi };
