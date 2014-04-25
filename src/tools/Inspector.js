/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Inspector
*/

var Inspector = {};

(function() {

    var _key;

    /**
     * Creates a new inspector tool and inserts it into the page. Requires jQuery and jsTree.
     * @method create
     * @param {engine} engine
     * @param {object} options
     * @return {inspector} A container for a configured dat.inspector
     */
    Inspector.create = function(engine, options) {
        if (!jQuery || !$.fn.jstree) {
            console.log("Could not create inspector. Check jQuery and jsTree libraries are loaded first.");
            return;
        }

        _key = window.key || {};

        var inspector = {
            controls: {
                container: null,
                worldTree: null
            },
            engine: engine,
            isPaused: false,
            selected: []
        };

        if (Resurrect) {
            inspector.serializer = new Resurrect({ prefix: '$' });
            inspector.serializer.parse = inspector.serializer.resurrect;
        } else {
            inspector.serializer = JSON;
        }

        _initControls(inspector);
        _initEvents(inspector);
        
        return inspector;
    };

    var _initControls = function(inspector) {
        var engine = inspector.engine;

        var $inspectorContainer = $('<div class="inspector-container">'),
            $worldTree = $('<div class="world-tree">').jstree(),
            $buttonGroup = $('<div class="ins-control-group">')
            $importButton = $('<button class="ins-import-button ins-button">Import</button>'),
            $exportButton = $('<button class="ins-export-button ins-button">Export</button>'),
            $pauseButton = $('<button class="ins-pause-button ins-button">Pause</button>');
        
        $buttonGroup.append($pauseButton, $importButton, $exportButton);
        $inspectorContainer.prepend($buttonGroup, $worldTree);
        $('body').prepend($inspectorContainer);

        inspector.controls.worldTree = $worldTree;
        inspector.controls.pauseButton = $pauseButton;
        inspector.controls.importButton = $importButton;
        inspector.controls.exportButton = $exportButton;
        inspector.controls.container = $inspectorContainer;
    };

    var _initEvents = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls;

        var mainSelection = [];

        controls.worldTree.on('changed.jstree', function(event, data) {
            var selected = [];

            data.selected = data.selected || [data.node.id];

            for (var i = 0; i < data.selected.length; i++) {
                var nodeId = data.selected[i],
                    objectType = nodeId.split('_')[0],
                    objectId = nodeId.split('_')[1],
                    worldObject = Composite.get(engine.world, objectType, objectId);

                switch (objectType) {
                    case 'body':
                    case 'constraint':
                        selected.push(worldObject);
                    break;
                }
            }

            if (data.action === 'select_node')
                _setSelectedObjects(inspector, mainSelection = selected);

            if (data.action === 'hover_node' && mainSelection.length <= 1)
                _setSelectedObjects(inspector, selected);

            if (data.action === 'dehover_node')
                _setSelectedObjects(inspector, mainSelection);
        });

        controls.pauseButton.click(function() {
            if (!inspector.isPaused) {
                engine.timing.timeScale = 0;
                inspector.isPaused = true;
                $(this).text('Play');
            } else {
                engine.timing.timeScale = 1;
                inspector.isPaused = false;
                $(this).text('Pause');
                _setSelectedObjects(inspector, []);
            }
        });

        controls.exportButton.click(function() {
            _exportFile(inspector);
        });

        controls.importButton.click(function() {
            _importFile(inspector);
        });

        Events.on(engine, 'tick', function() {
            if (engine.world.isModified) {
                var data = _generateCompositeTreeNode(engine.world);
                _updateTree(controls.worldTree.data("jstree"), data);
            }

            if (key.isPressed('del') || key.isPressed('backspace')) {
                var objects = [];

                for (var i = 0; i < inspector.selected.length; i++)
                    objects.push(inspector.selected[i].data);

                Composite.remove(engine.world, objects, true);
                _setSelectedObjects(inspector, []);
            }
        });

        Events.on(engine, 'mousedown', function(event) {
            if (inspector.isPaused) {
                var mouse = event.mouse,
                    engine = event.source,
                    bodies = Composite.allBodies(engine.world),
                    constraints = Composite.allConstraints(engine.world),
                    isUnionSelect = _key.shift || _key.control;

                if (mouse.button === 0) {
                    var hasSelected = false;

                    for (var i = 0; i < bodies.length; i++) {
                        var body = bodies[i];

                        if (Bounds.contains(body.bounds, mouse.position) 
                              && Vertices.contains(body.vertices, mouse.position)) {

                            if (isUnionSelect) {
                                _addSelectedObject(inspector, body);
                            } else {
                                _setSelectedObjects(inspector, [body]);
                            }

                            hasSelected = true;
                            break;
                        }
                    }

                    if (!hasSelected) {
                        for (i = 0; i < constraints.length; i++) {
                            var constraint = constraints[i],
                                bodyA = constraint.bodyA,
                                bodyB = constraint.bodyB;

                            var pointAWorld = constraint.pointA,
                                pointBWorld = constraint.pointB;
                            if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                            if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

                            if (!pointAWorld || !pointBWorld)
                                continue;

                            var distA = Vector.magnitudeSquared(Vector.sub(mouse.position, pointAWorld)),
                                distB = Vector.magnitudeSquared(Vector.sub(mouse.position, pointBWorld));

                            if (distA < 100 || distB < 100) {
                                if (isUnionSelect) {
                                    _addSelectedObject(inspector, constraint);
                                } else {
                                    _setSelectedObjects(inspector, [constraint]);
                                }

                                hasSelected = true;
                                break;
                            }
                        }

                        if (!hasSelected)
                            _setSelectedObjects(inspector, []);
                    }
                }

                if (mouse.button === 0 && inspector.selected.length > 0) {
                    for (var i = 0; i < inspector.selected.length; i++) {
                        var item = inspector.selected[i],
                            data = item.data;

                        if (data.position) {
                            item.mousedownOffset = {
                                x: mouse.position.x - data.position.x,
                                y: mouse.position.y - data.position.y
                            };
                        } else if (data.pointA && !data.bodyA) {
                            item.mousedownOffset = {
                                x: mouse.position.x - data.pointA.x,
                                y: mouse.position.y - data.pointA.y
                            };
                        } else if (data.pointB && !data.bodyB) {
                            item.mousedownOffset = {
                                x: mouse.position.x - data.pointB.x,
                                y: mouse.position.y - data.pointB.y
                            };
                        }
                    }
                }
            }
        });

        Events.on(engine, 'mousemove', function(event) {
            var mouse = event.mouse,
                selected = inspector.selected;

            if (inspector.isPaused) {
                if (mouse.button !== 0 || mouse.sourceEvents.mousedown || mouse.sourceEvents.mouseup)
                    return;

                for (var i = 0; i < selected.length; i++) {
                    var item = selected[i],
                        data = item.data;

                    switch (data.type) {
                        case 'body':

                        var delta = {
                            x: mouse.position.x - data.position.x - item.mousedownOffset.x,
                            y: mouse.position.y - data.position.y - item.mousedownOffset.y
                        };

                        Body.translate(data, delta);

                        break;

                        case 'constraint':

                        var point = data.pointA;
                        if (data.bodyA)
                            point = data.pointB;

                        point.x = mouse.position.x - item.mousedownOffset.x;
                        point.y = mouse.position.y - item.mousedownOffset.y;

                        var initialPointA = data.bodyA ? Vector.add(data.bodyA.position, data.pointA) : data.pointA,
                            initialPointB = data.bodyB ? Vector.add(data.bodyB.position, data.pointB) : data.pointB;

                        data.length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));

                        break;
                    }
                }
            }
        });

        // can only render if a render context is exposed
        if (engine.render && engine.render.context) {
            Events.on(engine, 'afterRender', function() {
                _render(inspector);
            });
        }

        // prevent the backspace key from navigating back
        // http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
        $(document).unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) 
                     || d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });
    };

    var _setSelectedObjects = function(inspector, objects) {
        var worldTree = inspector.controls.worldTree.data("jstree"),
            selectedItems = [];

        for (var i = 0; i < inspector.selected.length; i++) {
            var item = inspector.selected[i],
                data = item.data;

            worldTree.deselect_node(data.type + "_" + data.id, true);
        }

        inspector.selected = [];

        for (i = 0; i < objects.length; i++) {
            var data = objects[i];
            _addSelectedObject(inspector, data);
            worldTree.select_node(data.type + "_" + data.id, true);
        }
    };

    var _addSelectedObject = function(inspector, object) {
        inspector.selected.push({
            data: object
        });
    };

    var _render = function(inspector) {
        var engine = inspector.engine,
            mouse = engine.input.mouse,
            context = engine.render.context,
            selected = inspector.selected;

        for (var i = 0; i < selected.length; i++) {
            var item = selected[i].data;

            switch (item.type) {
                case 'body':

                var bounds = item.bounds;

                context.beginPath();
                context.rect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(255,165,0,0.7)';
                context.closePath();
                context.stroke();

                break;

                case 'constraint':

                var point = item.pointA;

                if (item.bodyA)
                    point = item.pointB;

                context.beginPath();
                context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(255,165,0,0.7)';
                context.closePath();
                context.stroke();

                break;
            }
        }
    };

    var _updateTree = function(tree, data) {
        data.state = data.state || { opened: true };
        tree.settings.core.data = data;
        tree.refresh(-1);
    };

    var _generateCompositeTreeNode = function(composite) {
        var node = {
            id: 'composite_' + composite.id,
            text: (composite.label ? composite.label : 'Composite') + ' ' + composite.id,
            children: []
        };

        if (composite.bodies.length > 0)
            node.children.push(_generateBodiesTreeNode(composite.bodies));

        if (composite.constraints.length > 0)
            node.children.push(_generateConstraintsTreeNode(composite.constraints));

        if (composite.composites.length > 0)
            node.children.push(_generateCompositesTreeNode(composite.composites));

        return node;
    };

    var _generateCompositesTreeNode = function(composites) {
        var node = {
            text: 'Composites',
            children: []
        };

        for (var i = 0; i < composites.length; i++) {
            var composite = composites[i];
            node.children.push(_generateCompositeTreeNode(composite));
        }

        return node;
    };

    var _generateBodiesTreeNode = function(bodies) {
        var node = {
            text: 'Bodies',
            children: []
        };

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            node.children.push({
                id: 'body_' + body.id,
                text: (body.label ? body.label : 'Body') + ' ' + body.id,
            });
        }

        return node;
    };

    var _generateConstraintsTreeNode = function(constraints) {
        var node = {
            text: 'Constraints',
            children: []
        };

        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            node.children.push({
                id: 'constraint_' + constraint.id,
                text: (constraint.label ? constraint.label : 'Constraint') + ' ' + constraint.id,
            });
        }

        return node;
    };

    var _exportFile = function(inspector) {
        var engine = inspector.engine;

        if (inspector.serializer) {
            var json = inspector.serializer.stringify(engine.world, function(key, value) {
                // skip non-required values
                if (key === 'path')
                    return undefined;

                // limit precision of floats
                if (!/^#/.exec(key) && typeof value === 'number') {
                    return parseFloat(value.toFixed(2));
                }
                return value;
            });

            var blob = new Blob([json], { type: 'application/json' }),
                anchor = document.createElement('a');

            anchor.download = "world.json";
            anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
            anchor.dataset.downloadurl = ['application/json', anchor.download, anchor.href].join(':');
            anchor.click();
        }

        Events.trigger(inspector, 'save');
    };

    var _importFile = function(inspector) {
        var engine = inspector.engine;

        var element = document.createElement('div');
        element.innerHTML = '<input type="file">';
        var fileInput = element.firstChild;

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];

            if (file.name.match(/\.(txt|json)$/)) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    var loadedWorld;

                    if (inspector.serializer)
                        loadedWorld = inspector.serializer.parse(reader.result);

                    if (loadedWorld) {
                        Engine.merge(engine, { world: loadedWorld });
                    }

                    Events.trigger(inspector, 'load');
                }

                reader.readAsText(file);    
            } else {
                alert("File not supported, JSON text files only");
            }
        });

        fileInput.click();
    };

})();