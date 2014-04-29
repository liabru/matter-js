/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Inspector
*/

var Inspector = {};

(function() {

    var _key,
        $body;

    /**
     * Creates a new inspector tool and inserts it into the page. Requires jQuery and jsTree.
     * @method create
     * @param {engine} engine
     * @param {object} options
     * @return {inspector} A container for a configured dat.inspector
     */
    Inspector.create = function(engine, options) {
        if (!jQuery || !$.fn.jstree) {
            console.log('Could not create inspector. Check jQuery and jsTree libraries are loaded first.');
            return;
        }

        var inspector = {
            controls: {
                container: null,
                worldTree: null
            },
            engine: engine,
            isPaused: false,
            selected: [],
            selectStart: null,
            selectEnd: null,
            selectBounds: Bounds.create(),
            root: Composite.create()
        };

        if (Resurrect) {
            inspector.serializer = new Resurrect({ prefix: '$' });
            inspector.serializer.parse = inspector.serializer.resurrect;
        } else {
            inspector.serializer = JSON;
        }

        $body = $('body');
        _key = window.key || {};
        Inspector.instance = inspector;

        Composite.add(inspector.root, engine.world);
        engine.world.parent = null;

        _initControls(inspector);
        _initEngineEvents(inspector);
        _initTree(inspector);
        _initKeybinds(inspector);
        _setPaused(inspector, true);
        
        return inspector;
    };

    var _initControls = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls;

        var $inspectorContainer = $('<div class="ins-container">'),
            $buttonGroup = $('<div class="ins-control-group">'),
            $importButton = $('<button class="ins-import-button ins-button">Import</button>'),
            $exportButton = $('<button class="ins-export-button ins-button">Export</button>'),
            $pauseButton = $('<button class="ins-pause-button ins-button">Pause</button>');
        
        $buttonGroup.append($pauseButton, $importButton, $exportButton);
        $inspectorContainer.prepend($buttonGroup);
        $body.prepend($inspectorContainer);

        controls.pauseButton = $pauseButton;
        controls.importButton = $importButton;
        controls.exportButton = $exportButton;
        controls.container = $inspectorContainer;

        controls.pauseButton.click(function() {
            _setPaused(inspector, !inspector.isPaused);
        });

        controls.exportButton.click(function() {
            _exportFile(inspector);
        });

        controls.importButton.click(function() {
            _importFile(inspector);
        });
    };

    var _initKeybinds = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls;

        _key('shift+space', function() {
            _setPaused(inspector, !inspector.isPaused);
        });

        _key('shift+o', function() {
            _exportFile(inspector);
        });

        _key('shift+i', function() {
            _importFile(inspector);
        });

        // prevent the backspace key from navigating back
        // http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
        $(document).unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) || d.tagName.toUpperCase() === 'TEXTAREA') {
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

    var _initTree = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls,
            deferTimeout;

        var worldTreeOptions = {
            'core': {
                'check_callback': true
            },
            'dnd': {
                'copy': false
            },
            'types': {
                'body': {
                    'valid_children': []
                },
                'constraint': {
                    'valid_children': []
                },
                'composite': {
                    'valid_children': []
                },
                'bodies': {
                    'valid_children': ['body']
                },
                'constraints': {
                    'valid_children': ['constraint']
                },
                'composites': {
                    'valid_children': ['composite']
                }
            },
            'plugins' : ['dnd', 'types', 'unique']
        };

        controls.worldTree = $('<div class="ins-world-tree">').jstree(worldTreeOptions);
        controls.container.prepend(controls.worldTree);

        controls.worldTree.on('changed.jstree', function(event, data) {
            var selected = [],
                worldTree = controls.worldTree.data('jstree');

            if (data.action !== 'select_node')
                return;

            // defer selection update until selection has finished propagating
            clearTimeout(deferTimeout);
            deferTimeout = setTimeout(function() {
                data.selected = worldTree.get_selected();

                for (var i = 0; i < data.selected.length; i++) {
                    var nodeId = data.selected[i],
                        objectType = nodeId.split('_')[0],
                        objectId = nodeId.split('_')[1],
                        worldObject = Composite.get(engine.world, objectId, objectType);

                    switch (objectType) {

                    case 'body':
                    case 'constraint':

                        selected.push(worldObject);

                        break;

                    case 'composite':
                    case 'composites':
                    case 'bodies':
                    case 'constraints':

                        if (objectType === 'composite')
                            selected.push(worldObject);

                        var node = worldTree.get_node(nodeId),
                            children = worldTree.get_node(nodeId).children;

                        for (var j = 0; j < children.length; j++) 
                            worldTree.select_node(children[j], false);

                        break;

                    }
                }

                _setSelectedObjects(inspector, selected);

            }, 1);
        });

        $(document).on('dnd_stop.vakata', function(event, data) {
            var worldTree = controls.worldTree.data('jstree'),
                nodes = data.data.nodes;

            // handle drag and drop
            // move items between composites
            for (var i = 0; i < nodes.length; i++) {
                var node = worldTree.get_node(nodes[i]),
                    parentNode = worldTree.get_node(worldTree.get_parent(nodes[i])),
                    prevCompositeId = node.data.compositeId,
                    newCompositeId = parentNode.data.compositeId;

                if (prevCompositeId === newCompositeId)
                    continue;

                var nodeId = nodes[i],
                    objectType = nodeId.split('_')[0],
                    objectId = nodeId.split('_')[1],
                    worldObject = Composite.get(inspector.root, objectId, objectType),
                    prevComposite = Composite.get(inspector.root, prevCompositeId, 'composite'),
                    newComposite = Composite.get(inspector.root, newCompositeId, 'composite');

                Composite.move(prevComposite, worldObject, newComposite);
                node.data.compositeId = newCompositeId;
            }
        });

        controls.worldTree.on('dblclick.jstree', function(event, data) {
            _setPaused(inspector, true);
        });
    };

    var _initEngineEvents = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls;

        Events.on(engine, 'tick', function() {
            if (engine.world.isModified) {
                var data = _generateCompositeTreeNode(engine.world);
                _updateTree(controls.worldTree.data('jstree'), data);
                _setSelectedObjects(inspector, []);
            }

            if (key.isPressed('del') || key.isPressed('backspace')) {
                var objects = [],
                    worldTree = inspector.controls.worldTree.data('jstree');

                for (var i = 0; i < inspector.selected.length; i++) {
                    var object = inspector.selected[i].data;

                    if (object === inspector.engine.world)
                        continue;

                    objects.push(object);
                    worldTree.delete_node(object.type + '_' + object.id);
                }

                Composite.remove(inspector.root, objects, true);
                _setSelectedObjects(inspector, []);
            }
        });

        Events.on(engine, 'mouseup', function(event) {
            $body.removeClass('ins-cursor-move');

            // select objects in region if making a region selection
            if (inspector.selectStart !== null) {
                var selected = Query.region(Composite.allBodies(engine.world), inspector.selectBounds);
                _setSelectedObjects(inspector, selected);
            }

            // clear selection region
            inspector.selectStart = null;
            inspector.selectEnd = null;
            Events.trigger(inspector, 'selectEnd');
        });

        Events.on(engine, 'mousedown', function(event) {
            var mouse = event.mouse,
                engine = event.source,
                bodies = Composite.allBodies(engine.world),
                constraints = Composite.allConstraints(engine.world),
                isUnionSelect = _key.shift || _key.control,
                worldTree = inspector.controls.worldTree.data('jstree'),
                i;

            $body.removeClass('ins-cursor-move ins-cursor-rotate ins-cursor-scale');

            if (mouse.button === 2) {
                var hasSelected = false;

                for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i];

                    if (Bounds.contains(body.bounds, mouse.position) && Vertices.contains(body.vertices, mouse.position)) {

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

                        if (constraint.label.indexOf('Mouse Constraint') !== -1)
                            continue;

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

                    if (!hasSelected) {
                        worldTree.deselect_all(true);
                        _setSelectedObjects(inspector, []);

                        inspector.selectStart = Common.clone(mouse.position);
                        inspector.selectEnd = Common.clone(mouse.position);
                        Bounds.update(inspector.selectBounds, [inspector.selectStart, inspector.selectEnd]);
                    
                        Events.trigger(inspector, 'selectStart');
                    } else {
                        inspector.selectStart = null;
                        inspector.selectEnd = null;
                    }
                }
            }

            if (mouse.button === 2 && inspector.selected.length > 0) {
                $body.addClass('ins-cursor-move');

                for (i = 0; i < inspector.selected.length; i++) {
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
        });

        var mousePrevPosition = { x: 0, y: 0 };

        Events.on(engine, 'mousemove', function(event) {
            var mouse = event.mouse,
                selected = inspector.selected,
                item,
                data,
                i;

            $body.removeClass('ins-cursor-move ins-cursor-rotate ins-cursor-scale');

            if (_key.shift && _key.isPressed('r')) {
                $body.addClass('ins-cursor-rotate');

                // roate mode
                for (i = 0; i < selected.length; i++) {
                    item = selected[i];
                    data = item.data;

                    switch (data.type) {

                    case 'body':

                        var angle = Common.sign(mouse.position.x - mousePrevPosition.x) * 0.05;
                        Body.rotate(data, angle);

                        break;

                    }
                }

                mousePrevPosition = Common.clone(mouse.position);
                return;
            }

            if (_key.shift && _key.isPressed('s')) {
                $body.addClass('ins-cursor-scale');

                // scale mode
                for (i = 0; i < selected.length; i++) {
                    item = selected[i];
                    data = item.data;

                    switch (data.type) {

                    case 'body':

                        var scale = 1 + Common.sign(mouse.position.x - mousePrevPosition.x) * 0.02;
                        Body.scale(data, scale, scale);

                        if (data.circleRadius)
                            data.circleRadius *= scale;

                        break;

                    }
                }

                mousePrevPosition = Common.clone(mouse.position);
                return;
            }

            if (mouse.button !== 2 || mouse.sourceEvents.mousedown || mouse.sourceEvents.mouseup)
                return;

            // update region selection
            if (inspector.selectStart !== null) {
                inspector.selectEnd.x = mouse.position.x;
                inspector.selectEnd.y = mouse.position.y;
                Bounds.update(inspector.selectBounds, [inspector.selectStart, inspector.selectEnd]);
                return;
            }

            $body.addClass('ins-cursor-move');

            // translate mode
            for (i = 0; i < selected.length; i++) {
                item = selected[i];
                data = item.data;

                switch (data.type) {

                case 'body':

                    var delta = {
                        x: mouse.position.x - data.position.x - item.mousedownOffset.x,
                        y: mouse.position.y - data.position.y - item.mousedownOffset.y
                    };

                    Body.translate(data, delta);
                    data.positionPrev.x = data.position.x;
                    data.positionPrev.y = data.position.y;

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
        });

        // can only render if a render context is exposed
        if (engine.render && engine.render.context) {
            Events.on(engine, 'afterRender', function() {
                _render(inspector);
            });
        }
    };

    var _setPaused = function(inspector, isPaused) {
        if (isPaused) {
            inspector.engine.timing.timeScale = 0;
            inspector.isPaused = true;
            inspector.controls.pauseButton.text('Play');
        } else {
            inspector.engine.timing.timeScale = 1;
            inspector.isPaused = false;
            inspector.controls.pauseButton.text('Pause');
        }
    };

    var _setSelectedObjects = function(inspector, objects) {
        var worldTree = inspector.controls.worldTree.data('jstree'),
            selectedItems = [],
            data;

        for (var i = 0; i < inspector.selected.length; i++) {
            data = inspector.selected[i].data;
            worldTree.deselect_node(data.type + '_' + data.id, true);
        }

        inspector.selected = [];
        console.clear();

        for (i = 0; i < objects.length; i++) {
            data = objects[i];

            if (!data)
                continue;

            // add the object to the selection
            _addSelectedObject(inspector, data);

            // log selected objects to console for property inspection
            if (i < 5) {
                console.log(data.label + ' ' + data.id + ': %O', data);
            } else if (i === 6) {
                console.warn('Omitted inspecting ' + (objects.length - 5) + ' more objects');
            }
        }
    };

    var _addSelectedObject = function(inspector, object) {
        if (!object)
            return;

        var worldTree = inspector.controls.worldTree.data('jstree');

        inspector.selected.push({
            data: object
        });

        worldTree.select_node(object.type + '_' + object.id, true);
    };

    var _render = function(inspector) {
        var engine = inspector.engine,
            mouse = engine.input.mouse,
            context = engine.render.context,
            selected = inspector.selected,
            bounds;

        for (var i = 0; i < selected.length; i++) {
            var item = selected[i].data;

            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(255,165,0,0.8)';

            switch (item.type) {

            case 'body':

                // render body selections
                bounds = item.bounds;
                context.beginPath();
                context.rect(Math.floor(bounds.min.x - 3), Math.floor(bounds.min.y - 3), 
                             Math.floor(bounds.max.x - bounds.min.x + 6), Math.floor(bounds.max.y - bounds.min.y + 6));
                context.closePath();
                context.stroke();

                break;

            case 'constraint':

                // render constraint selections
                var point = item.pointA;
                if (item.bodyA)
                    point = item.pointB;
                context.beginPath();
                context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                context.closePath();
                context.stroke();

                break;

            }

            context.translate(-0.5, -0.5);
        }

        // render selection region
        if (inspector.selectStart !== null) {
            context.translate(0.5, 0.5);
            context.lineWidth = 1;
            context.setLineDash([1,2]);
            context.strokeStyle = 'rgba(255,165,0,0.5)';
            bounds = inspector.selectBounds;
            context.beginPath();
            context.rect(Math.floor(bounds.min.x), Math.floor(bounds.min.y), 
                         Math.floor(bounds.max.x - bounds.min.x), Math.floor(bounds.max.y - bounds.min.y));
            context.closePath();
            context.stroke();
            context.setLineDash([0]);
            context.translate(-0.5, -0.5);
        }
    };

    var _updateTree = function(tree, data) {
        data.state = data.state || { opened: true };
        tree.settings.core.data = tree.settings.core.data || [data];
        tree.settings.core.data[tree.settings.core.data.length - 1] = data;
        tree.refresh(-1);
    };

    var _generateCompositeTreeNode = function(composite, compositeId) {
        var node = {
            id: 'composite_' + composite.id,
            data: {
                compositeId: compositeId,
            },
            type: 'composite',
            text: (composite.label ? composite.label : 'Composite') + ' ' + composite.id,
            children: [],
            'li_attr': {
                'class': 'jstree-node-type-composite'
            }
        };

        var childNode = _generateBodiesTreeNode(composite.bodies, composite.id);
        childNode.id = 'bodies_' + composite.id;
        node.children.push(childNode);

        childNode = _generateConstraintsTreeNode(composite.constraints, composite.id);
        childNode.id = 'constraints_' + composite.id;
        node.children.push(childNode);

        childNode = _generateCompositesTreeNode(composite.composites, composite.id);
        childNode.id = 'composites_' + composite.id;
        node.children.push(childNode);

        return node;
    };

    var _generateCompositesTreeNode = function(composites, compositeId) {
        var node = {
            type: 'composites',
            text: 'Composites',
            data: {
                compositeId: compositeId,
            },
            children: [],
            'li_attr': {
                'class': 'jstree-node-type-composites'
            }
        };

        for (var i = 0; i < composites.length; i++) {
            var composite = composites[i];
            node.children.push(_generateCompositeTreeNode(composite, compositeId));
        }

        return node;
    };

    var _generateBodiesTreeNode = function(bodies, compositeId) {
        var node = {
            type: 'bodies',
            text: 'Bodies',
            data: {
                compositeId: compositeId,
            },
            children: [],
            'li_attr': {
                'class': 'jstree-node-type-bodies'
            }
        };

        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            node.children.push({
                type: 'body',
                id: 'body_' + body.id,
                data: {
                    compositeId: compositeId,
                },
                text: (body.label ? body.label : 'Body') + ' ' + body.id,
                'li_attr': {
                    'class': 'jstree-node-type-body'
                }
            });
        }

        return node;
    };

    var _generateConstraintsTreeNode = function(constraints, compositeId) {
        var node = {
            type: 'constraints',
            text: 'Constraints',
            data: {
                compositeId: compositeId,
            },
            children: [],
            'li_attr': {
                'class': 'jstree-node-type-constraints'
            }
        };

        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            node.children.push({
                type: 'constraint',
                id: 'constraint_' + constraint.id,
                data: {
                    compositeId: compositeId,
                },
                text: (constraint.label ? constraint.label : 'Constraint') + ' ' + constraint.id,
                'li_attr': {
                    'class': 'jstree-node-type-constraint'
                }
            });
        }

        return node;
    };

    var _exportFile = function(inspector) {
        var engine = inspector.engine,
            toExport = [];

        if (inspector.serializer) {
            for (var i = 0; i < inspector.selected.length; i++)
                toExport.push(inspector.selected[i].data);

            var json = inspector.serializer.stringify(toExport, function(key, value) {
                // skip non-required values
                if (key === 'path')
                    return undefined;

                // limit precision of floats
                if (!/^#/.exec(key) && typeof value === 'number') {
                    return parseFloat(value.toFixed(2));
                }
                return value;
            }, 4);

            var blob = new Blob([json], { type: 'application/json' }),
                anchor = document.createElement('a');

            anchor.download = 'world.json';
            anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
            anchor.dataset.downloadurl = ['application/json', anchor.download, anchor.href].join(':');
            anchor.click();

            Events.trigger(inspector, 'export');
        }
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
                    var importedObjects;

                    if (inspector.serializer)
                        importedObjects = inspector.serializer.parse(reader.result);

                    if (importedObjects) {
                        var importedComposite = Composite.create({
                            label: 'Imported Objects'
                        });

                        for (var i = 0; i < importedObjects.length; i++) {
                            var object = importedObjects[i];
                            if (object.type === 'body') {
                                object.id = Body.nextId();
                                Composite.add(importedComposite, object);
                            }
                        }

                        var worldTree = inspector.controls.worldTree.data('jstree'),
                            data = _generateCompositeTreeNode(importedComposite),
                            coreData = worldTree.settings.core.data;

                        coreData.unshift(data);
                        worldTree.refresh(-1);
                        Composite.add(inspector.root, importedComposite);
                    }
                };

                reader.readAsText(file);    
            } else {
                alert('File not supported, JSON text files only');
            }
        });

        fileInput.click();
    };

    /*
    *
    *  Events Documentation
    *
    */

    /**
    * Fired after the inspector's import button pressed
    *
    * @event export
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the inspector's export button pressed
    *
    * @event import
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the inspector user starts making a selection
    *
    * @event selectStart
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the inspector user ends making a selection
    *
    * @event selectEnd
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

})();