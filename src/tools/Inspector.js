/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) 
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class Inspector
*/

var Inspector = {};

(function() {

    var _key,
        _isWebkit = 'WebkitAppearance' in document.documentElement.style,
        $body;

    /**
     * Creates a new inspector tool and inserts it into the page. Requires keymaster, jQuery, jsTree libraries.
     * @method create
     * @param {engine} engine
     * @param {object} options
     * @return {inspector} An inspector
     */
    Inspector.create = function(engine, options) {
        if (!jQuery || !$.fn.jstree || !window.key) {
            console.log('Could not create inspector. Check keymaster, jQuery, jsTree libraries are loaded first.');
            return;
        }

        var inspector = {
            engine: engine,
            isPaused: false,
            selected: [],
            selectStart: null,
            selectEnd: null,
            selectBounds: Bounds.create(),
            mousePrevPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            autoHide: true,
            autoRewind: true,
            hasTransitions: _isWebkit ? true : false,
            bodyClass: '',
            exportIndent: 0,
            controls: {
                container: null,
                worldTree: null
            },
            root: Composite.create({
                label: 'Root'
            })
        };

        inspector = Common.extend(inspector, options);
        Inspector.instance = inspector;

        inspector.serializer = new Resurrect({ prefix: '$', cleanup: true });
        inspector.serializer.parse = inspector.serializer.resurrect;
        localStorage.removeItem('pauseState');

        $body = $('body');
        $body.toggleClass('ins-auto-hide gui-auto-hide', inspector.autoHide);
        $body.toggleClass('ins-transitions gui-transitions', inspector.hasTransitions);

        Composite.add(inspector.root, engine.world);
        engine.world.isModified = true;
        engine.world.parent = null;
        _key = window.key;

        _initControls(inspector);
        _initEngineEvents(inspector);
        _initTree(inspector);
        _initKeybinds(inspector);

        return inspector;
    };

    var _initControls = function(inspector) {
        var engine = inspector.engine,
            controls = inspector.controls;

        var $inspectorContainer = $('<div class="ins-container">'),
            $buttonGroup = $('<div class="ins-control-group">'),
            $searchBox = $('<input class="ins-search-box" type="search" placeholder="search">'),
            $importButton = $('<button class="ins-import-button ins-button">Import</button>'),
            $exportButton = $('<button class="ins-export-button ins-button">Export</button>'),
            $pauseButton = $('<button class="ins-pause-button ins-button">Pause</button>'),
            $helpButton = $('<button class="ins-help-button ins-button">Help</button>'),
            $addCompositeButton = $('<button class="ins-add-button ins-button">+</button>');
        
        $buttonGroup.append($pauseButton, $importButton, $exportButton, $helpButton);
        $inspectorContainer.prepend($buttonGroup, $searchBox, $addCompositeButton);
        $body.prepend($inspectorContainer);

        controls.pauseButton = $pauseButton;
        controls.importButton = $importButton;
        controls.exportButton = $exportButton;
        controls.helpButton = $helpButton;
        controls.searchBox = $searchBox;
        controls.container = $inspectorContainer;
        controls.addCompositeButton = $addCompositeButton;

        controls.pauseButton.click(function() {
            _setPaused(inspector, !inspector.isPaused);
        });

        controls.exportButton.click(function() {
            _exportFile(inspector);
        });

        controls.importButton.click(function() {
            _importFile(inspector);
        });

        controls.helpButton.click(function() {
            _showHelp(inspector);
        });

        controls.addCompositeButton.click(function() {
            _addNewComposite(inspector);
        });

        var searchTimeout;
        controls.searchBox.keyup(function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function () {
                var value = controls.searchBox.val(),
                    worldTree = controls.worldTree.data('jstree');
                worldTree.search(value);
            }, 250);
        });
    };

    var _showHelp = function(inspector) {
        var help = "Matter Tools\n\n";

        help += "Drag nodes in the tree to move them between composites.\n";
        help += "Use browser's developer console to inspect selected objects.\n";
        help += "Note: selections only render if renderer supports it.\n\n";

        help += "[shift + space] pause or play simulation.\n";
        help += "[right click] and drag on empty space to select a region.\n";
        help += "[right click] and drag on an object to move it.\n";
        help += "[right click + shift] and drag to move whole selection.\n";
        help += "[del] or [backspace] delete selected objects.\n\n";

        help += "[shift + s] scale-xy selected objects with mouse or arrows.\n";
        help += "[shift + s + d] scale-x selected objects with mouse or arrows.\n";
        help += "[shift + s + f] scale-y selected objects with mouse or arrows.\n";
        help += "[shift + r] rotate selected objects with mouse or arrows.\n\n";

        help += "[shift + q] set selected objects as static (can't be undone).\n";
        help += "[shift + i] import objects.\n";
        help += "[shift + o] export selected objects.\n";
        help += "[shift + h] toggle Matter.Gui.\n";
        help += "[shift + y] toggle auto-hide.\n";
        help += "[shift + r] toggle auto-rewind on play/pause.\n\n";

        help += "[shift + j] show this help message.";

        alert(help);
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

        _key('shift+j', function() {
            _showHelp(inspector);
        });

        _key('shift+y', function() {
            inspector.autoHide = !inspector.autoHide;
            $body.toggleClass('ins-auto-hide gui-auto-hide', inspector.autoHide);
        });

        _key('shift+r', function() {
            inspector.autoRewind = !inspector.autoRewind;
            if (!inspector.autoRewind)
                localStorage.removeItem('pauseState');
        });

        _key('shift+q', function() {
            var worldTree = inspector.controls.worldTree.data('jstree');
            for (var i = 0; i < inspector.selected.length; i++) {
                var object = inspector.selected[i].data;
                if (object.type === 'body' && !object.isStatic)
                    Body.setStatic(object, true);
            }
        });

        _key('del', function() {
            _deleteSelectedObjects(inspector);
        });

        _key('backspace', function() {
            _deleteSelectedObjects(inspector);
        });

        // prevent the backspace key from navigating back
        // http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
        $(document).unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' || d.type.toUpperCase() === 'SEARCH')) || d.tagName.toUpperCase() === 'TEXTAREA') {
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
            'search': {
                'show_only_matches': true,
                'fuzzy': false
            },
            'types': {
                '#': {
                    'valid_children': []
                },
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
            'plugins' : ['dnd', 'types', 'unique', 'search']
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
                    case 'composite':
                        selected.push(worldObject);
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
            }
        });

        controls.worldTree.on('dblclick.jstree', function(event, data) {
            var worldTree = controls.worldTree.data('jstree'),
                selected = worldTree.get_selected();

            // select all children of double clicked node
            for (var i = 0; i < selected.length; i++) {
                var nodeId = selected[i],
                    objectType = nodeId.split('_')[0],
                    objectId = nodeId.split('_')[1],
                    worldObject = Composite.get(engine.world, objectId, objectType);

                switch (objectType) {
                case 'composite':
                case 'composites':
                case 'bodies':
                case 'constraints':
                    var node = worldTree.get_node(nodeId),
                        children = worldTree.get_node(nodeId).children;

                    for (var j = 0; j < children.length; j++) 
                        worldTree.select_node(children[j], false);

                    break;
                }
            }
        });
    };

    var _addBodyClass = function(inspector, classNames) {
        // only apply changes to prevent DOM lag
        if (inspector.bodyClass.indexOf(' ' + classNames) === -1) {
            $body.addClass(classNames);
            inspector.bodyClass = ' ' + $body.attr('class');
        }
    };

    var _removeBodyClass = function(inspector, classNames) {
        // only apply changes to prevent DOM lag
        var updateRequired = false,
            classes = classNames.split(' ');

        for (var i = 0; i < classes.length; i++) {
            updateRequired = inspector.bodyClass.indexOf(' ' + classes[i]) !== -1;
            if (updateRequired)
                break;
        }

        if (updateRequired) {
            $body.removeClass(classNames);
            inspector.bodyClass = ' ' + $body.attr('class');
        }
    };

    var _getMousePosition = function(inspector) {
        return Vector.add(inspector.engine.input.mouse.position, inspector.offset);
    };

    var _initEngineEvents = function(inspector) {
        var engine = inspector.engine,
            mouse = engine.input.mouse,
            mousePosition = _getMousePosition(inspector),
            controls = inspector.controls;

        Events.on(engine, 'tick', function() {
            // update mouse position reference
            mousePosition = _getMousePosition(inspector);

            var mouseDelta = mousePosition.x - inspector.mousePrevPosition.x,
                keyDelta = _key.isPressed('up') + _key.isPressed('right') - _key.isPressed('down') - _key.isPressed('left'),
                delta = mouseDelta + keyDelta;

            // update interface when world changes
            if (engine.world.isModified) {
                var data = _generateCompositeTreeNode(inspector.root, null, true);
                _updateTree(controls.worldTree.data('jstree'), data);
                _setSelectedObjects(inspector, []);
            }

            // update region selection
            if (inspector.selectStart !== null) {
                inspector.selectEnd.x = mousePosition.x;
                inspector.selectEnd.y = mousePosition.y;
                Bounds.update(inspector.selectBounds, [inspector.selectStart, inspector.selectEnd]);
            }

            // rotate mode
            if (_key.shift && _key.isPressed('r')) {
                var rotateSpeed = 0.03,
                    angle = Math.max(-2, Math.min(2, delta)) * rotateSpeed;

                _addBodyClass(inspector, 'ins-cursor-rotate');
                _rotateSelectedObjects(inspector, angle);
            } else {
                _removeBodyClass(inspector, 'ins-cursor-rotate');
            }

            // scale mode
            if (_key.shift && _key.isPressed('s')) {
                var scaleSpeed = 0.02,
                    scale = 1 + Math.max(-2, Math.min(2, delta)) * scaleSpeed;

                _addBodyClass(inspector, 'ins-cursor-scale');
                
                if (_key.isPressed('d')) {
                    scaleX = scale;
                    scaleY = 1;
                } else if (_key.isPressed('f')) {
                    scaleX = 1;
                    scaleY = scale;
                } else {
                    scaleX = scaleY = scale;
                }

                _scaleSelectedObjects(inspector, scaleX, scaleY);
            } else {
                _removeBodyClass(inspector, 'ins-cursor-scale');
            }

            // translate mode
            if (mouse.button === 2 && !mouse.sourceEvents.mousedown && !mouse.sourceEvents.mouseup) {
                _addBodyClass(inspector, 'ins-cursor-move');
                _moveSelectedObjects(inspector, mousePosition.x, mousePosition.y);
            } else {
                _removeBodyClass(inspector, 'ins-cursor-move');
            }

            inspector.mousePrevPosition = Common.clone(mousePosition);
        });

        Events.on(engine, 'mouseup', function(event) {
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
            var engine = event.source,
                bodies = Composite.allBodies(engine.world),
                constraints = Composite.allConstraints(engine.world),
                isUnionSelect = _key.shift || _key.control,
                worldTree = inspector.controls.worldTree.data('jstree'),
                i;

            if (mouse.button === 2) {
                var hasSelected = false;

                for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i];

                    if (Bounds.contains(body.bounds, mousePosition) && Vertices.contains(body.vertices, mousePosition)) {

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

                        var distA = Vector.magnitudeSquared(Vector.sub(mousePosition, pointAWorld)),
                            distB = Vector.magnitudeSquared(Vector.sub(mousePosition, pointBWorld));

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

                        inspector.selectStart = Common.clone(mousePosition);
                        inspector.selectEnd = Common.clone(mousePosition);
                        Bounds.update(inspector.selectBounds, [inspector.selectStart, inspector.selectEnd]);
                    
                        Events.trigger(inspector, 'selectStart');
                    } else {
                        inspector.selectStart = null;
                        inspector.selectEnd = null;
                    }
                }
            }

            if (mouse.button === 2 && inspector.selected.length > 0) {
                _addBodyClass(inspector, 'ins-cursor-move');

                _updateSelectedMouseDownOffset(inspector);
            }
        });

        // render hook
        Events.on(engine, 'afterRender', function() {
            var renderController = engine.render.controller,
                context = engine.render.context;
            if (renderController.inspector)
                renderController.inspector(inspector, context);
        });
    };

    var _deleteSelectedObjects = function(inspector) {
        var objects = [],
            object,
            worldTree = inspector.controls.worldTree.data('jstree'),
            i;

        // delete objects in world
        for (i = 0; i < inspector.selected.length; i++) {
            object = inspector.selected[i].data;
            if (object !== inspector.engine.world)
                objects.push(object);
        }

        // also delete non-world composites (selected only in the UI tree)
        var selectedNodes = worldTree.get_selected();
        for (i = 0; i < selectedNodes.length; i++) {
            var node = worldTree.get_node(selectedNodes[i]);
            if (node.type === 'composite') {
                node = worldTree.get_node(node.children[0]);
                if (node.data) {
                    var compositeId = node.data.compositeId;
                    object = Composite.get(inspector.root, compositeId, 'composite');
                    if (object && object !== inspector.engine.world) {
                        objects.push(object);
                        worldTree.delete_node(selectedNodes[i]);
                    }
                }
            }
        }

        Composite.remove(inspector.root, objects, true);
        _setSelectedObjects(inspector, []);
    };

    var _updateSelectedMouseDownOffset = function(inspector) {
        var selected = inspector.selected,
            mouse = inspector.engine.input.mouse,
            mousePosition = _getMousePosition(inspector),
            item,
            data;

        for (var i = 0; i < selected.length; i++) {
            item = selected[i];
            data = item.data;

            if (data.position) {
                item.mousedownOffset = {
                    x: mousePosition.x - data.position.x,
                    y: mousePosition.y - data.position.y
                };
            } else if (data.pointA && !data.bodyA) {
                item.mousedownOffset = {
                    x: mousePosition.x - data.pointA.x,
                    y: mousePosition.y - data.pointA.y
                };
            } else if (data.pointB && !data.bodyB) {
                item.mousedownOffset = {
                    x: mousePosition.x - data.pointB.x,
                    y: mousePosition.y - data.pointB.y
                };
            }
        }
    };

    var _moveSelectedObjects = function(inspector, x, y) {
        var selected = inspector.selected,
            mouse = inspector.engine.input.mouse,
            mousePosition = _getMousePosition(inspector),
            item,
            data;

        for (var i = 0; i < selected.length; i++) {
            item = selected[i];
            data = item.data;

            if (!item.mousedownOffset)
                continue;

            switch (data.type) {

            case 'body':
                var delta = {
                    x: x - data.position.x - item.mousedownOffset.x,
                    y: y - data.position.y - item.mousedownOffset.y
                };

                Body.translate(data, delta);
                data.positionPrev.x = data.position.x;
                data.positionPrev.y = data.position.y;

                break;

            case 'constraint':
                var point = data.pointA;
                if (data.bodyA)
                    point = data.pointB;

                point.x = x - item.mousedownOffset.x;
                point.y = y - item.mousedownOffset.y;

                var initialPointA = data.bodyA ? Vector.add(data.bodyA.position, data.pointA) : data.pointA,
                    initialPointB = data.bodyB ? Vector.add(data.bodyB.position, data.pointB) : data.pointB;

                data.length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));

                break;

            }
        }
    };

    var _scaleSelectedObjects = function(inspector, scaleX, scaleY) {
        var selected = inspector.selected,
            item,
            data;

        for (var i = 0; i < selected.length; i++) {
            item = selected[i];
            data = item.data;

            switch (data.type) {
            case 'body':
                Body.scale(data, scaleX, scaleY, data.position);

                if (data.circleRadius)
                    data.circleRadius *= scaleX;

                break;
            }
        }
    };

    var _rotateSelectedObjects = function(inspector, angle) {
        var selected = inspector.selected,
            item,
            data;

        for (var i = 0; i < selected.length; i++) {
            item = selected[i];
            data = item.data;

            switch (data.type) {
            case 'body':
                Body.rotate(data, angle);
                break;
            }
        }
    };

    var _setPaused = function(inspector, isPaused) {
        if (isPaused) {
            if (inspector.autoRewind) {
                _setSelectedObjects(inspector, []);
                Gui.loadState(inspector.serializer, inspector.engine, 'pauseState');
            }

            inspector.engine.timing.timeScale = 0;
            inspector.isPaused = true;
            inspector.controls.pauseButton.text('Play');

            Events.trigger(inspector, 'paused');
        } else {
            if (inspector.autoRewind) {
                Gui.saveState(inspector.serializer, inspector.engine, 'pauseState');
            }

            inspector.engine.timing.timeScale = 1;
            inspector.isPaused = false;
            inspector.controls.pauseButton.text('Pause');

            Events.trigger(inspector, 'play');
        }
    };

    var _setSelectedObjects = function(inspector, objects) {
        var worldTree = inspector.controls.worldTree.data('jstree'),
            selectedItems = [],
            data,
            i;

        for (i = 0; i < inspector.selected.length; i++) {
            data = inspector.selected[i].data;
            worldTree.deselect_node(data.type + '_' + data.id, true);
        }

        inspector.selected = [];
        console.clear();

        for (i = 0; i < objects.length; i++) {
            data = objects[i];

            if (data) {
                // add the object to the selection
                _addSelectedObject(inspector, data);

                // log selected objects to console for property inspection
                if (i < 5) {
                    console.log(data.label + ' ' + data.id + ': %O', data);
                } else if (i === 6) {
                    console.warn('Omitted inspecting ' + (objects.length - 5) + ' more objects');
                }
            }
        }
    };

    var _addSelectedObject = function(inspector, object) {
        if (!object)
            return;

        var worldTree = inspector.controls.worldTree.data('jstree');
        inspector.selected.push({ data: object });
        worldTree.select_node(object.type + '_' + object.id, true);
    };

    var _updateTree = function(tree, data) {
        data[0].state = data[0].state || { opened: true };
        tree.settings.core.data = data;
        tree.refresh(-1);
    };

    var _generateCompositeTreeNode = function(composite, compositeId, isRoot) {
        var children = [],
            node = {
                id: 'composite_' + composite.id,
                data: {
                    compositeId: compositeId,
                },
                type: 'composite',
                text: (composite.label ? composite.label : 'Composite') + ' ' + composite.id,
                'li_attr': {
                    'class': 'jstree-node-type-composite'
                }
            };

        var childNode = _generateCompositesTreeNode(composite.composites, composite.id);
        childNode.id = 'composites_' + composite.id;
        children.push(childNode);

        if (isRoot)
            return childNode.children;

        childNode = _generateBodiesTreeNode(composite.bodies, composite.id);
        childNode.id = 'bodies_' + composite.id;
        children.push(childNode);

        childNode = _generateConstraintsTreeNode(composite.constraints, composite.id);
        childNode.id = 'constraints_' + composite.id;
        children.push(childNode);

        node.children = children;

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

    var _addNewComposite = function(inspector) {
        var newComposite = Composite.create();

        Composite.add(inspector.root, newComposite);

        // move new composite to the start so that it appears top of tree
        inspector.root.composites.splice(inspector.root.composites.length - 1, 1);
        inspector.root.composites.unshift(newComposite);

        Composite.setModified(inspector.engine.world, true, true, false);
    };

    var _exportFile = function(inspector) {
        var engine = inspector.engine,
            toExport = [];

        if (inspector.selected.length === 0) {
            alert('No objects were selected, so export could not be created. Can only export objects that are in the World composite.');
            return;
        }

        var fileName = 'export-objects',
            exportComposite = Composite.create({
                label: 'Exported Objects'
            });

        // add everything else, must be in top-down order
        for (var i = 0; i < inspector.selected.length; i++) {
            var object = inspector.selected[i].data;

            // skip if it's already in the composite tree
            // this means orphans will be added in the root
            if (Composite.get(exportComposite, object.id, object.type))
                continue;

            Composite.add(exportComposite, object);

            // better filename for small exports
            if (inspector.selected.length === 1)
                fileName = 'export-' + object.label + '-' + object.id;
        }

        // santise filename
        fileName = fileName.toLowerCase().replace(/[^\w\-]/g, '') + '.json';

        // serialise
        var json = Gui.serialise(inspector.serializer, exportComposite, inspector.exportIndent);

        // launch export download
        if (_isWebkit) {
            var blob = new Blob([json], { type: 'application/json' }),
                anchor = document.createElement('a');
            anchor.download = fileName;
            anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
            anchor.dataset.downloadurl = ['application/json', anchor.download, anchor.href].join(':');
            anchor.click();
        } else {
            window.open('data:application/json;charset=utf-8,' + escape(json));
        }

        Events.trigger(inspector, 'export');
    };

    var _importFile = function(inspector) {
        var engine = inspector.engine,
            element = document.createElement('div'),
            fileInput;

        element.innerHTML = '<input type="file">';
        fileInput = element.firstChild;

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];

            if (file.name.match(/\.(txt|json)$/)) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    var importedComposite = inspector.serializer.parse(reader.result);

                    if (importedComposite) {
                        importedComposite.label = 'Imported Objects';

                        Composite.rebase(importedComposite);
                        Composite.add(inspector.root, importedComposite);

                        // move imported composite to the start so that it appears top of tree
                        inspector.root.composites.splice(inspector.root.composites.length - 1, 1);
                        inspector.root.composites.unshift(importedComposite);

                        var worldTree = inspector.controls.worldTree.data('jstree'),
                            data = _generateCompositeTreeNode(inspector.root, null, true);
                        _updateTree(worldTree, data);
                    }
                };

                reader.readAsText(file);    
            } else {
                alert('File not supported, .json or .txt JSON files only');
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

    /**
    * Fired after the inspector is paused
    *
    * @event pause
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

    /**
    * Fired after the inspector is played
    *
    * @event play
    * @param {} event An event object
    * @param {} event.source The source object of the event
    * @param {} event.name The name of the event
    */

})();