/**
* matter-tools-dev.min.js 0.5.0-dev 2014-05-04
* https://github.com/liabru/matter-tools
* License: MIT
*/

(function() {
  var MatterTools = {};
  var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body, Composite = Matter.Composite, Composites = Matter.Composites, Common = Matter.Common, Constraint = Matter.Constraint, Events = Matter.Events, Bounds = Matter.Bounds, Vector = Matter.Vector, Vertices = Matter.Vertices, MouseConstraint = Matter.MouseConstraint, Render = Matter.Render, RenderPixi = Matter.RenderPixi, Mouse = Matter.Mouse, Query = Matter.Query;
  var Gui = {};
  (function() {
    Gui.create = function(engine, options) {
      var _datGuiSupported = window.dat && window.localStorage;
      if (!_datGuiSupported) {
        console.log("Could not create GUI. Check dat.gui library is loaded first.");
        return;
      }
      var datGui = new dat.GUI(options);
      var gui = {
        engine:engine,
        datGui:datGui,
        amount:1,
        size:40,
        sides:4,
        density:.001,
        restitution:0,
        friction:.1,
        frictionAir:.01,
        offset:{
          x:0,
          y:0
        },
        renderer:"canvas",
        chamfer:0
      };
      if (Resurrect) {
        gui.serializer = new Resurrect({
          prefix:"$",
          cleanup:true
        });
        gui.serializer.parse = gui.serializer.resurrect;
      }
      _initDatGui(gui);
      return gui;
    };
    Gui.update = function(gui, datGui) {
      var i;
      datGui = datGui || gui.datGui;
      for (i in datGui.__folders) {
        Gui.update(gui, datGui.__folders[i]);
      }
      for (i in datGui.__controllers) {
        var controller = datGui.__controllers[i];
        if (controller.updateDisplay) controller.updateDisplay();
      }
    };
    Gui.closeAll = function(gui) {
      var datGui = gui.datGui;
      for (var i in datGui.__folders) {
        datGui.__folders[i].close();
      }
    };
    Gui.saveState = function(serializer, engine, key) {
      if (localStorage && serializer) localStorage.setItem(key, Gui.serialise(serializer, engine.world));
    };
    Gui.loadState = function(serializer, engine, key) {
      var loadedWorld;
      if (localStorage && serializer) loadedWorld = serializer.parse(localStorage.getItem(key));
      if (loadedWorld) Engine.merge(engine, {
        world:loadedWorld
      });
    };
    Gui.serialise = function(serializer, object, indent) {
      indent = indent || 0;
      return serializer.stringify(object, function(key, value) {
        if (!/^#/.exec(key) && typeof value === "number") {
          var fixed = parseFloat(value.toFixed(3));
          if (fixed === 0 && value !== 0) return value;
          return fixed;
        }
        return value;
      }, indent);
    };
    Gui.clone = function(serializer, object) {
      var clone = serializer.parse(Gui.serialise(serializer, object));
      clone.id = Common.nextId();
      return clone;
    };
    var _initDatGui = function(gui) {
      var engine = gui.engine, datGui = gui.datGui;
      var funcs = {
        addBody:function() {
          _addBody(gui);
        },
        clear:function() {
          _clear(gui);
        },
        save:function() {
          Gui.saveState(gui.serializer, engine, "guiState");
          Events.trigger(gui, "save");
        },
        load:function() {
          Gui.loadState(gui.serializer, engine, "guiState");
          Events.trigger(gui, "load");
        },
        inspect:function() {
          if (!Inspector.instance) gui.inspector = Inspector.create(gui.engine);
        }
      };
      var metrics = datGui.addFolder("Metrics");
      metrics.add(engine.timing, "fps").listen();
      if (engine.metrics.extended) {
        metrics.add(engine.timing, "delta").listen();
        metrics.add(engine.timing, "correction").listen();
        metrics.add(engine.metrics, "bodies").listen();
        metrics.add(engine.metrics, "collisions").listen();
        metrics.add(engine.metrics, "pairs").listen();
        metrics.add(engine.metrics, "broadEff").listen();
        metrics.add(engine.metrics, "midEff").listen();
        metrics.add(engine.metrics, "narrowEff").listen();
        metrics.add(engine.metrics, "narrowReuse").listen();
        metrics.close();
      } else {
        metrics.open();
      }
      var controls = datGui.addFolder("Add Body");
      controls.add(gui, "amount", 1, 5).step(1);
      controls.add(gui, "size", 5, 150).step(1);
      controls.add(gui, "sides", 1, 8).step(1);
      controls.add(gui, "density", 1e-4, .01).step(.001);
      controls.add(gui, "friction", 0, 1).step(.05);
      controls.add(gui, "frictionAir", 0, gui.frictionAir * 10).step(gui.frictionAir / 10);
      controls.add(gui, "restitution", 0, 1).step(.1);
      controls.add(gui, "chamfer", 0, 30).step(2);
      controls.add(funcs, "addBody");
      controls.open();
      var worldGui = datGui.addFolder("World");
      worldGui.add(funcs, "inspect");
      worldGui.add(funcs, "load");
      worldGui.add(funcs, "save");
      worldGui.add(funcs, "clear");
      worldGui.open();
      var gravity = worldGui.addFolder("Gravity");
      gravity.add(engine.world.gravity, "x", -1, 1).step(.01);
      gravity.add(engine.world.gravity, "y", -1, 1).step(.01);
      gravity.open();
      var physics = datGui.addFolder("Engine");
      physics.add(engine, "enableSleeping");
      physics.add(engine.broadphase, "current", [ "grid", "bruteForce" ]).onFinishChange(function(value) {
        Composite.setModified(engine.world, true, false, false);
      });
      physics.add(engine.timing, "timeScale", 0, 1.2).step(.05).listen();
      physics.add(engine, "velocityIterations", 1, 10).step(1);
      physics.add(engine, "positionIterations", 1, 10).step(1);
      physics.add(engine, "enabled");
      physics.open();
      var render = datGui.addFolder("Render");
      render.add(gui, "renderer", [ "canvas", "webgl" ]).onFinishChange(function(value) {
        _setRenderer(gui, value);
      });
      render.add(engine.render.options, "wireframes");
      render.add(engine.render.options, "showDebug");
      render.add(engine.render.options, "showPositions");
      render.add(engine.render.options, "showBroadphase");
      render.add(engine.render.options, "showBounds");
      render.add(engine.render.options, "showVelocity");
      render.add(engine.render.options, "showCollisions");
      render.add(engine.render.options, "showAxes");
      render.add(engine.render.options, "showAngleIndicator");
      render.add(engine.render.options, "showSleeping");
      render.add(engine.render.options, "showIds");
      render.add(engine.render.options, "showShadows");
      render.add(engine.render.options, "enabled");
      render.open();
    };
    var _setRenderer = function(gui, rendererName) {
      var engine = gui.engine, controller;
      if (rendererName === "canvas") controller = Render;
      if (rendererName === "webgl") controller = RenderPixi;
      engine.render.element.removeChild(engine.render.canvas);
      var options = engine.render.options;
      engine.render = controller.create({
        element:engine.render.element,
        options:options
      });
      engine.render.options = options;
      Mouse.setElement(engine.input.mouse, engine.render.canvas);
    };
    var _addBody = function(gui) {
      var engine = gui.engine;
      var options = {
        density:gui.density,
        friction:gui.friction,
        frictionAir:gui.frictionAir,
        restitution:gui.restitution
      };
      if (gui.chamfer && gui.sides > 2) {
        options.chamfer = {
          radius:gui.chamfer
        };
      }
      for (var i = 0; i < gui.amount; i++) {
        World.add(engine.world, Bodies.polygon(gui.offset.x + 120 + i * gui.size + i * 50, gui.offset.y + 200, gui.sides, gui.size, options));
      }
    };
    var _clear = function(gui) {
      var engine = gui.engine;
      World.clear(engine.world, true);
      Engine.clear(engine);
      var renderController = engine.render.controller;
      if (renderController.clear) renderController.clear(engine.render);
      Events.trigger(gui, "clear");
    };
  })();
  var Inspector = {};
  (function() {
    var _key, _isWebkit = "WebkitAppearance" in document.documentElement.style, $body;
    Inspector.create = function(engine, options) {
      if (!jQuery || !$.fn.jstree || !window.key) {
        console.log("Could not create inspector. Check keymaster, jQuery, jsTree libraries are loaded first.");
        return;
      }
      var inspector = {
        engine:engine,
        isPaused:false,
        selected:[],
        selectStart:null,
        selectEnd:null,
        selectBounds:Bounds.create(),
        mousePrevPosition:{
          x:0,
          y:0
        },
        offset:{
          x:0,
          y:0
        },
        autoHide:true,
        autoRewind:true,
        hasTransitions:_isWebkit ? true :false,
        bodyClass:"",
        exportIndent:0,
        clipboard:[],
        controls:{
          container:null,
          worldTree:null
        },
        root:Composite.create({
          label:"Root"
        })
      };
      inspector = Common.extend(inspector, options);
      Inspector.instance = inspector;
      inspector.serializer = new Resurrect({
        prefix:"$",
        cleanup:true
      });
      inspector.serializer.parse = inspector.serializer.resurrect;
      localStorage.removeItem("pauseState");
      $body = $("body");
      $body.toggleClass("ins-auto-hide gui-auto-hide", inspector.autoHide);
      $body.toggleClass("ins-transitions gui-transitions", inspector.hasTransitions);
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
      var engine = inspector.engine, controls = inspector.controls;
      var $inspectorContainer = $('<div class="ins-container">'), $buttonGroup = $('<div class="ins-control-group">'), $searchBox = $('<input class="ins-search-box" type="search" placeholder="search">'), $importButton = $('<button class="ins-import-button ins-button">Import</button>'), $exportButton = $('<button class="ins-export-button ins-button">Export</button>'), $pauseButton = $('<button class="ins-pause-button ins-button">Pause</button>'), $helpButton = $('<button class="ins-help-button ins-button">Help</button>'), $addCompositeButton = $('<button class="ins-add-button ins-button">+</button>');
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
      controls.searchBox.keyup(function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
          var value = controls.searchBox.val(), worldTree = controls.worldTree.data("jstree");
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
      help += "[right click + shift] and drag to move whole selection.\n\n";
      help += "[ctrl-c] to copy selected world objects.\n";
      help += "[ctrl-v] to paste copied world objects to mouse position.\n";
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
      var engine = inspector.engine, controls = inspector.controls;
      _key("shift+space", function() {
        _setPaused(inspector, !inspector.isPaused);
      });
      _key("shift+o", function() {
        _exportFile(inspector);
      });
      _key("shift+i", function() {
        _importFile(inspector);
      });
      _key("shift+j", function() {
        _showHelp(inspector);
      });
      _key("shift+y", function() {
        inspector.autoHide = !inspector.autoHide;
        $body.toggleClass("ins-auto-hide gui-auto-hide", inspector.autoHide);
      });
      _key("shift+r", function() {
        inspector.autoRewind = !inspector.autoRewind;
        if (!inspector.autoRewind) localStorage.removeItem("pauseState");
      });
      _key("shift+q", function() {
        var worldTree = inspector.controls.worldTree.data("jstree");
        for (var i = 0; i < inspector.selected.length; i++) {
          var object = inspector.selected[i].data;
          if (object.type === "body" && !object.isStatic) Body.setStatic(object, true);
        }
      });
      _key("del", function() {
        _deleteSelectedObjects(inspector);
      });
      _key("backspace", function() {
        _deleteSelectedObjects(inspector);
      });
      _key("ctrl+c", function() {
        _copySelectedObjects(inspector);
      });
      _key("ctrl+v", function() {
        _pasteSelectedObjects(inspector);
      });
      $(document).unbind("keydown").bind("keydown", function(event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
          var d = event.srcElement || event.target;
          if (d.tagName.toUpperCase() === "INPUT" && (d.type.toUpperCase() === "TEXT" || d.type.toUpperCase() === "PASSWORD" || d.type.toUpperCase() === "FILE" || d.type.toUpperCase() === "EMAIL" || d.type.toUpperCase() === "SEARCH") || d.tagName.toUpperCase() === "TEXTAREA") {
            doPrevent = d.readOnly || d.disabled;
          } else {
            doPrevent = true;
          }
        }
        if (doPrevent) {
          event.preventDefault();
        }
      });
    };
    var _initTree = function(inspector) {
      var engine = inspector.engine, controls = inspector.controls, deferTimeout;
      var worldTreeOptions = {
        core:{
          check_callback:true
        },
        dnd:{
          copy:false
        },
        search:{
          show_only_matches:true,
          fuzzy:false
        },
        types:{
          "#":{
            valid_children:[]
          },
          body:{
            valid_children:[]
          },
          constraint:{
            valid_children:[]
          },
          composite:{
            valid_children:[]
          },
          bodies:{
            valid_children:[ "body" ]
          },
          constraints:{
            valid_children:[ "constraint" ]
          },
          composites:{
            valid_children:[ "composite" ]
          }
        },
        plugins:[ "dnd", "types", "unique", "search" ]
      };
      controls.worldTree = $('<div class="ins-world-tree">').jstree(worldTreeOptions);
      controls.container.prepend(controls.worldTree);
      controls.worldTree.on("changed.jstree", function(event, data) {
        var selected = [], worldTree = controls.worldTree.data("jstree");
        if (data.action !== "select_node") return;
        clearTimeout(deferTimeout);
        deferTimeout = setTimeout(function() {
          data.selected = worldTree.get_selected();
          for (var i = 0; i < data.selected.length; i++) {
            var nodeId = data.selected[i], objectType = nodeId.split("_")[0], objectId = nodeId.split("_")[1], worldObject = Composite.get(engine.world, objectId, objectType);
            switch (objectType) {
             case "body":
             case "constraint":
             case "composite":
              selected.push(worldObject);
              break;
            }
          }
          _setSelectedObjects(inspector, selected);
        }, 1);
      });
      $(document).on("dnd_stop.vakata", function(event, data) {
        var worldTree = controls.worldTree.data("jstree"), nodes = data.data.nodes;
        for (var i = 0; i < nodes.length; i++) {
          var node = worldTree.get_node(nodes[i]), parentNode = worldTree.get_node(worldTree.get_parent(nodes[i])), prevCompositeId = node.data.compositeId, newCompositeId = parentNode.data.compositeId;
          if (prevCompositeId === newCompositeId) continue;
          var nodeId = nodes[i], objectType = nodeId.split("_")[0], objectId = nodeId.split("_")[1], worldObject = Composite.get(inspector.root, objectId, objectType), prevComposite = Composite.get(inspector.root, prevCompositeId, "composite"), newComposite = Composite.get(inspector.root, newCompositeId, "composite");
          Composite.move(prevComposite, worldObject, newComposite);
        }
      });
      controls.worldTree.on("dblclick.jstree", function(event, data) {
        var worldTree = controls.worldTree.data("jstree"), selected = worldTree.get_selected();
        for (var i = 0; i < selected.length; i++) {
          var nodeId = selected[i], objectType = nodeId.split("_")[0], objectId = nodeId.split("_")[1], worldObject = Composite.get(engine.world, objectId, objectType);
          switch (objectType) {
           case "composite":
           case "composites":
           case "bodies":
           case "constraints":
            var node = worldTree.get_node(nodeId), children = worldTree.get_node(nodeId).children;
            for (var j = 0; j < children.length; j++) worldTree.select_node(children[j], false);
            break;
          }
        }
      });
    };
    var _addBodyClass = function(inspector, classNames) {
      if (inspector.bodyClass.indexOf(" " + classNames) === -1) {
        $body.addClass(classNames);
        inspector.bodyClass = " " + $body.attr("class");
      }
    };
    var _removeBodyClass = function(inspector, classNames) {
      var updateRequired = false, classes = classNames.split(" ");
      for (var i = 0; i < classes.length; i++) {
        updateRequired = inspector.bodyClass.indexOf(" " + classes[i]) !== -1;
        if (updateRequired) break;
      }
      if (updateRequired) {
        $body.removeClass(classNames);
        inspector.bodyClass = " " + $body.attr("class");
      }
    };
    var _getMousePosition = function(inspector) {
      return Vector.add(inspector.engine.input.mouse.position, inspector.offset);
    };
    var _initEngineEvents = function(inspector) {
      var engine = inspector.engine, mouse = engine.input.mouse, mousePosition = _getMousePosition(inspector), controls = inspector.controls;
      Events.on(engine, "tick", function() {
        mousePosition = _getMousePosition(inspector);
        var mouseDelta = mousePosition.x - inspector.mousePrevPosition.x, keyDelta = _key.isPressed("up") + _key.isPressed("right") - _key.isPressed("down") - _key.isPressed("left"), delta = mouseDelta + keyDelta;
        if (engine.world.isModified) {
          var data = _generateCompositeTreeNode(inspector.root, null, true);
          _updateTree(controls.worldTree.data("jstree"), data);
          _setSelectedObjects(inspector, []);
        }
        if (inspector.selectStart !== null) {
          inspector.selectEnd.x = mousePosition.x;
          inspector.selectEnd.y = mousePosition.y;
          Bounds.update(inspector.selectBounds, [ inspector.selectStart, inspector.selectEnd ]);
        }
        if (_key.shift && _key.isPressed("r")) {
          var rotateSpeed = .03, angle = Math.max(-2, Math.min(2, delta)) * rotateSpeed;
          _addBodyClass(inspector, "ins-cursor-rotate");
          _rotateSelectedObjects(inspector, angle);
        } else {
          _removeBodyClass(inspector, "ins-cursor-rotate");
        }
        if (_key.shift && _key.isPressed("s")) {
          var scaleSpeed = .02, scale = 1 + Math.max(-2, Math.min(2, delta)) * scaleSpeed;
          _addBodyClass(inspector, "ins-cursor-scale");
          if (_key.isPressed("d")) {
            scaleX = scale;
            scaleY = 1;
          } else if (_key.isPressed("f")) {
            scaleX = 1;
            scaleY = scale;
          } else {
            scaleX = scaleY = scale;
          }
          _scaleSelectedObjects(inspector, scaleX, scaleY);
        } else {
          _removeBodyClass(inspector, "ins-cursor-scale");
        }
        if (mouse.button === 2 && !mouse.sourceEvents.mousedown && !mouse.sourceEvents.mouseup) {
          _addBodyClass(inspector, "ins-cursor-move");
          _moveSelectedObjects(inspector, mousePosition.x, mousePosition.y);
        } else {
          _removeBodyClass(inspector, "ins-cursor-move");
        }
        inspector.mousePrevPosition = Common.clone(mousePosition);
      });
      Events.on(engine, "mouseup", function(event) {
        if (inspector.selectStart !== null) {
          var selected = Query.region(Composite.allBodies(engine.world), inspector.selectBounds);
          _setSelectedObjects(inspector, selected);
        }
        inspector.selectStart = null;
        inspector.selectEnd = null;
        Events.trigger(inspector, "selectEnd");
      });
      Events.on(engine, "mousedown", function(event) {
        var engine = event.source, bodies = Composite.allBodies(engine.world), constraints = Composite.allConstraints(engine.world), isUnionSelect = _key.shift || _key.control, worldTree = inspector.controls.worldTree.data("jstree"), i;
        if (mouse.button === 2) {
          var hasSelected = false;
          for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            if (Bounds.contains(body.bounds, mousePosition) && Vertices.contains(body.vertices, mousePosition)) {
              if (isUnionSelect) {
                _addSelectedObject(inspector, body);
              } else {
                _setSelectedObjects(inspector, [ body ]);
              }
              hasSelected = true;
              break;
            }
          }
          if (!hasSelected) {
            for (i = 0; i < constraints.length; i++) {
              var constraint = constraints[i], bodyA = constraint.bodyA, bodyB = constraint.bodyB;
              if (constraint.label.indexOf("Mouse Constraint") !== -1) continue;
              var pointAWorld = constraint.pointA, pointBWorld = constraint.pointB;
              if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
              if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);
              if (!pointAWorld || !pointBWorld) continue;
              var distA = Vector.magnitudeSquared(Vector.sub(mousePosition, pointAWorld)), distB = Vector.magnitudeSquared(Vector.sub(mousePosition, pointBWorld));
              if (distA < 100 || distB < 100) {
                if (isUnionSelect) {
                  _addSelectedObject(inspector, constraint);
                } else {
                  _setSelectedObjects(inspector, [ constraint ]);
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
              Bounds.update(inspector.selectBounds, [ inspector.selectStart, inspector.selectEnd ]);
              Events.trigger(inspector, "selectStart");
            } else {
              inspector.selectStart = null;
              inspector.selectEnd = null;
            }
          }
        }
        if (mouse.button === 2 && inspector.selected.length > 0) {
          _addBodyClass(inspector, "ins-cursor-move");
          _updateSelectedMouseDownOffset(inspector);
        }
      });
      Events.on(engine, "afterRender", function() {
        var renderController = engine.render.controller, context = engine.render.context;
        if (renderController.inspector) renderController.inspector(inspector, context);
      });
    };
    var _deleteSelectedObjects = function(inspector) {
      var objects = [], object, worldTree = inspector.controls.worldTree.data("jstree"), i;
      for (i = 0; i < inspector.selected.length; i++) {
        object = inspector.selected[i].data;
        if (object !== inspector.engine.world) objects.push(object);
      }
      var selectedNodes = worldTree.get_selected();
      for (i = 0; i < selectedNodes.length; i++) {
        var node = worldTree.get_node(selectedNodes[i]);
        if (node.type === "composite") {
          node = worldTree.get_node(node.children[0]);
          if (node.data) {
            var compositeId = node.data.compositeId;
            object = Composite.get(inspector.root, compositeId, "composite");
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
    var _copySelectedObjects = function(inspector) {
      inspector.clipboard.length = 0;
      for (var i = 0; i < inspector.selected.length; i++) {
        var object = inspector.selected[i].data;
        if (object.type !== "body") continue;
        inspector.clipboard.push(object);
      }
    };
    var _pasteSelectedObjects = function(inspector) {
      var objects = [], worldTree = inspector.controls.worldTree.data("jstree");
      for (var i = 0; i < inspector.clipboard.length; i++) {
        var object = inspector.clipboard[i], clone = Gui.clone(inspector.serializer, object);
        Body.translate(clone, {
          x:50,
          y:50
        });
        var node = worldTree.get_node(object.type + "_" + object.id, false), compositeId = node.data.compositeId, composite = Composite.get(inspector.engine.world, compositeId, "composite");
        Composite.add(composite, clone);
        objects.push(clone);
      }
      setTimeout(function() {
        _setSelectedObjects(inspector, objects);
      }, 200);
    };
    var _updateSelectedMouseDownOffset = function(inspector) {
      var selected = inspector.selected, mouse = inspector.engine.input.mouse, mousePosition = _getMousePosition(inspector), item, data;
      for (var i = 0; i < selected.length; i++) {
        item = selected[i];
        data = item.data;
        if (data.position) {
          item.mousedownOffset = {
            x:mousePosition.x - data.position.x,
            y:mousePosition.y - data.position.y
          };
        } else if (data.pointA && !data.bodyA) {
          item.mousedownOffset = {
            x:mousePosition.x - data.pointA.x,
            y:mousePosition.y - data.pointA.y
          };
        } else if (data.pointB && !data.bodyB) {
          item.mousedownOffset = {
            x:mousePosition.x - data.pointB.x,
            y:mousePosition.y - data.pointB.y
          };
        }
      }
    };
    var _moveSelectedObjects = function(inspector, x, y) {
      var selected = inspector.selected, mouse = inspector.engine.input.mouse, mousePosition = _getMousePosition(inspector), item, data;
      for (var i = 0; i < selected.length; i++) {
        item = selected[i];
        data = item.data;
        if (!item.mousedownOffset) continue;
        switch (data.type) {
         case "body":
          var delta = {
            x:x - data.position.x - item.mousedownOffset.x,
            y:y - data.position.y - item.mousedownOffset.y
          };
          Body.translate(data, delta);
          data.positionPrev.x = data.position.x;
          data.positionPrev.y = data.position.y;
          break;

         case "constraint":
          var point = data.pointA;
          if (data.bodyA) point = data.pointB;
          point.x = x - item.mousedownOffset.x;
          point.y = y - item.mousedownOffset.y;
          var initialPointA = data.bodyA ? Vector.add(data.bodyA.position, data.pointA) :data.pointA, initialPointB = data.bodyB ? Vector.add(data.bodyB.position, data.pointB) :data.pointB;
          data.length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
          break;
        }
      }
    };
    var _scaleSelectedObjects = function(inspector, scaleX, scaleY) {
      var selected = inspector.selected, item, data;
      for (var i = 0; i < selected.length; i++) {
        item = selected[i];
        data = item.data;
        switch (data.type) {
         case "body":
          Body.scale(data, scaleX, scaleY, data.position);
          if (data.circleRadius) data.circleRadius *= scaleX;
          break;
        }
      }
    };
    var _rotateSelectedObjects = function(inspector, angle) {
      var selected = inspector.selected, item, data;
      for (var i = 0; i < selected.length; i++) {
        item = selected[i];
        data = item.data;
        switch (data.type) {
         case "body":
          Body.rotate(data, angle);
          break;
        }
      }
    };
    var _setPaused = function(inspector, isPaused) {
      if (isPaused) {
        if (inspector.autoRewind) {
          _setSelectedObjects(inspector, []);
          Gui.loadState(inspector.serializer, inspector.engine, "pauseState");
        }
        inspector.engine.timing.timeScale = 0;
        inspector.isPaused = true;
        inspector.controls.pauseButton.text("Play");
        Events.trigger(inspector, "paused");
      } else {
        if (inspector.autoRewind) {
          Gui.saveState(inspector.serializer, inspector.engine, "pauseState");
        }
        inspector.engine.timing.timeScale = 1;
        inspector.isPaused = false;
        inspector.controls.pauseButton.text("Pause");
        Events.trigger(inspector, "play");
      }
    };
    var _setSelectedObjects = function(inspector, objects) {
      var worldTree = inspector.controls.worldTree.data("jstree"), selectedItems = [], data, i;
      for (i = 0; i < inspector.selected.length; i++) {
        data = inspector.selected[i].data;
        worldTree.deselect_node(data.type + "_" + data.id, true);
      }
      inspector.selected = [];
      console.clear();
      for (i = 0; i < objects.length; i++) {
        data = objects[i];
        if (data) {
          _addSelectedObject(inspector, data);
          if (i < 5) {
            console.log(data.label + " " + data.id + ": %O", data);
          } else if (i === 6) {
            console.warn("Omitted inspecting " + (objects.length - 5) + " more objects");
          }
        }
      }
    };
    var _addSelectedObject = function(inspector, object) {
      if (!object) return;
      var worldTree = inspector.controls.worldTree.data("jstree");
      inspector.selected.push({
        data:object
      });
      worldTree.select_node(object.type + "_" + object.id, true);
    };
    var _updateTree = function(tree, data) {
      data[0].state = data[0].state || {
        opened:true
      };
      tree.settings.core.data = data;
      tree.refresh(-1);
    };
    var _generateCompositeTreeNode = function(composite, compositeId, isRoot) {
      var children = [], node = {
        id:"composite_" + composite.id,
        data:{
          compositeId:compositeId
        },
        type:"composite",
        text:(composite.label ? composite.label :"Composite") + " " + composite.id,
        li_attr:{
          "class":"jstree-node-type-composite"
        }
      };
      var childNode = _generateCompositesTreeNode(composite.composites, composite.id);
      childNode.id = "composites_" + composite.id;
      children.push(childNode);
      if (isRoot) return childNode.children;
      childNode = _generateBodiesTreeNode(composite.bodies, composite.id);
      childNode.id = "bodies_" + composite.id;
      children.push(childNode);
      childNode = _generateConstraintsTreeNode(composite.constraints, composite.id);
      childNode.id = "constraints_" + composite.id;
      children.push(childNode);
      node.children = children;
      return node;
    };
    var _generateCompositesTreeNode = function(composites, compositeId) {
      var node = {
        type:"composites",
        text:"Composites",
        data:{
          compositeId:compositeId
        },
        children:[],
        li_attr:{
          "class":"jstree-node-type-composites"
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
        type:"bodies",
        text:"Bodies",
        data:{
          compositeId:compositeId
        },
        children:[],
        li_attr:{
          "class":"jstree-node-type-bodies"
        }
      };
      for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        node.children.push({
          type:"body",
          id:"body_" + body.id,
          data:{
            compositeId:compositeId
          },
          text:(body.label ? body.label :"Body") + " " + body.id,
          li_attr:{
            "class":"jstree-node-type-body"
          }
        });
      }
      return node;
    };
    var _generateConstraintsTreeNode = function(constraints, compositeId) {
      var node = {
        type:"constraints",
        text:"Constraints",
        data:{
          compositeId:compositeId
        },
        children:[],
        li_attr:{
          "class":"jstree-node-type-constraints"
        }
      };
      for (var i = 0; i < constraints.length; i++) {
        var constraint = constraints[i];
        node.children.push({
          type:"constraint",
          id:"constraint_" + constraint.id,
          data:{
            compositeId:compositeId
          },
          text:(constraint.label ? constraint.label :"Constraint") + " " + constraint.id,
          li_attr:{
            "class":"jstree-node-type-constraint"
          }
        });
      }
      return node;
    };
    var _addNewComposite = function(inspector) {
      var newComposite = Composite.create();
      Composite.add(inspector.root, newComposite);
      inspector.root.composites.splice(inspector.root.composites.length - 1, 1);
      inspector.root.composites.unshift(newComposite);
      Composite.setModified(inspector.engine.world, true, true, false);
    };
    var _exportFile = function(inspector) {
      var engine = inspector.engine, toExport = [];
      if (inspector.selected.length === 0) {
        alert("No objects were selected, so export could not be created. Can only export objects that are in the World composite.");
        return;
      }
      var fileName = "export-objects", exportComposite = Composite.create({
        label:"Exported Objects"
      });
      for (var i = 0; i < inspector.selected.length; i++) {
        var object = inspector.selected[i].data;
        if (Composite.get(exportComposite, object.id, object.type)) continue;
        Composite.add(exportComposite, object);
        if (inspector.selected.length === 1) fileName = "export-" + object.label + "-" + object.id;
      }
      fileName = fileName.toLowerCase().replace(/[^\w\-]/g, "") + ".json";
      var json = Gui.serialise(inspector.serializer, exportComposite, inspector.exportIndent);
      if (_isWebkit) {
        var blob = new Blob([ json ], {
          type:"application/json"
        }), anchor = document.createElement("a");
        anchor.download = fileName;
        anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.dataset.downloadurl = [ "application/json", anchor.download, anchor.href ].join(":");
        anchor.click();
      } else {
        window.open("data:application/json;charset=utf-8," + escape(json));
      }
      Events.trigger(inspector, "export");
    };
    var _importFile = function(inspector) {
      var engine = inspector.engine, element = document.createElement("div"), fileInput;
      element.innerHTML = '<input type="file">';
      fileInput = element.firstChild;
      fileInput.addEventListener("change", function(e) {
        var file = fileInput.files[0];
        if (file.name.match(/\.(txt|json)$/)) {
          var reader = new FileReader();
          reader.onload = function(e) {
            var importedComposite = inspector.serializer.parse(reader.result);
            if (importedComposite) {
              importedComposite.label = "Imported Objects";
              Composite.rebase(importedComposite);
              Composite.add(inspector.root, importedComposite);
              inspector.root.composites.splice(inspector.root.composites.length - 1, 1);
              inspector.root.composites.unshift(importedComposite);
              var worldTree = inspector.controls.worldTree.data("jstree"), data = _generateCompositeTreeNode(inspector.root, null, true);
              _updateTree(worldTree, data);
            }
          };
          reader.readAsText(file);
        } else {
          alert("File not supported, .json or .txt JSON files only");
        }
      });
      fileInput.click();
    };
  })();
  MatterTools.Gui = Gui;
  MatterTools.Inspector = Inspector;
  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = MatterTools;
    }
    exports.MatterTools = MatterTools;
  }
  if (typeof define === "function" && define.amd) {
    define("MatterTools", [], function() {
      return MatterTools;
    });
  }
  if (typeof window === "object" && typeof window.document === "object") {
    window.MatterTools = MatterTools;
  }
})();

var dat = dat || {};

dat.gui = dat.gui || {};

dat.utils = dat.utils || {};

dat.controllers = dat.controllers || {};

dat.dom = dat.dom || {};

dat.color = dat.color || {};

dat.utils.css = function() {
  return {
    load:function(url, doc) {
      doc = doc || document;
      var link = doc.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = url;
      doc.getElementsByTagName("head")[0].appendChild(link);
    },
    inject:function(css, doc) {
      doc = doc || document;
      var injected = document.createElement("style");
      injected.type = "text/css";
      injected.innerHTML = css;
      doc.getElementsByTagName("head")[0].appendChild(injected);
    }
  };
}();

dat.utils.common = function() {
  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;
  return {
    BREAK:{},
    extend:function(target) {
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
      }, this);
      return target;
    },
    defaults:function(target) {
      this.each(ARR_SLICE.call(arguments, 1), function(obj) {
        for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
      }, this);
      return target;
    },
    compose:function() {
      var toCall = ARR_SLICE.call(arguments);
      return function() {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [ toCall[i].apply(this, args) ];
        }
        return args[0];
      };
    },
    each:function(obj, itr, scope) {
      if (!obj) return;
      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
      } else {
        for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
      }
    },
    defer:function(fnc) {
      setTimeout(fnc, 0);
    },
    toArray:function(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },
    isUndefined:function(obj) {
      return obj === undefined;
    },
    isNull:function(obj) {
      return obj === null;
    },
    isNaN:function(obj) {
      return obj !== obj;
    },
    isArray:Array.isArray || function(obj) {
      return obj.constructor === Array;
    },
    isObject:function(obj) {
      return obj === Object(obj);
    },
    isNumber:function(obj) {
      return obj === obj + 0;
    },
    isString:function(obj) {
      return obj === obj + "";
    },
    isBoolean:function(obj) {
      return obj === false || obj === true;
    },
    isFunction:function(obj) {
      return Object.prototype.toString.call(obj) === "[object Function]";
    }
  };
}();

dat.controllers.Controller = function(common) {
  var Controller = function(object, property) {
    this.initialValue = object[property];
    this.domElement = document.createElement("div");
    this.object = object;
    this.property = property;
    this.__onChange = undefined;
    this.__onFinishChange = undefined;
  };
  common.extend(Controller.prototype, {
    onChange:function(fnc) {
      this.__onChange = fnc;
      return this;
    },
    onFinishChange:function(fnc) {
      this.__onFinishChange = fnc;
      return this;
    },
    setValue:function(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    },
    getValue:function() {
      return this.object[this.property];
    },
    updateDisplay:function() {
      return this;
    },
    isModified:function() {
      return this.initialValue !== this.getValue();
    }
  });
  return Controller;
}(dat.utils.common);

dat.dom.dom = function(common) {
  var EVENT_MAP = {
    HTMLEvents:[ "change" ],
    MouseEvents:[ "click", "mousemove", "mousedown", "mouseup", "mouseover" ],
    KeyboardEvents:[ "keydown" ]
  };
  var EVENT_MAP_INV = {};
  common.each(EVENT_MAP, function(v, k) {
    common.each(v, function(e) {
      EVENT_MAP_INV[e] = k;
    });
  });
  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
  function cssValueToPixels(val) {
    if (val === "0" || common.isUndefined(val)) return 0;
    var match = val.match(CSS_VALUE_PIXELS);
    if (!common.isNull(match)) {
      return parseFloat(match[1]);
    }
    return 0;
  }
  var dom = {
    makeSelectable:function(elem, selectable) {
      if (elem === undefined || elem.style === undefined) return;
      elem.onselectstart = selectable ? function() {
        return false;
      } :function() {};
      elem.style.MozUserSelect = selectable ? "auto" :"none";
      elem.style.KhtmlUserSelect = selectable ? "auto" :"none";
      elem.unselectable = selectable ? "on" :"off";
    },
    makeFullscreen:function(elem, horizontal, vertical) {
      if (common.isUndefined(horizontal)) horizontal = true;
      if (common.isUndefined(vertical)) vertical = true;
      elem.style.position = "absolute";
      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },
    fakeEvent:function(elem, eventType, params, aux) {
      params = params || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error("Event type " + eventType + " not supported.");
      }
      var evt = document.createEvent(className);
      switch (className) {
       case "MouseEvents":
        var clientX = params.x || params.clientX || 0;
        var clientY = params.y || params.clientY || 0;
        evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
        break;

       case "KeyboardEvents":
        var init = evt.initKeyboardEvent || evt.initKeyEvent;
        common.defaults(params, {
          cancelable:true,
          ctrlKey:false,
          altKey:false,
          shiftKey:false,
          metaKey:false,
          keyCode:undefined,
          charCode:undefined
        });
        init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
        break;

       default:
        evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
        break;
      }
      common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },
    bind:function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.addEventListener) elem.addEventListener(event, func, bool); else if (elem.attachEvent) elem.attachEvent("on" + event, func);
      return dom;
    },
    unbind:function(elem, event, func, bool) {
      bool = bool || false;
      if (elem.removeEventListener) elem.removeEventListener(event, func, bool); else if (elem.detachEvent) elem.detachEvent("on" + event, func);
      return dom;
    },
    addClass:function(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) == -1) {
          classes.push(className);
          elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
        }
      }
      return dom;
    },
    removeClass:function(elem, className) {
      if (className) {
        if (elem.className === undefined) {} else if (elem.className === className) {
          elem.removeAttribute("class");
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index != -1) {
            classes.splice(index, 1);
            elem.className = classes.join(" ");
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },
    hasClass:function(elem, className) {
      return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
    },
    getWidth:function(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style["width"]);
    },
    getHeight:function(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style["height"]);
    },
    getOffset:function(elem) {
      var offset = {
        left:0,
        top:0
      };
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
        } while (elem = elem.offsetParent);
      }
      return offset;
    },
    isActive:function(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }
  };
  return dom;
}(dat.utils.common);

dat.controllers.OptionController = function(Controller, dom, common) {
  var OptionController = function(object, property, options) {
    OptionController.superclass.call(this, object, property);
    var _this = this;
    this.__select = document.createElement("select");
    if (common.isArray(options)) {
      var map = {};
      common.each(options, function(element) {
        map[element] = element;
      });
      options = map;
    }
    common.each(options, function(value, key) {
      var opt = document.createElement("option");
      opt.innerHTML = key;
      opt.setAttribute("value", value);
      _this.__select.appendChild(opt);
    });
    this.updateDisplay();
    dom.bind(this.__select, "change", function() {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    this.domElement.appendChild(this.__select);
  };
  OptionController.superclass = Controller;
  common.extend(OptionController.prototype, Controller.prototype, {
    setValue:function(v) {
      var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    },
    updateDisplay:function() {
      this.__select.value = this.getValue();
      return OptionController.superclass.prototype.updateDisplay.call(this);
    }
  });
  return OptionController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.NumberController = function(Controller, common) {
  var NumberController = function(object, property, params) {
    NumberController.superclass.call(this, object, property);
    params = params || {};
    this.__min = params.min;
    this.__max = params.max;
    this.__step = params.step;
    if (common.isUndefined(this.__step)) {
      if (this.initialValue == 0) {
        this.__impliedStep = 1;
      } else {
        this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue) / Math.LN10)) / 10;
      }
    } else {
      this.__impliedStep = this.__step;
    }
    this.__precision = numDecimals(this.__impliedStep);
  };
  NumberController.superclass = Controller;
  common.extend(NumberController.prototype, Controller.prototype, {
    setValue:function(v) {
      if (this.__min !== undefined && v < this.__min) {
        v = this.__min;
      } else if (this.__max !== undefined && v > this.__max) {
        v = this.__max;
      }
      if (this.__step !== undefined && v % this.__step != 0) {
        v = Math.round(v / this.__step) * this.__step;
      }
      return NumberController.superclass.prototype.setValue.call(this, v);
    },
    min:function(v) {
      this.__min = v;
      return this;
    },
    max:function(v) {
      this.__max = v;
      return this;
    },
    step:function(v) {
      this.__step = v;
      this.__impliedStep = v;
      this.__precision = numDecimals(v);
      return this;
    }
  });
  function numDecimals(x) {
    x = x.toString();
    if (x.indexOf(".") > -1) {
      return x.length - x.indexOf(".") - 1;
    } else {
      return 0;
    }
  }
  return NumberController;
}(dat.controllers.Controller, dat.utils.common);

dat.controllers.NumberControllerBox = function(NumberController, dom, common) {
  var NumberControllerBox = function(object, property, params) {
    this.__truncationSuspended = false;
    NumberControllerBox.superclass.call(this, object, property, params);
    var _this = this;
    var prev_y;
    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "text");
    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    dom.bind(this.__input, "mousedown", onMouseDown);
    dom.bind(this.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
      }
    });
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!common.isNaN(attempted)) _this.setValue(attempted);
    }
    function onBlur() {
      onChange();
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      prev_y = e.clientY;
    }
    function onMouseDrag(e) {
      var diff = prev_y - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prev_y = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
    }
    this.updateDisplay();
    this.domElement.appendChild(this.__input);
  };
  NumberControllerBox.superclass = NumberController;
  common.extend(NumberControllerBox.prototype, NumberController.prototype, {
    updateDisplay:function() {
      this.__input.value = this.__truncationSuspended ? this.getValue() :roundToDecimal(this.getValue(), this.__precision);
      return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
    }
  });
  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }
  return NumberControllerBox;
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.common);

dat.controllers.NumberControllerSlider = function(NumberController, dom, css, common, styleSheet) {
  var NumberControllerSlider = function(object, property, min, max, step) {
    NumberControllerSlider.superclass.call(this, object, property, {
      min:min,
      max:max,
      step:step
    });
    var _this = this;
    this.__background = document.createElement("div");
    this.__foreground = document.createElement("div");
    dom.bind(this.__background, "mousedown", onMouseDown);
    dom.addClass(this.__background, "slider");
    dom.addClass(this.__foreground, "slider-fg");
    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var offset = dom.getOffset(_this.__background);
      var width = dom.getWidth(_this.__background);
      _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    this.updateDisplay();
    this.__background.appendChild(this.__foreground);
    this.domElement.appendChild(this.__background);
  };
  NumberControllerSlider.superclass = NumberController;
  NumberControllerSlider.useDefaultStyles = function() {
    css.inject(styleSheet);
  };
  common.extend(NumberControllerSlider.prototype, NumberController.prototype, {
    updateDisplay:function() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + "%";
      return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
    }
  });
  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }
  return NumberControllerSlider;
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.css, dat.utils.common, "/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");

dat.controllers.FunctionController = function(Controller, dom, common) {
  var FunctionController = function(object, property, text) {
    FunctionController.superclass.call(this, object, property);
    var _this = this;
    this.__button = document.createElement("div");
    this.__button.innerHTML = text === undefined ? "Fire" :text;
    dom.bind(this.__button, "click", function(e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(this.__button, "button");
    this.domElement.appendChild(this.__button);
  };
  FunctionController.superclass = Controller;
  common.extend(FunctionController.prototype, Controller.prototype, {
    fire:function() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.getValue().call(this.object);
    }
  });
  return FunctionController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.BooleanController = function(Controller, dom, common) {
  var BooleanController = function(object, property) {
    BooleanController.superclass.call(this, object, property);
    var _this = this;
    this.__prev = this.getValue();
    this.__checkbox = document.createElement("input");
    this.__checkbox.setAttribute("type", "checkbox");
    dom.bind(this.__checkbox, "change", onChange, false);
    this.domElement.appendChild(this.__checkbox);
    this.updateDisplay();
    function onChange() {
      _this.setValue(!_this.__prev);
    }
  };
  BooleanController.superclass = Controller;
  common.extend(BooleanController.prototype, Controller.prototype, {
    setValue:function(v) {
      var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    },
    updateDisplay:function() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute("checked", "checked");
        this.__checkbox.checked = true;
      } else {
        this.__checkbox.checked = false;
      }
      return BooleanController.superclass.prototype.updateDisplay.call(this);
    }
  });
  return BooleanController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.color.toString = function(common) {
  return function(color) {
    if (color.a == 1 || common.isUndefined(color.a)) {
      var s = color.hex.toString(16);
      while (s.length < 6) {
        s = "0" + s;
      }
      return "#" + s;
    } else {
      return "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + "," + color.a + ")";
    }
  };
}(dat.utils.common);

dat.color.interpret = function(toString, common) {
  var result, toReturn;
  var interpret = function() {
    toReturn = false;
    var original = arguments.length > 1 ? common.toArray(arguments) :arguments[0];
    common.each(INTERPRETATIONS, function(family) {
      if (family.litmus(original)) {
        common.each(family.conversions, function(conversion, conversionName) {
          result = conversion.read(original);
          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return common.BREAK;
          }
        });
        return common.BREAK;
      }
    });
    return toReturn;
  };
  var INTERPRETATIONS = [ {
    litmus:common.isString,
    conversions:{
      THREE_CHAR_HEX:{
        read:function(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) return false;
          return {
            space:"HEX",
            hex:parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
          };
        },
        write:toString
      },
      SIX_CHAR_HEX:{
        read:function(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) return false;
          return {
            space:"HEX",
            hex:parseInt("0x" + test[1].toString())
          };
        },
        write:toString
      },
      CSS_RGB:{
        read:function(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) return false;
          return {
            space:"RGB",
            r:parseFloat(test[1]),
            g:parseFloat(test[2]),
            b:parseFloat(test[3])
          };
        },
        write:toString
      },
      CSS_RGBA:{
        read:function(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
          if (test === null) return false;
          return {
            space:"RGB",
            r:parseFloat(test[1]),
            g:parseFloat(test[2]),
            b:parseFloat(test[3]),
            a:parseFloat(test[4])
          };
        },
        write:toString
      }
    }
  }, {
    litmus:common.isNumber,
    conversions:{
      HEX:{
        read:function(original) {
          return {
            space:"HEX",
            hex:original,
            conversionName:"HEX"
          };
        },
        write:function(color) {
          return color.hex;
        }
      }
    }
  }, {
    litmus:common.isArray,
    conversions:{
      RGB_ARRAY:{
        read:function(original) {
          if (original.length != 3) return false;
          return {
            space:"RGB",
            r:original[0],
            g:original[1],
            b:original[2]
          };
        },
        write:function(color) {
          return [ color.r, color.g, color.b ];
        }
      },
      RGBA_ARRAY:{
        read:function(original) {
          if (original.length != 4) return false;
          return {
            space:"RGB",
            r:original[0],
            g:original[1],
            b:original[2],
            a:original[3]
          };
        },
        write:function(color) {
          return [ color.r, color.g, color.b, color.a ];
        }
      }
    }
  }, {
    litmus:common.isObject,
    conversions:{
      RGBA_OBJ:{
        read:function(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
            return {
              space:"RGB",
              r:original.r,
              g:original.g,
              b:original.b,
              a:original.a
            };
          }
          return false;
        },
        write:function(color) {
          return {
            r:color.r,
            g:color.g,
            b:color.b,
            a:color.a
          };
        }
      },
      RGB_OBJ:{
        read:function(original) {
          if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
            return {
              space:"RGB",
              r:original.r,
              g:original.g,
              b:original.b
            };
          }
          return false;
        },
        write:function(color) {
          return {
            r:color.r,
            g:color.g,
            b:color.b
          };
        }
      },
      HSVA_OBJ:{
        read:function(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
            return {
              space:"HSV",
              h:original.h,
              s:original.s,
              v:original.v,
              a:original.a
            };
          }
          return false;
        },
        write:function(color) {
          return {
            h:color.h,
            s:color.s,
            v:color.v,
            a:color.a
          };
        }
      },
      HSV_OBJ:{
        read:function(original) {
          if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
            return {
              space:"HSV",
              h:original.h,
              s:original.s,
              v:original.v
            };
          }
          return false;
        },
        write:function(color) {
          return {
            h:color.h,
            s:color.s,
            v:color.v
          };
        }
      }
    }
  } ];
  return interpret;
}(dat.color.toString, dat.utils.common);

dat.GUI = dat.gui.GUI = function(css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {
  css.inject(styleSheet);
  var CSS_NAMESPACE = "dg";
  var HIDE_KEY_CODE = 72;
  var CLOSE_BUTTON_HEIGHT = 20;
  var DEFAULT_DEFAULT_PRESET_NAME = "Default";
  var SUPPORTS_LOCAL_STORAGE = function() {
    try {
      return "localStorage" in window && window["localStorage"] !== null;
    } catch (e) {
      return false;
    }
  }();
  var SAVE_DIALOGUE;
  var auto_place_virgin = true;
  var auto_place_container;
  var hide = false;
  var hideable_guis = [];
  var GUI = function(params) {
    var _this = this;
    this.domElement = document.createElement("div");
    this.__ul = document.createElement("ul");
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = params || {};
    params = common.defaults(params, {
      autoPlace:true,
      width:GUI.DEFAULT_WIDTH
    });
    params = common.defaults(params, {
      resizable:params.autoPlace,
      hideable:params.autoPlace
    });
    if (!common.isUndefined(params.load)) {
      if (params.preset) params.load.preset = params.preset;
    } else {
      params.load = {
        preset:DEFAULT_DEFAULT_PRESET_NAME
      };
    }
    if (common.isUndefined(params.parent) && params.hideable) {
      hideable_guis.push(this);
    }
    params.resizable = common.isUndefined(params.parent) && params.resizable;
    if (params.autoPlace && common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    var use_local_storage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
    var saveToLocalStorage;
    Object.defineProperties(this, {
      parent:{
        get:function() {
          return params.parent;
        }
      },
      scrollable:{
        get:function() {
          return params.scrollable;
        }
      },
      autoPlace:{
        get:function() {
          return params.autoPlace;
        }
      },
      preset:{
        get:function() {
          if (_this.parent) {
            return _this.getRoot().preset;
          } else {
            return params.load.preset;
          }
        },
        set:function(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }
      },
      width:{
        get:function() {
          return params.width;
        },
        set:function(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name:{
        get:function() {
          return params.name;
        },
        set:function(v) {
          params.name = v;
          if (title_row_name) {
            title_row_name.innerHTML = params.name;
          }
        }
      },
      closed:{
        get:function() {
          return params.closed;
        },
        set:function(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }
          this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN :GUI.TEXT_CLOSED;
          }
        }
      },
      load:{
        get:function() {
          return params.load;
        }
      },
      useLocalStorage:{
        get:function() {
          return use_local_storage;
        },
        set:function(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            use_local_storage = bool;
            if (bool) {
              dom.bind(window, "unload", saveToLocalStorage);
            } else {
              dom.unbind(window, "unload", saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
          }
        }
      }
    });
    if (common.isUndefined(params.parent)) {
      params.closed = false;
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);
      if (SUPPORTS_LOCAL_STORAGE) {
        if (use_local_storage) {
          _this.useLocalStorage = true;
          var saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));
          if (saved_gui) {
            params.load = JSON.parse(saved_gui);
          }
        }
      }
      this.__closeButton = document.createElement("div");
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      this.domElement.appendChild(this.__closeButton);
      dom.bind(this.__closeButton, "click", function() {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }
      var title_row_name = document.createTextNode(params.name);
      dom.addClass(title_row_name, "controller-name");
      var title_row = addRow(_this, title_row_name);
      var on_click_title = function(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };
      dom.addClass(this.__ul, GUI.CLASS_CLOSED);
      dom.addClass(title_row, "title");
      dom.bind(title_row, "click", on_click_title);
      if (!params.closed) {
        this.closed = false;
      }
    }
    if (params.autoPlace) {
      if (common.isUndefined(params.parent)) {
        if (auto_place_virgin) {
          auto_place_container = document.createElement("div");
          dom.addClass(auto_place_container, CSS_NAMESPACE);
          dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(auto_place_container);
          auto_place_virgin = false;
        }
        auto_place_container.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }
      if (!this.parent) setWidth(_this, params.width);
    }
    dom.bind(window, "resize", function() {
      _this.onResize();
    });
    dom.bind(this.__ul, "webkitTransitionEnd", function() {
      _this.onResize();
    });
    dom.bind(this.__ul, "transitionend", function() {
      _this.onResize();
    });
    dom.bind(this.__ul, "oTransitionEnd", function() {
      _this.onResize();
    });
    this.onResize();
    if (params.resizable) {
      addResizeHandle(this);
    }
    saveToLocalStorage = function() {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
        localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
      }
    };
    this.saveToLocalStorageIfPossible = saveToLocalStorage;
    var root = _this.getRoot();
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      common.defer(function() {
        root.width -= 1;
      });
    }
    if (!params.parent) {
      resetWidth();
    }
  };
  GUI.toggleHide = function() {
    hide = !hide;
    common.each(hideable_guis, function(gui) {
      gui.domElement.style.zIndex = hide ? -999 :999;
      gui.domElement.style.opacity = hide ? 0 :1;
    });
  };
  GUI.CLASS_AUTO_PLACE = "a";
  GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
  GUI.CLASS_MAIN = "main";
  GUI.CLASS_CONTROLLER_ROW = "cr";
  GUI.CLASS_TOO_TALL = "taller-than-window";
  GUI.CLASS_CLOSED = "closed";
  GUI.CLASS_CLOSE_BUTTON = "close-button";
  GUI.CLASS_DRAG = "drag";
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = "Close Controls";
  GUI.TEXT_OPEN = "Open Controls";
  dom.bind(window, "keydown", function(e) {
    if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  }, false);
  common.extend(GUI.prototype, {
    add:function(object, property) {
      return add(this, object, property, {
        factoryArgs:Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor:function(object, property) {
      return add(this, object, property, {
        color:true
      });
    },
    remove:function(controller) {
      this.__ul.removeChild(controller.__li);
      this.__controllers.slice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      common.defer(function() {
        _this.onResize();
      });
    },
    destroy:function() {
      if (this.autoPlace) {
        auto_place_container.removeChild(this.domElement);
      }
    },
    addFolder:function(name) {
      if (this.__folders[name] !== undefined) {
        throw new Error("You already have a folder in this GUI by the" + ' name "' + name + '"');
      }
      var new_gui_params = {
        name:name,
        parent:this
      };
      new_gui_params.autoPlace = this.autoPlace;
      if (this.load && this.load.folders && this.load.folders[name]) {
        new_gui_params.closed = this.load.folders[name].closed;
        new_gui_params.load = this.load.folders[name];
      }
      var gui = new GUI(new_gui_params);
      this.__folders[name] = gui;
      var li = addRow(this, gui.domElement);
      dom.addClass(li, "folder");
      return gui;
    },
    open:function() {
      this.closed = false;
    },
    close:function() {
      this.closed = true;
    },
    onResize:function() {
      var root = this.getRoot();
      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        common.each(root.__ul.childNodes, function(node) {
          if (!(root.autoPlace && node === root.__save_row)) h += dom.getHeight(node);
        });
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = "auto";
        }
      }
      if (root.__resize_handle) {
        common.defer(function() {
          root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
        });
      }
      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + "px";
      }
    },
    remember:function() {
      if (common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
      }
      if (this.parent) {
        throw new Error("You can only call remember on a top level GUI.");
      }
      var _this = this;
      common.each(Array.prototype.slice.call(arguments), function(object) {
        if (_this.__rememberedObjects.length == 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) == -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot:function() {
      var gui = this;
      while (gui.parent) {
        gui = gui.parent;
      }
      return gui;
    },
    getSaveObject:function() {
      var toReturn = this.load;
      toReturn.closed = this.closed;
      if (this.__rememberedObjects.length > 0) {
        toReturn.preset = this.preset;
        if (!toReturn.remembered) {
          toReturn.remembered = {};
        }
        toReturn.remembered[this.preset] = getCurrentPreset(this);
      }
      toReturn.folders = {};
      common.each(this.__folders, function(element, key) {
        toReturn.folders[key] = element.getSaveObject();
      });
      return toReturn;
    },
    save:function() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }
      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs:function(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }
      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert:function(gui) {
      common.each(this.__controllers, function(controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }
      }, this);
      common.each(this.__folders, function(folder) {
        folder.revert(folder);
      });
      if (!gui) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen:function(controller) {
      var init = this.__listening.length == 0;
      this.__listening.push(controller);
      if (init) updateDisplays(this.__listening);
    }
  });
  function add(gui, object, property, params) {
    if (object[property] === undefined) {
      throw new Error("Object " + object + ' has no property "' + property + '"');
    }
    var controller;
    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [ object, property ].concat(params.factoryArgs);
      controller = controllerFactory.apply(gui, factoryArgs);
    }
    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }
    recallSavedValue(gui, controller);
    dom.addClass(controller.domElement, "c");
    var name = document.createElement("span");
    dom.addClass(name, "property-name");
    name.innerHTML = controller.property;
    var container = document.createElement("div");
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    dom.addClass(li, typeof controller.getValue());
    augmentController(gui, li, controller);
    gui.__controllers.push(controller);
    return controller;
  }
  function addRow(gui, dom, liBefore) {
    var li = document.createElement("li");
    if (dom) li.appendChild(dom);
    if (liBefore) {
      gui.__ul.insertBefore(li, params.before);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }
  function augmentController(gui, li, controller) {
    controller.__li = li;
    controller.__gui = gui;
    common.extend(controller, {
      options:function(options) {
        if (arguments.length > 1) {
          controller.remove();
          return add(gui, controller.object, controller.property, {
            before:controller.__li.nextElementSibling,
            factoryArgs:[ common.toArray(arguments) ]
          });
        }
        if (common.isArray(options) || common.isObject(options)) {
          controller.remove();
          return add(gui, controller.object, controller.property, {
            before:controller.__li.nextElementSibling,
            factoryArgs:[ options ]
          });
        }
      },
      name:function(v) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = v;
        return controller;
      },
      listen:function() {
        controller.__gui.listen(controller);
        return controller;
      },
      remove:function() {
        controller.__gui.remove(controller);
        return controller;
      }
    });
    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, {
        min:controller.__min,
        max:controller.__max,
        step:controller.__step
      });
      common.each([ "updateDisplay", "onChange", "onFinishChange" ], function(method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function() {
          var args = Array.prototype.slice.call(arguments);
          pc.apply(controller, args);
          return pb.apply(box, args);
        };
      });
      dom.addClass(li, "has-slider");
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function(returned) {
        if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
          controller.remove();
          return add(gui, controller.object, controller.property, {
            before:controller.__li.nextElementSibling,
            factoryArgs:[ controller.__min, controller.__max, controller.__step ]
          });
        }
        return returned;
      };
      controller.min = common.compose(r, controller.min);
      controller.max = common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, "click", function() {
        dom.fakeEvent(controller.__checkbox, "click");
      });
      dom.bind(controller.__checkbox, "click", function(e) {
        e.stopPropagation();
      });
    } else if (controller instanceof FunctionController) {
      dom.bind(li, "click", function() {
        dom.fakeEvent(controller.__button, "click");
      });
      dom.bind(li, "mouseover", function() {
        dom.addClass(controller.__button, "hover");
      });
      dom.bind(li, "mouseout", function() {
        dom.removeClass(controller.__button, "hover");
      });
    } else if (controller instanceof ColorController) {
      dom.addClass(li, "color");
      controller.updateDisplay = common.compose(function(r) {
        li.style.borderLeftColor = controller.__color.toString();
        return r;
      }, controller.updateDisplay);
      controller.updateDisplay();
    }
    controller.setValue = common.compose(function(r) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return r;
    }, controller.setValue);
  }
  function recallSavedValue(gui, controller) {
    var root = gui.getRoot();
    var matched_index = root.__rememberedObjects.indexOf(controller.object);
    if (matched_index != -1) {
      var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];
      if (controller_map === undefined) {
        controller_map = {};
        root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
      }
      controller_map[controller.property] = controller;
      if (root.load && root.load.remembered) {
        var preset_map = root.load.remembered;
        var preset;
        if (preset_map[gui.preset]) {
          preset = preset_map[gui.preset];
        } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }
        if (preset[matched_index] && preset[matched_index][controller.property] !== undefined) {
          var value = preset[matched_index][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }
  function getLocalStorageHash(gui, key) {
    return document.location.href + "." + key;
  }
  function addSaveMenu(gui) {
    var div = gui.__save_row = document.createElement("li");
    dom.addClass(gui.domElement, "has-save");
    gui.__ul.insertBefore(div, gui.__ul.firstChild);
    dom.addClass(div, "save-row");
    var gears = document.createElement("span");
    gears.innerHTML = "&nbsp;";
    dom.addClass(gears, "button gears");
    var button = document.createElement("span");
    button.innerHTML = "Save";
    dom.addClass(button, "button");
    dom.addClass(button, "save");
    var button2 = document.createElement("span");
    button2.innerHTML = "New";
    dom.addClass(button2, "button");
    dom.addClass(button2, "save-as");
    var button3 = document.createElement("span");
    button3.innerHTML = "Revert";
    dom.addClass(button3, "button");
    dom.addClass(button3, "revert");
    var select = gui.__preset_select = document.createElement("select");
    if (gui.load && gui.load.remembered) {
      common.each(gui.load.remembered, function(value, key) {
        addPresetOption(gui, key, key == gui.preset);
      });
    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }
    dom.bind(select, "change", function() {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }
      gui.preset = this.value;
    });
    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);
    if (SUPPORTS_LOCAL_STORAGE) {
      var saveLocally = document.getElementById("dg-save-locally");
      var explain = document.getElementById("dg-local-explain");
      saveLocally.style.display = "block";
      var localStorageCheckBox = document.getElementById("dg-local-storage");
      if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
        localStorageCheckBox.setAttribute("checked", "checked");
      }
      function showHideExplain() {
        explain.style.display = gui.useLocalStorage ? "block" :"none";
      }
      showHideExplain();
      dom.bind(localStorageCheckBox, "change", function() {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain();
      });
    }
    var newConstructorTextArea = document.getElementById("dg-new-constructor");
    dom.bind(newConstructorTextArea, "keydown", function(e) {
      if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
        SAVE_DIALOGUE.hide();
      }
    });
    dom.bind(gears, "click", function() {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });
    dom.bind(button, "click", function() {
      gui.save();
    });
    dom.bind(button2, "click", function() {
      var presetName = prompt("Enter a new preset name.");
      if (presetName) gui.saveAs(presetName);
    });
    dom.bind(button3, "click", function() {
      gui.revert();
    });
  }
  function addResizeHandle(gui) {
    gui.__resize_handle = document.createElement("div");
    common.extend(gui.__resize_handle.style, {
      width:"6px",
      marginLeft:"-3px",
      height:"200px",
      cursor:"ew-resize",
      position:"absolute"
    });
    var pmouseX;
    dom.bind(gui.__resize_handle, "mousedown", dragStart);
    dom.bind(gui.__closeButton, "mousedown", dragStart);
    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, "mousemove", drag);
      dom.bind(window, "mouseup", dragStop);
      return false;
    }
    function drag(e) {
      e.preventDefault();
      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;
      return false;
    }
    function dragStop() {
      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, "mousemove", drag);
      dom.unbind(window, "mouseup", dragStop);
    }
  }
  function setWidth(gui, w) {
    gui.domElement.style.width = w + "px";
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + "px";
    }
    if (gui.__closeButton) {
      gui.__closeButton.style.width = w + "px";
    }
  }
  function getCurrentPreset(gui, useInitialValues) {
    var toReturn = {};
    common.each(gui.__rememberedObjects, function(val, index) {
      var saved_values = {};
      var controller_map = gui.__rememberedObjectIndecesToControllers[index];
      common.each(controller_map, function(controller, property) {
        saved_values[property] = useInitialValues ? controller.initialValue :controller.getValue();
      });
      toReturn[index] = saved_values;
    });
    return toReturn;
  }
  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement("option");
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }
  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value == gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }
  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
    if (modified) {
      opt.innerHTML = opt.value + "*";
    } else {
      opt.innerHTML = opt.value;
    }
  }
  function updateDisplays(controllerArray) {
    if (controllerArray.length != 0) {
      requestAnimationFrame(function() {
        updateDisplays(controllerArray);
      });
    }
    common.each(controllerArray, function(c) {
      c.updateDisplay();
    });
  }
  return GUI;
}(dat.utils.css, '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>', ".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n", dat.controllers.factory = function(OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {
  return function(object, property) {
    var initialValue = object[property];
    if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }
    if (common.isNumber(initialValue)) {
      if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      } else {
        return new NumberControllerBox(object, property, {
          min:arguments[2],
          max:arguments[3]
        });
      }
    }
    if (common.isString(initialValue)) {
      return new StringController(object, property);
    }
    if (common.isFunction(initialValue)) {
      return new FunctionController(object, property, "");
    }
    if (common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }
  };
}(dat.controllers.OptionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.StringController = function(Controller, dom, common) {
  var StringController = function(object, property) {
    StringController.superclass.call(this, object, property);
    var _this = this;
    this.__input = document.createElement("input");
    this.__input.setAttribute("type", "text");
    dom.bind(this.__input, "keyup", onChange);
    dom.bind(this.__input, "change", onChange);
    dom.bind(this.__input, "blur", onBlur);
    dom.bind(this.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    this.updateDisplay();
    this.domElement.appendChild(this.__input);
  };
  StringController.superclass = Controller;
  common.extend(StringController.prototype, Controller.prototype, {
    updateDisplay:function() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return StringController.superclass.prototype.updateDisplay.call(this);
    }
  });
  return StringController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.FunctionController, dat.controllers.BooleanController, dat.utils.common), dat.controllers.Controller, dat.controllers.BooleanController, dat.controllers.FunctionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.OptionController, dat.controllers.ColorController = function(Controller, dom, Color, interpret, common) {
  var ColorController = function(object, property) {
    ColorController.superclass.call(this, object, property);
    this.__color = new Color(this.getValue());
    this.__temp = new Color(0);
    var _this = this;
    this.domElement = document.createElement("div");
    dom.makeSelectable(this.domElement, false);
    this.__selector = document.createElement("div");
    this.__selector.className = "selector";
    this.__saturation_field = document.createElement("div");
    this.__saturation_field.className = "saturation-field";
    this.__field_knob = document.createElement("div");
    this.__field_knob.className = "field-knob";
    this.__field_knob_border = "2px solid ";
    this.__hue_knob = document.createElement("div");
    this.__hue_knob.className = "hue-knob";
    this.__hue_field = document.createElement("div");
    this.__hue_field.className = "hue-field";
    this.__input = document.createElement("input");
    this.__input.type = "text";
    this.__input_textShadow = "0 1px 1px ";
    dom.bind(this.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(this.__input, "blur", onBlur);
    dom.bind(this.__selector, "mousedown", function(e) {
      dom.addClass(this, "drag").bind(window, "mouseup", function(e) {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    var value_field = document.createElement("div");
    common.extend(this.__selector.style, {
      width:"122px",
      height:"102px",
      padding:"3px",
      backgroundColor:"#222",
      boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"
    });
    common.extend(this.__field_knob.style, {
      position:"absolute",
      width:"12px",
      height:"12px",
      border:this.__field_knob_border + (this.__color.v < .5 ? "#fff" :"#000"),
      boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius:"12px",
      zIndex:1
    });
    common.extend(this.__hue_knob.style, {
      position:"absolute",
      width:"15px",
      height:"2px",
      borderRight:"4px solid #fff",
      zIndex:1
    });
    common.extend(this.__saturation_field.style, {
      width:"100px",
      height:"100px",
      border:"1px solid #555",
      marginRight:"3px",
      display:"inline-block",
      cursor:"pointer"
    });
    common.extend(value_field.style, {
      width:"100%",
      height:"100%",
      background:"none"
    });
    linearGradient(value_field, "top", "rgba(0,0,0,0)", "#000");
    common.extend(this.__hue_field.style, {
      width:"15px",
      height:"100px",
      display:"inline-block",
      border:"1px solid #555",
      cursor:"ns-resize"
    });
    hueGradient(this.__hue_field);
    common.extend(this.__input.style, {
      outline:"none",
      textAlign:"center",
      color:"#fff",
      border:0,
      fontWeight:"bold",
      textShadow:this.__input_textShadow + "rgba(0,0,0,0.7)"
    });
    dom.bind(this.__saturation_field, "mousedown", fieldDown);
    dom.bind(this.__field_knob, "mousedown", fieldDown);
    dom.bind(this.__hue_field, "mousedown", function(e) {
      setH(e);
      dom.bind(window, "mousemove", setH);
      dom.bind(window, "mouseup", unbindH);
    });
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "mouseup", unbindSV);
    }
    function unbindSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "mouseup", unbindSV);
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function unbindH() {
      dom.unbind(window, "mousemove", setH);
      dom.unbind(window, "mouseup", unbindH);
    }
    this.__saturation_field.appendChild(value_field);
    this.__selector.appendChild(this.__field_knob);
    this.__selector.appendChild(this.__saturation_field);
    this.__selector.appendChild(this.__hue_field);
    this.__hue_field.appendChild(this.__hue_knob);
    this.domElement.appendChild(this.__input);
    this.domElement.appendChild(this.__selector);
    this.updateDisplay();
    function setSV(e) {
      e.preventDefault();
      var w = dom.getWidth(_this.__saturation_field);
      var o = dom.getOffset(_this.__saturation_field);
      var s = (e.clientX - o.left + document.body.scrollLeft) / w;
      var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;
      if (v > 1) v = 1; else if (v < 0) v = 0;
      if (s > 1) s = 1; else if (s < 0) s = 0;
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      e.preventDefault();
      var s = dom.getHeight(_this.__hue_field);
      var o = dom.getOffset(_this.__hue_field);
      var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;
      if (h > 1) h = 1; else if (h < 0) h = 0;
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
  };
  ColorController.superclass = Controller;
  common.extend(ColorController.prototype, Controller.prototype, {
    updateDisplay:function() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        common.each(Color.COMPONENTS, function(component) {
          if (!common.isUndefined(i[component]) && !common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          common.extend(this.__color.__state, i);
        }
      }
      common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < .5 || this.__color.s > .5 ? 255 :0;
      var _flip = 255 - flip;
      common.extend(this.__field_knob.style, {
        marginLeft:100 * this.__color.s - 7 + "px",
        marginTop:100 * (1 - this.__color.v) - 7 + "px",
        backgroundColor:this.__temp.toString(),
        border:this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());
      common.extend(this.__input.style, {
        backgroundColor:this.__input.value = this.__color.toString(),
        color:"rgb(" + flip + "," + flip + "," + flip + ")",
        textShadow:this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
      });
    }
  });
  var vendors = [ "-moz-", "-o-", "-webkit-", "-ms-", "" ];
  function linearGradient(elem, x, a, b) {
    elem.style.background = "";
    common.each(vendors, function(vendor) {
      elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
    });
  }
  function hueGradient(elem) {
    elem.style.background = "";
    elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
    elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  }
  return ColorController;
}(dat.controllers.Controller, dat.dom.dom, dat.color.Color = function(interpret, math, toString, common) {
  var Color = function() {
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw "Failed to interpret color arguments";
    }
    this.__state.a = this.__state.a || 1;
  };
  Color.COMPONENTS = [ "r", "g", "b", "h", "s", "v", "hex", "a" ];
  common.extend(Color.prototype, {
    toString:function() {
      return toString(this);
    },
    toOriginal:function() {
      return this.__state.conversion.write(this);
    }
  });
  defineRGBComponent(Color.prototype, "r", 2);
  defineRGBComponent(Color.prototype, "g", 1);
  defineRGBComponent(Color.prototype, "b", 0);
  defineHSVComponent(Color.prototype, "h");
  defineHSVComponent(Color.prototype, "s");
  defineHSVComponent(Color.prototype, "v");
  Object.defineProperty(Color.prototype, "a", {
    get:function() {
      return this.__state.a;
    },
    set:function(v) {
      this.__state.a = v;
    }
  });
  Object.defineProperty(Color.prototype, "hex", {
    get:function() {
      if (!this.__state.space !== "HEX") {
        this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
      }
      return this.__state.hex;
    },
    set:function(v) {
      this.__state.space = "HEX";
      this.__state.hex = v;
    }
  });
  function defineRGBComponent(target, component, componentHexIndex) {
    Object.defineProperty(target, component, {
      get:function() {
        if (this.__state.space === "RGB") {
          return this.__state[component];
        }
        recalculateRGB(this, component, componentHexIndex);
        return this.__state[component];
      },
      set:function(v) {
        if (this.__state.space !== "RGB") {
          recalculateRGB(this, component, componentHexIndex);
          this.__state.space = "RGB";
        }
        this.__state[component] = v;
      }
    });
  }
  function defineHSVComponent(target, component) {
    Object.defineProperty(target, component, {
      get:function() {
        if (this.__state.space === "HSV") return this.__state[component];
        recalculateHSV(this);
        return this.__state[component];
      },
      set:function(v) {
        if (this.__state.space !== "HSV") {
          recalculateHSV(this);
          this.__state.space = "HSV";
        }
        this.__state[component] = v;
      }
    });
  }
  function recalculateRGB(color, component, componentHexIndex) {
    if (color.__state.space === "HEX") {
      color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === "HSV") {
      common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {
      throw "Corrupted color state";
    }
  }
  function recalculateHSV(color) {
    var result = math.rgb_to_hsv(color.r, color.g, color.b);
    common.extend(color.__state, {
      s:result.s,
      v:result.v
    });
    if (!common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  }
  return Color;
}(dat.color.interpret, dat.color.math = function() {
  var tmpComponent;
  return {
    hsv_to_rgb:function(h, s, v) {
      var hi = Math.floor(h / 60) % 6;
      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1 - s);
      var q = v * (1 - f * s);
      var t = v * (1 - (1 - f) * s);
      var c = [ [ v, t, p ], [ q, v, p ], [ p, v, t ], [ p, q, v ], [ t, p, v ], [ v, p, q ] ][hi];
      return {
        r:c[0] * 255,
        g:c[1] * 255,
        b:c[2] * 255
      };
    },
    rgb_to_hsv:function(r, g, b) {
      var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s;
      if (max != 0) {
        s = delta / max;
      } else {
        return {
          h:NaN,
          s:0,
          v:0
        };
      }
      if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }
      return {
        h:h * 360,
        s:s,
        v:max / 255
      };
    },
    rgb_to_hex:function(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },
    component_from_hex:function(hex, componentIndex) {
      return hex >> componentIndex * 8 & 255;
    },
    hex_with_component:function(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
    }
  };
}(), dat.color.toString, dat.utils.common), dat.color.interpret, dat.utils.common), dat.utils.requestAnimationFrame = function() {
  return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
    window.setTimeout(callback, 1e3 / 60);
  };
}(), dat.dom.CenteredDiv = function(dom, common) {
  var CenteredDiv = function() {
    this.backgroundElement = document.createElement("div");
    common.extend(this.backgroundElement.style, {
      backgroundColor:"rgba(0,0,0,0.8)",
      top:0,
      left:0,
      display:"none",
      zIndex:"1000",
      opacity:0,
      WebkitTransition:"opacity 0.2s linear"
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = "fixed";
    this.domElement = document.createElement("div");
    common.extend(this.domElement.style, {
      position:"fixed",
      display:"none",
      zIndex:"1001",
      opacity:0,
      WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear"
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, "click", function() {
      _this.hide();
    });
  };
  CenteredDiv.prototype.show = function() {
    var _this = this;
    this.backgroundElement.style.display = "block";
    this.domElement.style.display = "block";
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = "scale(1.1)";
    this.layout();
    common.defer(function() {
      _this.backgroundElement.style.opacity = 1;
      _this.domElement.style.opacity = 1;
      _this.domElement.style.webkitTransform = "scale(1)";
    });
  };
  CenteredDiv.prototype.hide = function() {
    var _this = this;
    var hide = function() {
      _this.domElement.style.display = "none";
      _this.backgroundElement.style.display = "none";
      dom.unbind(_this.domElement, "webkitTransitionEnd", hide);
      dom.unbind(_this.domElement, "transitionend", hide);
      dom.unbind(_this.domElement, "oTransitionEnd", hide);
    };
    dom.bind(this.domElement, "webkitTransitionEnd", hide);
    dom.bind(this.domElement, "transitionend", hide);
    dom.bind(this.domElement, "oTransitionEnd", hide);
    this.backgroundElement.style.opacity = 0;
    this.domElement.style.opacity = 0;
    this.domElement.style.webkitTransform = "scale(1.1)";
  };
  CenteredDiv.prototype.layout = function() {
    this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
    this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
  };
  function lockScroll(e) {
    console.log(e);
  }
  return CenteredDiv;
}(dat.dom.dom, dat.utils.common), dat.dom.dom, dat.utils.common);

(function(e) {
  "use strict";
  "function" == typeof define && define.amd ? define([ "jquery" ], e) :"object" == typeof exports ? e(require("jquery")) :e(jQuery);
})(function(e, t) {
  "use strict";
  if (!e.jstree) {
    var i = 0, n = !1, r = !1, s = !1, a = [], o = e("script:last").attr("src"), d = document, l = d.createElement("LI"), c, h;
    l.setAttribute("role", "treeitem"), c = d.createElement("I"), c.className = "jstree-icon jstree-ocl", l.appendChild(c), c = d.createElement("A"), c.className = "jstree-anchor", c.setAttribute("href", "#"), h = d.createElement("I"), h.className = "jstree-icon jstree-themeicon", c.appendChild(h), l.appendChild(c), c = h = null, e.jstree = {
      version:"3.0.0",
      defaults:{
        plugins:[]
      },
      plugins:{},
      path:o && -1 !== o.indexOf("/") ? o.replace(/\/[^\/]+$/, "") :"",
      idregex:/[\\:&'".,=\- \/]/g
    }, e.jstree.create = function(t, n) {
      var r = new e.jstree.core(++i), s = n;
      return n = e.extend(!0, {}, e.jstree.defaults, n), s && s.plugins && (n.plugins = s.plugins), e.each(n.plugins, function(e, t) {
        "core" !== e && (r = r.plugin(t, n[t]));
      }), r.init(t, n), r;
    }, e.jstree.core = function(e) {
      this._id = e, this._cnt = 0, this._data = {
        core:{
          themes:{
            name:!1,
            dots:!1,
            icons:!1
          },
          selected:[],
          last_error:{}
        }
      };
    }, e.jstree.reference = function(i) {
      var n = null, r = null;
      if (i && i.id && (i = i.id), !r || !r.length) try {
        r = e(i);
      } catch (s) {}
      if (!r || !r.length) try {
        r = e("#" + i.replace(e.jstree.idregex, "\\$&"));
      } catch (s) {}
      return r && r.length && (r = r.closest(".jstree")).length && (r = r.data("jstree")) ? n = r :e(".jstree").each(function() {
        var r = e(this).data("jstree");
        return r && r._model.data[i] ? (n = r, !1) :t;
      }), n;
    }, e.fn.jstree = function(i) {
      var n = "string" == typeof i, r = Array.prototype.slice.call(arguments, 1), s = null;
      return this.each(function() {
        var a = e.jstree.reference(this), o = n && a ? a[i] :null;
        return s = n && o ? o.apply(a, r) :null, a || n || i !== t && !e.isPlainObject(i) || e(this).data("jstree", new e.jstree.create(this, i)), (a && !n || i === !0) && (s = a || !1), null !== s && s !== t ? !1 :t;
      }), null !== s && s !== t ? s :this;
    }, e.expr[":"].jstree = e.expr.createPseudo(function(i) {
      return function(i) {
        return e(i).hasClass("jstree") && e(i).data("jstree") !== t;
      };
    }), e.jstree.defaults.core = {
      data:!1,
      strings:!1,
      check_callback:!1,
      error:e.noop,
      animation:200,
      multiple:!0,
      themes:{
        name:!1,
        url:!1,
        dir:!1,
        dots:!0,
        icons:!0,
        stripes:!1,
        variant:!1,
        responsive:!0
      },
      expand_selected_onload:!0
    }, e.jstree.core.prototype = {
      plugin:function(t, i) {
        var n = e.jstree.plugins[t];
        return n ? (this._data[t] = {}, n.prototype = this, new n(i, this)) :this;
      },
      init:function(t, i) {
        this._model = {
          data:{
            "#":{
              id:"#",
              parent:null,
              parents:[],
              children:[],
              children_d:[],
              state:{
                loaded:!1
              }
            }
          },
          changed:[],
          force_full_redraw:!1,
          redraw_timeout:!1,
          default_state:{
            loaded:!0,
            opened:!1,
            selected:!1,
            disabled:!1
          }
        }, this.element = e(t).addClass("jstree jstree-" + this._id), this.settings = i, this.element.bind("destroyed", e.proxy(this.teardown, this)), this._data.core.ready = !1, this._data.core.loaded = !1, this._data.core.rtl = "rtl" === this.element.css("direction"), this.element[this._data.core.rtl ? "addClass" :"removeClass"]("jstree-rtl"), this.element.attr("role", "tree"), this.bind(), this.trigger("init"), this._data.core.original_container_html = this.element.find(" > ul > li").clone(!0), this._data.core.original_container_html.find("li").addBack().contents().filter(function() {
          return 3 === this.nodeType && (!this.nodeValue || /^\s+$/.test(this.nodeValue));
        }).remove(), this.element.html("<ul class='jstree-container-ul'><li class='jstree-initial-node jstree-loading jstree-leaf jstree-last'><i class='jstree-icon jstree-ocl'></i><a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>"), this._data.core.li_height = this.get_container_ul().children("li:eq(0)").height() || 18, this.trigger("loading"), this.load_node("#");
      },
      destroy:function() {
        this.element.unbind("destroyed", this.teardown), this.teardown();
      },
      teardown:function() {
        this.unbind(), this.element.removeClass("jstree").removeData("jstree").find("[class^='jstree']").addBack().attr("class", function() {
          return this.className.replace(/jstree[^ ]*|$/gi, "");
        }), this.element = null;
      },
      bind:function() {
        this.element.on("dblclick.jstree", function() {
          if (document.selection && document.selection.empty) document.selection.empty(); else if (window.getSelection) {
            var e = window.getSelection();
            try {
              e.removeAllRanges(), e.collapse();
            } catch (t) {}
          }
        }).on("click.jstree", ".jstree-ocl", e.proxy(function(e) {
          this.toggle_node(e.target);
        }, this)).on("click.jstree", ".jstree-anchor", e.proxy(function(t) {
          t.preventDefault(), e(t.currentTarget).focus(), this.activate_node(t.currentTarget, t);
        }, this)).on("keydown.jstree", ".jstree-anchor", e.proxy(function(t) {
          if ("INPUT" === t.target.tagName) return !0;
          var i = null;
          switch (t.which) {
           case 13:
           case 32:
            t.type = "click", e(t.currentTarget).trigger(t);
            break;

           case 37:
            t.preventDefault(), this.is_open(t.currentTarget) ? this.close_node(t.currentTarget) :(i = this.get_prev_dom(t.currentTarget), i && i.length && i.children(".jstree-anchor").focus());
            break;

           case 38:
            t.preventDefault(), i = this.get_prev_dom(t.currentTarget), i && i.length && i.children(".jstree-anchor").focus();
            break;

           case 39:
            t.preventDefault(), this.is_closed(t.currentTarget) ? this.open_node(t.currentTarget, function(e) {
              this.get_node(e, !0).children(".jstree-anchor").focus();
            }) :(i = this.get_next_dom(t.currentTarget), i && i.length && i.children(".jstree-anchor").focus());
            break;

           case 40:
            t.preventDefault(), i = this.get_next_dom(t.currentTarget), i && i.length && i.children(".jstree-anchor").focus();
            break;

           case 46:
            t.preventDefault(), i = this.get_node(t.currentTarget), i && i.id && "#" !== i.id && (i = this.is_selected(i) ? this.get_selected() :i);
            break;

           case 113:
            t.preventDefault(), i = this.get_node(t.currentTarget);
            break;

           default:          }
        }, this)).on("load_node.jstree", e.proxy(function(t, i) {
          if (i.status && ("#" !== i.node.id || this._data.core.loaded || (this._data.core.loaded = !0, this.trigger("loaded")), !this._data.core.ready && !this.get_container_ul().find(".jstree-loading:eq(0)").length)) {
            if (this._data.core.ready = !0, this._data.core.selected.length) {
              if (this.settings.core.expand_selected_onload) {
                var n = [], r, s;
                for (r = 0, s = this._data.core.selected.length; s > r; r++) n = n.concat(this._model.data[this._data.core.selected[r]].parents);
                for (n = e.vakata.array_unique(n), r = 0, s = n.length; s > r; r++) this.open_node(n[r], !1, 0);
              }
              this.trigger("changed", {
                action:"ready",
                selected:this._data.core.selected
              });
            }
            setTimeout(e.proxy(function() {
              this.trigger("ready");
            }, this), 0);
          }
        }, this)).on("init.jstree", e.proxy(function() {
          var e = this.settings.core.themes;
          this._data.core.themes.dots = e.dots, this._data.core.themes.stripes = e.stripes, this._data.core.themes.icons = e.icons, this.set_theme(e.name || "default", e.url), this.set_theme_variant(e.variant);
        }, this)).on("loading.jstree", e.proxy(function() {
          this[this._data.core.themes.dots ? "show_dots" :"hide_dots"](), this[this._data.core.themes.icons ? "show_icons" :"hide_icons"](), this[this._data.core.themes.stripes ? "show_stripes" :"hide_stripes"]();
        }, this)).on("focus.jstree", ".jstree-anchor", e.proxy(function(t) {
          this.element.find(".jstree-hovered").not(t.currentTarget).mouseleave(), e(t.currentTarget).mouseenter();
        }, this)).on("mouseenter.jstree", ".jstree-anchor", e.proxy(function(e) {
          this.hover_node(e.currentTarget);
        }, this)).on("mouseleave.jstree", ".jstree-anchor", e.proxy(function(e) {
          this.dehover_node(e.currentTarget);
        }, this));
      },
      unbind:function() {
        this.element.off(".jstree"), e(document).off(".jstree-" + this._id);
      },
      trigger:function(e, t) {
        t || (t = {}), t.instance = this, this.element.triggerHandler(e.replace(".jstree", "") + ".jstree", t);
      },
      get_container:function() {
        return this.element;
      },
      get_container_ul:function() {
        return this.element.children("ul:eq(0)");
      },
      get_string:function(t) {
        var i = this.settings.core.strings;
        return e.isFunction(i) ? i.call(this, t) :i && i[t] ? i[t] :t;
      },
      _firstChild:function(e) {
        e = e ? e.firstChild :null;
        while (null !== e && 1 !== e.nodeType) e = e.nextSibling;
        return e;
      },
      _nextSibling:function(e) {
        e = e ? e.nextSibling :null;
        while (null !== e && 1 !== e.nodeType) e = e.nextSibling;
        return e;
      },
      _previousSibling:function(e) {
        e = e ? e.previousSibling :null;
        while (null !== e && 1 !== e.nodeType) e = e.previousSibling;
        return e;
      },
      get_node:function(t, i) {
        t && t.id && (t = t.id);
        var n;
        try {
          if (this._model.data[t]) t = this._model.data[t]; else if (((n = e(t, this.element)).length || (n = e("#" + t.replace(e.jstree.idregex, "\\$&"), this.element)).length) && this._model.data[n.closest("li").attr("id")]) t = this._model.data[n.closest("li").attr("id")]; else {
            if (!(n = e(t, this.element)).length || !n.hasClass("jstree")) return !1;
            t = this._model.data["#"];
          }
          return i && (t = "#" === t.id ? this.element :e("#" + t.id.replace(e.jstree.idregex, "\\$&"), this.element)), t;
        } catch (r) {
          return !1;
        }
      },
      get_path:function(e, t, i) {
        if (e = e.parents ? e :this.get_node(e), !e || "#" === e.id || !e.parents) return !1;
        var n, r, s = [];
        for (s.push(i ? e.id :e.text), n = 0, r = e.parents.length; r > n; n++) s.push(i ? e.parents[n] :this.get_text(e.parents[n]));
        return s = s.reverse().slice(1), t ? s.join(t) :s;
      },
      get_next_dom:function(t, i) {
        var n;
        return t = this.get_node(t, !0), t[0] === this.element[0] ? (n = this._firstChild(this.get_container_ul()[0]), n ? e(n) :!1) :t && t.length ? i ? (n = this._nextSibling(t[0]), n ? e(n) :!1) :t.hasClass("jstree-open") ? (n = this._firstChild(t.children("ul")[0]), n ? e(n) :!1) :null !== (n = this._nextSibling(t[0])) ? e(n) :t.parentsUntil(".jstree", "li").next("li").eq(0) :!1;
      },
      get_prev_dom:function(t, i) {
        var n;
        if (t = this.get_node(t, !0), t[0] === this.element[0]) return n = this.get_container_ul()[0].lastChild, n ? e(n) :!1;
        if (!t || !t.length) return !1;
        if (i) return n = this._previousSibling(t[0]), n ? e(n) :!1;
        if (null !== (n = this._previousSibling(t[0]))) {
          t = e(n);
          while (t.hasClass("jstree-open")) t = t.children("ul:eq(0)").children("li:last");
          return t;
        }
        return n = t[0].parentNode.parentNode, n && "LI" === n.tagName ? e(n) :!1;
      },
      get_parent:function(e) {
        return e = this.get_node(e), e && "#" !== e.id ? e.parent :!1;
      },
      get_children_dom:function(e) {
        return e = this.get_node(e, !0), e[0] === this.element[0] ? this.get_container_ul().children("li") :e && e.length ? e.children("ul").children("li") :!1;
      },
      is_parent:function(e) {
        return e = this.get_node(e), e && (e.state.loaded === !1 || e.children.length > 0);
      },
      is_loaded:function(e) {
        return e = this.get_node(e), e && e.state.loaded;
      },
      is_loading:function(e) {
        return e = this.get_node(e), e && e.state && e.state.loading;
      },
      is_open:function(e) {
        return e = this.get_node(e), e && e.state.opened;
      },
      is_closed:function(e) {
        return e = this.get_node(e), e && this.is_parent(e) && !e.state.opened;
      },
      is_leaf:function(e) {
        return !this.is_parent(e);
      },
      load_node:function(t, i) {
        var n, r, s, a, o, d, l;
        if (e.isArray(t)) {
          for (t = t.slice(), n = 0, r = t.length; r > n; n++) this.load_node(t[n], i);
          return !0;
        }
        if (t = this.get_node(t), !t) return i && i.call(this, t, !1), !1;
        if (t.state.loaded) {
          for (t.state.loaded = !1, s = 0, a = t.children_d.length; a > s; s++) {
            for (o = 0, d = t.parents.length; d > o; o++) this._model.data[t.parents[o]].children_d = e.vakata.array_remove_item(this._model.data[t.parents[o]].children_d, t.children_d[s]);
            this._model.data[t.children_d[s]].state.selected && (l = !0, this._data.core.selected = e.vakata.array_remove_item(this._data.core.selected, t.children_d[s])), delete this._model.data[t.children_d[s]];
          }
          t.children = [], t.children_d = [], l && this.trigger("changed", {
            action:"load_node",
            node:t,
            selected:this._data.core.selected
          });
        }
        return t.state.loading = !0, this.get_node(t, !0).addClass("jstree-loading"), this._load_node(t, e.proxy(function(e) {
          t.state.loading = !1, t.state.loaded = e;
          var n = this.get_node(t, !0);
          t.state.loaded && !t.children.length && n && n.length && !n.hasClass("jstree-leaf") && n.removeClass("jstree-closed jstree-open").addClass("jstree-leaf"), n.removeClass("jstree-loading"), this.trigger("load_node", {
            node:t,
            status:e
          }), i && i.call(this, t, e);
        }, this)), !0;
      },
      _load_nodes:function(e, t, i) {
        var n = !0, r = function() {
          this._load_nodes(e, t, !0);
        }, s = this._model.data, a, o;
        for (a = 0, o = e.length; o > a; a++) !s[e[a]] || s[e[a]].state.loaded && i || (this.is_loading(e[a]) || this.load_node(e[a], r), n = !1);
        n && (t.done || (t.call(this, e), t.done = !0));
      },
      _load_node:function(t, i) {
        var n = this.settings.core.data, r;
        return n ? e.isFunction(n) ? n.call(this, t, e.proxy(function(n) {
          return n === !1 ? i.call(this, !1) :i.call(this, this["string" == typeof n ? "_append_html_data" :"_append_json_data"](t, "string" == typeof n ? e(n) :n));
        }, this)) :"object" == typeof n ? n.url ? (n = e.extend(!0, {}, n), e.isFunction(n.url) && (n.url = n.url.call(this, t)), e.isFunction(n.data) && (n.data = n.data.call(this, t)), e.ajax(n).done(e.proxy(function(n, r, s) {
          var a = s.getResponseHeader("Content-Type");
          return -1 !== a.indexOf("json") || "object" == typeof n ? i.call(this, this._append_json_data(t, n)) :-1 !== a.indexOf("html") || "string" == typeof n ? i.call(this, this._append_html_data(t, e(n))) :(this._data.core.last_error = {
            error:"ajax",
            plugin:"core",
            id:"core_04",
            reason:"Could not load node",
            data:JSON.stringify({
              id:t.id,
              xhr:s
            })
          }, i.call(this, !1));
        }, this)).fail(e.proxy(function(e) {
          i.call(this, !1), this._data.core.last_error = {
            error:"ajax",
            plugin:"core",
            id:"core_04",
            reason:"Could not load node",
            data:JSON.stringify({
              id:t.id,
              xhr:e
            })
          }, this.settings.core.error.call(this, this._data.core.last_error);
        }, this))) :(r = e.isArray(n) || e.isPlainObject(n) ? JSON.parse(JSON.stringify(n)) :n, "#" !== t.id && (this._data.core.last_error = {
          error:"nodata",
          plugin:"core",
          id:"core_05",
          reason:"Could not load node",
          data:JSON.stringify({
            id:t.id
          })
        }), i.call(this, "#" === t.id ? this._append_json_data(t, r) :!1)) :"string" == typeof n ? ("#" !== t.id && (this._data.core.last_error = {
          error:"nodata",
          plugin:"core",
          id:"core_06",
          reason:"Could not load node",
          data:JSON.stringify({
            id:t.id
          })
        }), i.call(this, "#" === t.id ? this._append_html_data(t, e(n)) :!1)) :i.call(this, !1) :i.call(this, "#" === t.id ? this._append_html_data(t, this._data.core.original_container_html.clone(!0)) :!1);
      },
      _node_changed:function(e) {
        e = this.get_node(e), e && this._model.changed.push(e.id);
      },
      _append_html_data:function(t, i) {
        t = this.get_node(t), t.children = [], t.children_d = [];
        var n = i.is("ul") ? i.children() :i, r = t.id, s = [], a = [], o = this._model.data, d = o[r], l = this._data.core.selected.length, c, h, _;
        for (n.each(e.proxy(function(t, i) {
          c = this._parse_model_from_html(e(i), r, d.parents.concat()), c && (s.push(c), a.push(c), o[c].children_d.length && (a = a.concat(o[c].children_d)));
        }, this)), d.children = s, d.children_d = a, h = 0, _ = d.parents.length; _ > h; h++) o[d.parents[h]].children_d = o[d.parents[h]].children_d.concat(a);
        return this.trigger("model", {
          nodes:a,
          parent:r
        }), "#" !== r ? (this._node_changed(r), this.redraw()) :(this.get_container_ul().children(".jstree-initial-node").remove(), this.redraw(!0)), this._data.core.selected.length !== l && this.trigger("changed", {
          action:"model",
          selected:this._data.core.selected
        }), !0;
      },
      _append_json_data:function(i, n) {
        i = this.get_node(i), i.children = [], i.children_d = [];
        var r = n, s = i.id, a = [], o = [], d = this._model.data, l = d[s], c = this._data.core.selected.length, h, _, u;
        if (r.d && (r = r.d, "string" == typeof r && (r = JSON.parse(r))), e.isArray(r) || (r = [ r ]), r.length && r[0].id !== t && r[0].parent !== t) {
          for (_ = 0, u = r.length; u > _; _++) r[_].children || (r[_].children = []), d["" + r[_].id] = r[_];
          for (_ = 0, u = r.length; u > _; _++) d["" + r[_].parent].children.push("" + r[_].id), l.children_d.push("" + r[_].id);
          for (_ = 0, u = l.children.length; u > _; _++) h = this._parse_model_from_flat_json(d[l.children[_]], s, l.parents.concat()), o.push(h), d[h].children_d.length && (o = o.concat(d[h].children_d));
        } else {
          for (_ = 0, u = r.length; u > _; _++) h = this._parse_model_from_json(r[_], s, l.parents.concat()), h && (a.push(h), o.push(h), d[h].children_d.length && (o = o.concat(d[h].children_d)));
          for (l.children = a, l.children_d = o, _ = 0, u = l.parents.length; u > _; _++) d[l.parents[_]].children_d = d[l.parents[_]].children_d.concat(o);
        }
        return this.trigger("model", {
          nodes:o,
          parent:s
        }), "#" !== s ? (this._node_changed(s), this.redraw()) :this.redraw(!0), this._data.core.selected.length !== c && this.trigger("changed", {
          action:"model",
          selected:this._data.core.selected
        }), !0;
      },
      _parse_model_from_html:function(i, n, r) {
        r = r ? [].concat(r) :[], n && r.unshift(n);
        var s, a, o = this._model.data, d = {
          id:!1,
          text:!1,
          icon:!0,
          parent:n,
          parents:r,
          children:[],
          children_d:[],
          data:null,
          state:{},
          li_attr:{
            id:!1
          },
          a_attr:{
            href:"#"
          },
          original:!1
        }, l, c, h;
        for (l in this._model.default_state) this._model.default_state.hasOwnProperty(l) && (d.state[l] = this._model.default_state[l]);
        if (c = e.vakata.attributes(i, !0), e.each(c, function(i, n) {
          return n = e.trim(n), n.length ? (d.li_attr[i] = n, "id" === i && (d.id = "" + n), t) :!0;
        }), c = i.children("a").eq(0), c.length && (c = e.vakata.attributes(c, !0), e.each(c, function(t, i) {
          i = e.trim(i), i.length && (d.a_attr[t] = i);
        })), c = i.children("a:eq(0)").length ? i.children("a:eq(0)").clone() :i.clone(), c.children("ins, i, ul").remove(), c = c.html(), c = e("<div />").html(c), d.text = c.html(), c = i.data(), d.data = c ? e.extend(!0, {}, c) :null, d.state.opened = i.hasClass("jstree-open"), d.state.selected = i.children("a").hasClass("jstree-clicked"), d.state.disabled = i.children("a").hasClass("jstree-disabled"), d.data && d.data.jstree) for (l in d.data.jstree) d.data.jstree.hasOwnProperty(l) && (d.state[l] = d.data.jstree[l]);
        c = i.children("a").children(".jstree-themeicon"), c.length && (d.icon = c.hasClass("jstree-themeicon-hidden") ? !1 :c.attr("rel")), d.state.icon && (d.icon = d.state.icon), c = i.children("ul").children("li");
        do h = "j" + this._id + "_" + ++this._cnt; while (o[h]);
        return d.id = d.li_attr.id ? "" + d.li_attr.id :h, c.length ? (c.each(e.proxy(function(t, i) {
          s = this._parse_model_from_html(e(i), d.id, r), a = this._model.data[s], d.children.push(s), a.children_d.length && (d.children_d = d.children_d.concat(a.children_d));
        }, this)), d.children_d = d.children_d.concat(d.children)) :i.hasClass("jstree-closed") && (d.state.loaded = !1), d.li_attr["class"] && (d.li_attr["class"] = d.li_attr["class"].replace("jstree-closed", "").replace("jstree-open", "")), d.a_attr["class"] && (d.a_attr["class"] = d.a_attr["class"].replace("jstree-clicked", "").replace("jstree-disabled", "")), o[d.id] = d, d.state.selected && this._data.core.selected.push(d.id), d.id;
      },
      _parse_model_from_flat_json:function(e, i, n) {
        n = n ? n.concat() :[], i && n.unshift(i);
        var r = "" + e.id, s = this._model.data, a = this._model.default_state, o, d, l, c, h = {
          id:r,
          text:e.text || "",
          icon:e.icon !== t ? e.icon :!0,
          parent:i,
          parents:n,
          children:e.children || [],
          children_d:e.children_d || [],
          data:e.data,
          state:{},
          li_attr:{
            id:!1
          },
          a_attr:{
            href:"#"
          },
          original:!1
        };
        for (o in a) a.hasOwnProperty(o) && (h.state[o] = a[o]);
        if (e && e.data && e.data.jstree && e.data.jstree.icon && (h.icon = e.data.jstree.icon), e && e.data && (h.data = e.data, e.data.jstree)) for (o in e.data.jstree) e.data.jstree.hasOwnProperty(o) && (h.state[o] = e.data.jstree[o]);
        if (e && "object" == typeof e.state) for (o in e.state) e.state.hasOwnProperty(o) && (h.state[o] = e.state[o]);
        if (e && "object" == typeof e.li_attr) for (o in e.li_attr) e.li_attr.hasOwnProperty(o) && (h.li_attr[o] = e.li_attr[o]);
        if (h.li_attr.id || (h.li_attr.id = r), e && "object" == typeof e.a_attr) for (o in e.a_attr) e.a_attr.hasOwnProperty(o) && (h.a_attr[o] = e.a_attr[o]);
        for (e && e.children && e.children === !0 && (h.state.loaded = !1, h.children = [], h.children_d = []), s[h.id] = h, o = 0, d = h.children.length; d > o; o++) l = this._parse_model_from_flat_json(s[h.children[o]], h.id, n), c = s[l], h.children_d.push(l), c.children_d.length && (h.children_d = h.children_d.concat(c.children_d));
        return delete e.data, delete e.children, s[h.id].original = e, h.state.selected && this._data.core.selected.push(h.id), h.id;
      },
      _parse_model_from_json:function(e, i, n) {
        n = n ? n.concat() :[], i && n.unshift(i);
        var r = !1, s, a, o, d, l = this._model.data, c = this._model.default_state, h;
        do r = "j" + this._id + "_" + ++this._cnt; while (l[r]);
        h = {
          id:!1,
          text:"string" == typeof e ? e :"",
          icon:"object" == typeof e && e.icon !== t ? e.icon :!0,
          parent:i,
          parents:n,
          children:[],
          children_d:[],
          data:null,
          state:{},
          li_attr:{
            id:!1
          },
          a_attr:{
            href:"#"
          },
          original:!1
        };
        for (s in c) c.hasOwnProperty(s) && (h.state[s] = c[s]);
        if (e && e.id && (h.id = "" + e.id), e && e.text && (h.text = e.text), e && e.data && e.data.jstree && e.data.jstree.icon && (h.icon = e.data.jstree.icon), e && e.data && (h.data = e.data, e.data.jstree)) for (s in e.data.jstree) e.data.jstree.hasOwnProperty(s) && (h.state[s] = e.data.jstree[s]);
        if (e && "object" == typeof e.state) for (s in e.state) e.state.hasOwnProperty(s) && (h.state[s] = e.state[s]);
        if (e && "object" == typeof e.li_attr) for (s in e.li_attr) e.li_attr.hasOwnProperty(s) && (h.li_attr[s] = e.li_attr[s]);
        if (h.li_attr.id && !h.id && (h.id = "" + h.li_attr.id), h.id || (h.id = r), h.li_attr.id || (h.li_attr.id = h.id), e && "object" == typeof e.a_attr) for (s in e.a_attr) e.a_attr.hasOwnProperty(s) && (h.a_attr[s] = e.a_attr[s]);
        if (e && e.children && e.children.length) {
          for (s = 0, a = e.children.length; a > s; s++) o = this._parse_model_from_json(e.children[s], h.id, n), d = l[o], h.children.push(o), d.children_d.length && (h.children_d = h.children_d.concat(d.children_d));
          h.children_d = h.children_d.concat(h.children);
        }
        return e && e.children && e.children === !0 && (h.state.loaded = !1, h.children = [], h.children_d = []), delete e.data, delete e.children, h.original = e, l[h.id] = h, h.state.selected && this._data.core.selected.push(h.id), h.id;
      },
      _redraw:function() {
        var e = this._model.force_full_redraw ? this._model.data["#"].children.concat([]) :this._model.changed.concat([]), t = document.createElement("UL"), i, n, r;
        for (n = 0, r = e.length; r > n; n++) i = this.redraw_node(e[n], !0, this._model.force_full_redraw), i && this._model.force_full_redraw && t.appendChild(i);
        this._model.force_full_redraw && (t.className = this.get_container_ul()[0].className, this.element.empty().append(t)), this._model.force_full_redraw = !1, this._model.changed = [], this.trigger("redraw", {
          nodes:e
        });
      },
      redraw:function(e) {
        e && (this._model.force_full_redraw = !0), this._redraw();
      },
      redraw_node:function(t, i, n) {
        var r = this.get_node(t), s = !1, a = !1, o = !1, d = !1, c = !1, h = !1, _ = "", u = document, g = this._model.data, f = !1, p = !1;
        if (!r) return !1;
        if ("#" === r.id) return this.redraw(!0);
        if (i = i || 0 === r.children.length, t = document.querySelector ? this.element[0].querySelector("#" + (-1 !== "0123456789".indexOf(r.id[0]) ? "\\3" + r.id[0] + " " + r.id.substr(1).replace(e.jstree.idregex, "\\$&") :r.id.replace(e.jstree.idregex, "\\$&"))) :document.getElementById(r.id)) t = e(t), n || (s = t.parent().parent()[0], s === this.element[0] && (s = null), a = t.index()), i || !r.children.length || t.children("ul").length || (i = !0), i || (o = t.children("UL")[0]), p = t.attr("aria-selected"), f = t.children(".jstree-anchor")[0] === document.activeElement, t.remove(); else if (i = !0, !n) {
          if (s = "#" !== r.parent ? e("#" + r.parent.replace(e.jstree.idregex, "\\$&"), this.element)[0] :null, !(null === s || s && g[r.parent].state.opened)) return !1;
          a = e.inArray(r.id, null === s ? g["#"].children :g[r.parent].children);
        }
        t = l.cloneNode(!0), _ = "jstree-node ";
        for (d in r.li_attr) if (r.li_attr.hasOwnProperty(d)) {
          if ("id" === d) continue;
          "class" !== d ? t.setAttribute(d, r.li_attr[d]) :_ += r.li_attr[d];
        }
        p && "false" !== p && t.setAttribute("aria-selected", !0), r.state.loaded && !r.children.length ? _ += " jstree-leaf" :(_ += r.state.opened && r.state.loaded ? " jstree-open" :" jstree-closed", t.setAttribute("aria-expanded", r.state.opened && r.state.loaded)), null !== r.parent && g[r.parent].children[g[r.parent].children.length - 1] === r.id && (_ += " jstree-last"), t.id = r.id, t.className = _, _ = (r.state.selected ? " jstree-clicked" :"") + (r.state.disabled ? " jstree-disabled" :"");
        for (c in r.a_attr) if (r.a_attr.hasOwnProperty(c)) {
          if ("href" === c && "#" === r.a_attr[c]) continue;
          "class" !== c ? t.childNodes[1].setAttribute(c, r.a_attr[c]) :_ += " " + r.a_attr[c];
        }
        if (_.length && (t.childNodes[1].className = "jstree-anchor " + _), (r.icon && r.icon !== !0 || r.icon === !1) && (r.icon === !1 ? t.childNodes[1].childNodes[0].className += " jstree-themeicon-hidden" :-1 === r.icon.indexOf("/") && -1 === r.icon.indexOf(".") ? t.childNodes[1].childNodes[0].className += " " + r.icon + " jstree-themeicon-custom" :(t.childNodes[1].childNodes[0].style.backgroundImage = "url(" + r.icon + ")", t.childNodes[1].childNodes[0].style.backgroundPosition = "center center", t.childNodes[1].childNodes[0].style.backgroundSize = "auto", t.childNodes[1].childNodes[0].className += " jstree-themeicon-custom")), t.childNodes[1].innerHTML += r.text, i && r.children.length && r.state.opened && r.state.loaded) {
          for (h = u.createElement("UL"), h.setAttribute("role", "group"), h.className = "jstree-children", d = 0, c = r.children.length; c > d; d++) h.appendChild(this.redraw_node(r.children[d], i, !0));
          t.appendChild(h);
        }
        return o && t.appendChild(o), n || (s || (s = this.element[0]), s.getElementsByTagName("UL").length ? s = s.getElementsByTagName("UL")[0] :(d = u.createElement("UL"), d.setAttribute("role", "group"), d.className = "jstree-children", s.appendChild(d), s = d), s.childNodes.length > a ? s.insertBefore(t, s.childNodes[a]) :s.appendChild(t), f && t.childNodes[1].focus()), r.state.opened && !r.state.loaded && (r.state.opened = !1, setTimeout(e.proxy(function() {
          this.open_node(r.id, !1, 0);
        }, this), 0)), t;
      },
      open_node:function(i, n, r) {
        var s, a, o, d;
        if (e.isArray(i)) {
          for (i = i.slice(), s = 0, a = i.length; a > s; s++) this.open_node(i[s], n, r);
          return !0;
        }
        if (i = this.get_node(i), !i || "#" === i.id) return !1;
        if (r = r === t ? this.settings.core.animation :r, !this.is_closed(i)) return n && n.call(this, i, !1), !1;
        if (this.is_loaded(i)) o = this.get_node(i, !0), d = this, o.length && (i.children.length && !this._firstChild(o.children("ul")[0]) && (i.state.opened = !0, this.redraw_node(i, !0), o = this.get_node(i, !0)), r ? (this.trigger("before_open", {
          node:i
        }), o.children("ul").css("display", "none").end().removeClass("jstree-closed").addClass("jstree-open").attr("aria-expanded", !0).children("ul").stop(!0, !0).slideDown(r, function() {
          this.style.display = "", d.trigger("after_open", {
            node:i
          });
        })) :(this.trigger("before_open", {
          node:i
        }), o[0].className = o[0].className.replace("jstree-closed", "jstree-open"), o[0].setAttribute("aria-expanded", !0))), i.state.opened = !0, n && n.call(this, i, !0), o.length || this.trigger("before_open", {
          node:i
        }), this.trigger("open_node", {
          node:i
        }), r && o.length || this.trigger("after_open", {
          node:i
        }); else {
          if (this.is_loading(i)) return setTimeout(e.proxy(function() {
            this.open_node(i, n, r);
          }, this), 500);
          this.load_node(i, function(e, t) {
            return t ? this.open_node(e, n, r) :n ? n.call(this, e, !1) :!1;
          });
        }
      },
      _open_to:function(t) {
        if (t = this.get_node(t), !t || "#" === t.id) return !1;
        var i, n, r = t.parents;
        for (i = 0, n = r.length; n > i; i += 1) "#" !== i && this.open_node(r[i], !1, 0);
        return e("#" + t.id.replace(e.jstree.idregex, "\\$&"), this.element);
      },
      close_node:function(i, n) {
        var r, s, a, o;
        if (e.isArray(i)) {
          for (i = i.slice(), r = 0, s = i.length; s > r; r++) this.close_node(i[r], n);
          return !0;
        }
        return i = this.get_node(i), i && "#" !== i.id ? this.is_closed(i) ? !1 :(n = n === t ? this.settings.core.animation :n, a = this, o = this.get_node(i, !0), o.length && (n ? o.children("ul").attr("style", "display:block !important").end().removeClass("jstree-open").addClass("jstree-closed").attr("aria-expanded", !1).children("ul").stop(!0, !0).slideUp(n, function() {
          this.style.display = "", o.children("ul").remove(), a.trigger("after_close", {
            node:i
          });
        }) :(o[0].className = o[0].className.replace("jstree-open", "jstree-closed"), o.attr("aria-expanded", !1).children("ul").remove())), i.state.opened = !1, this.trigger("close_node", {
          node:i
        }), n && o.length || this.trigger("after_close", {
          node:i
        }), t) :!1;
      },
      toggle_node:function(i) {
        var n, r;
        if (e.isArray(i)) {
          for (i = i.slice(), n = 0, r = i.length; r > n; n++) this.toggle_node(i[n]);
          return !0;
        }
        return this.is_closed(i) ? this.open_node(i) :this.is_open(i) ? this.close_node(i) :t;
      },
      open_all:function(e, t, i) {
        if (e || (e = "#"), e = this.get_node(e), !e) return !1;
        var n = "#" === e.id ? this.get_container_ul() :this.get_node(e, !0), r, s, a;
        if (!n.length) {
          for (r = 0, s = e.children_d.length; s > r; r++) this.is_closed(this._model.data[e.children_d[r]]) && (this._model.data[e.children_d[r]].state.opened = !0);
          return this.trigger("open_all", {
            node:e
          });
        }
        i = i || n, a = this, n = this.is_closed(e) ? n.find("li.jstree-closed").addBack() :n.find("li.jstree-closed"), n.each(function() {
          a.open_node(this, function(e, n) {
            n && this.is_parent(e) && this.open_all(e, t, i);
          }, t || 0);
        }), 0 === i.find("li.jstree-closed").length && this.trigger("open_all", {
          node:this.get_node(i)
        });
      },
      close_all:function(t, i) {
        if (t || (t = "#"), t = this.get_node(t), !t) return !1;
        var n = "#" === t.id ? this.get_container_ul() :this.get_node(t, !0), r = this, s, a;
        if (!n.length) {
          for (s = 0, a = t.children_d.length; a > s; s++) this._model.data[t.children_d[s]].state.opened = !1;
          return this.trigger("close_all", {
            node:t
          });
        }
        n = this.is_open(t) ? n.find("li.jstree-open").addBack() :n.find("li.jstree-open"), e(n.get().reverse()).each(function() {
          r.close_node(this, i || 0);
        }), this.trigger("close_all", {
          node:t
        });
      },
      is_disabled:function(e) {
        return e = this.get_node(e), e && e.state && e.state.disabled;
      },
      enable_node:function(i) {
        var n, r;
        if (e.isArray(i)) {
          for (i = i.slice(), n = 0, r = i.length; r > n; n++) this.enable_node(i[n]);
          return !0;
        }
        return i = this.get_node(i), i && "#" !== i.id ? (i.state.disabled = !1, this.get_node(i, !0).children(".jstree-anchor").removeClass("jstree-disabled"), this.trigger("enable_node", {
          node:i
        }), t) :!1;
      },
      disable_node:function(i) {
        var n, r;
        if (e.isArray(i)) {
          for (i = i.slice(), n = 0, r = i.length; r > n; n++) this.disable_node(i[n]);
          return !0;
        }
        return i = this.get_node(i), i && "#" !== i.id ? (i.state.disabled = !0, this.get_node(i, !0).children(".jstree-anchor").addClass("jstree-disabled"), this.trigger("disable_node", {
          node:i
        }), t) :!1;
      },
      activate_node:function(e, i) {
        if (this.is_disabled(e)) return !1;
        if (this._data.core.last_clicked = this._data.core.last_clicked && this._data.core.last_clicked.id !== t ? this.get_node(this._data.core.last_clicked.id) :null, this._data.core.last_clicked && !this._data.core.last_clicked.state.selected && (this._data.core.last_clicked = null), !this._data.core.last_clicked && this._data.core.selected.length && (this._data.core.last_clicked = this.get_node(this._data.core.selected[this._data.core.selected.length - 1])), this.settings.core.multiple && (i.metaKey || i.ctrlKey || i.shiftKey) && (!i.shiftKey || this._data.core.last_clicked && this.get_parent(e) && this.get_parent(e) === this._data.core.last_clicked.parent)) if (i.shiftKey) {
          var n = this.get_node(e).id, r = this._data.core.last_clicked.id, s = this.get_node(this._data.core.last_clicked.parent).children, a = !1, o, d;
          for (o = 0, d = s.length; d > o; o += 1) s[o] === n && (a = !a), s[o] === r && (a = !a), a || s[o] === n || s[o] === r ? this.select_node(s[o], !1, !1, i) :this.deselect_node(s[o], !1, !1, i);
        } else this.is_selected(e) ? this.deselect_node(e, !1, !1, i) :this.select_node(e, !1, !1, i); else !this.settings.core.multiple && (i.metaKey || i.ctrlKey || i.shiftKey) && this.is_selected(e) ? this.deselect_node(e, !1, !1, i) :(this.deselect_all(!0), this.select_node(e, !1, !1, i), this._data.core.last_clicked = this.get_node(e));
        this.trigger("activate_node", {
          node:this.get_node(e)
        });
      },
      hover_node:function(e) {
        if (e = this.get_node(e, !0), !e || !e.length || e.children(".jstree-hovered").length) return !1;
        var t = this.element.find(".jstree-hovered"), i = this.element;
        t && t.length && this.dehover_node(t), e.children(".jstree-anchor").addClass("jstree-hovered"), this.trigger("hover_node", {
          node:this.get_node(e)
        }), setTimeout(function() {
          i.attr("aria-activedescendant", e[0].id), e.attr("aria-selected", !0);
        }, 0);
      },
      dehover_node:function(e) {
        return e = this.get_node(e, !0), e && e.length && e.children(".jstree-hovered").length ? (e.attr("aria-selected", !1).children(".jstree-anchor").removeClass("jstree-hovered"), this.trigger("dehover_node", {
          node:this.get_node(e)
        }), t) :!1;
      },
      select_node:function(i, n, r, s) {
        var a, o, d, l;
        if (e.isArray(i)) {
          for (i = i.slice(), o = 0, d = i.length; d > o; o++) this.select_node(i[o], n, r, s);
          return !0;
        }
        return i = this.get_node(i), i && "#" !== i.id ? (a = this.get_node(i, !0), i.state.selected || (i.state.selected = !0, this._data.core.selected.push(i.id), r || (a = this._open_to(i)), a && a.length && a.children(".jstree-anchor").addClass("jstree-clicked"), this.trigger("select_node", {
          node:i,
          selected:this._data.core.selected,
          event:s
        }), n || this.trigger("changed", {
          action:"select_node",
          node:i,
          selected:this._data.core.selected,
          event:s
        })), t) :!1;
      },
      deselect_node:function(i, n, r) {
        var s, a, o;
        if (e.isArray(i)) {
          for (i = i.slice(), s = 0, a = i.length; a > s; s++) this.deselect_node(i[s], n, r);
          return !0;
        }
        return i = this.get_node(i), i && "#" !== i.id ? (o = this.get_node(i, !0), i.state.selected && (i.state.selected = !1, this._data.core.selected = e.vakata.array_remove_item(this._data.core.selected, i.id), o.length && o.children(".jstree-anchor").removeClass("jstree-clicked"), this.trigger("deselect_node", {
          node:i,
          selected:this._data.core.selected,
          event:r
        }), n || this.trigger("changed", {
          action:"deselect_node",
          node:i,
          selected:this._data.core.selected,
          event:r
        })), t) :!1;
      },
      select_all:function(e) {
        var t = this._data.core.selected.concat([]), i, n;
        for (this._data.core.selected = this._model.data["#"].children_d.concat(), i = 0, n = this._data.core.selected.length; n > i; i++) this._model.data[this._data.core.selected[i]] && (this._model.data[this._data.core.selected[i]].state.selected = !0);
        this.redraw(!0), this.trigger("select_all", {
          selected:this._data.core.selected
        }), e || this.trigger("changed", {
          action:"select_all",
          selected:this._data.core.selected,
          old_selection:t
        });
      },
      deselect_all:function(e) {
        var t = this._data.core.selected.concat([]), i, n;
        for (i = 0, n = this._data.core.selected.length; n > i; i++) this._model.data[this._data.core.selected[i]] && (this._model.data[this._data.core.selected[i]].state.selected = !1);
        this._data.core.selected = [], this.element.find(".jstree-clicked").removeClass("jstree-clicked"), this.trigger("deselect_all", {
          selected:this._data.core.selected,
          node:t
        }), e || this.trigger("changed", {
          action:"deselect_all",
          selected:this._data.core.selected,
          old_selection:t
        });
      },
      is_selected:function(e) {
        return e = this.get_node(e), e && "#" !== e.id ? e.state.selected :!1;
      },
      get_selected:function(t) {
        return t ? e.map(this._data.core.selected, e.proxy(function(e) {
          return this.get_node(e);
        }, this)) :this._data.core.selected;
      },
      get_top_selected:function(t) {
        var i = this.get_selected(!0), n = {}, r, s, a, o;
        for (r = 0, s = i.length; s > r; r++) n[i[r].id] = i[r];
        for (r = 0, s = i.length; s > r; r++) for (a = 0, o = i[r].children_d.length; o > a; a++) n[i[r].children_d[a]] && delete n[i[r].children_d[a]];
        i = [];
        for (r in n) n.hasOwnProperty(r) && i.push(r);
        return t ? e.map(i, e.proxy(function(e) {
          return this.get_node(e);
        }, this)) :i;
      },
      get_bottom_selected:function(t) {
        var i = this.get_selected(!0), n = [], r, s;
        for (r = 0, s = i.length; s > r; r++) i[r].children.length || n.push(i[r].id);
        return t ? e.map(n, e.proxy(function(e) {
          return this.get_node(e);
        }, this)) :n;
      },
      get_state:function() {
        var e = {
          core:{
            open:[],
            scroll:{
              left:this.element.scrollLeft(),
              top:this.element.scrollTop()
            },
            selected:[]
          }
        }, t;
        for (t in this._model.data) this._model.data.hasOwnProperty(t) && "#" !== t && (this._model.data[t].state.opened && e.core.open.push(t), this._model.data[t].state.selected && e.core.selected.push(t));
        return e;
      },
      set_state:function(i, n) {
        if (i) {
          if (i.core) {
            var r, s, a, o;
            if (i.core.open) return e.isArray(i.core.open) ? (r = !0, s = !1, a = this, e.each(i.core.open.concat([]), function(t, o) {
              s = a.get_node(o), s && (a.is_loaded(o) ? (a.is_closed(o) && a.open_node(o, !1, 0), i && i.core && i.core.open && e.vakata.array_remove_item(i.core.open, o)) :(a.is_loading(o) || a.open_node(o, e.proxy(function(t, r) {
                !r && i && i.core && i.core.open && e.vakata.array_remove_item(i.core.open, t.id), this.set_state(i, n);
              }, a), 0), r = !1));
            }), r && (delete i.core.open, this.set_state(i, n)), !1) :(delete i.core.open, this.set_state(i, n), !1);
            if (i.core.scroll) return i.core.scroll && i.core.scroll.left !== t && this.element.scrollLeft(i.core.scroll.left), i.core.scroll && i.core.scroll.top !== t && this.element.scrollTop(i.core.scroll.top), delete i.core.scroll, this.set_state(i, n), !1;
            if (i.core.selected) return o = this, this.deselect_all(), e.each(i.core.selected, function(e, t) {
              o.select_node(t);
            }), delete i.core.selected, this.set_state(i, n), !1;
            if (e.isEmptyObject(i.core)) return delete i.core, this.set_state(i, n), !1;
          }
          return e.isEmptyObject(i) ? (i = null, n && n.call(this), this.trigger("set_state"), !1) :!0;
        }
        return !1;
      },
      refresh:function(t) {
        this._data.core.state = this.get_state(), this._cnt = 0, this._model.data = {
          "#":{
            id:"#",
            parent:null,
            parents:[],
            children:[],
            children_d:[],
            state:{
              loaded:!1
            }
          }
        };
        var i = this.get_container_ul()[0].className;
        t || this.element.html("<ul class='jstree-container-ul'><li class='jstree-initial-node jstree-loading jstree-leaf jstree-last'><i class='jstree-icon jstree-ocl'></i><a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>"), this.load_node("#", function(t, n) {
          n && (this.get_container_ul()[0].className = i, this.set_state(e.extend(!0, {}, this._data.core.state), function() {
            this.trigger("refresh");
          })), this._data.core.state = null;
        });
      },
      refresh_node:function(t) {
        if (t = this.get_node(t), !t || "#" === t.id) return !1;
        var i = [], n = this._data.core.selected.concat([]);
        t.state.opened === !0 && i.push(t.id), this.get_node(t, !0).find(".jstree-open").each(function() {
          i.push(this.id);
        }), this._load_nodes(i, e.proxy(function(e) {
          this.open_node(e, !1, 0), this.select_node(this._data.core.selected), this.trigger("refresh_node", {
            node:t,
            nodes:e
          });
        }, this));
      },
      set_id:function(t, i) {
        if (t = this.get_node(t), !t || "#" === t.id) return !1;
        var n, r, s = this._model.data;
        for (i = "" + i, s[t.parent].children[e.inArray(t.id, s[t.parent].children)] = i, n = 0, r = t.parents.length; r > n; n++) s[t.parents[n]].children_d[e.inArray(t.id, s[t.parents[n]].children_d)] = i;
        for (n = 0, r = t.children.length; r > n; n++) s[t.children[n]].parent = i;
        for (n = 0, r = t.children_d.length; r > n; n++) s[t.children_d[n]].parents[e.inArray(t.id, s[t.children_d[n]].parents)] = i;
        return n = e.inArray(t.id, this._data.core.selected), -1 !== n && (this._data.core.selected[n] = i), n = this.get_node(t.id, !0), n && n.attr("id", i), delete s[t.id], t.id = i, s[i] = t, !0;
      },
      get_text:function(e) {
        return e = this.get_node(e), e && "#" !== e.id ? e.text :!1;
      },
      set_text:function(t, i) {
        var n, r, s, a;
        if (e.isArray(t)) {
          for (t = t.slice(), n = 0, r = t.length; r > n; n++) this.set_text(t[n], i);
          return !0;
        }
        return t = this.get_node(t), t && "#" !== t.id ? (t.text = i, s = this.get_node(t, !0), s.length && (s = s.children(".jstree-anchor:eq(0)"), a = s.children("I").clone(), s.html(i).prepend(a), this.trigger("set_text", {
          obj:t,
          text:i
        })), !0) :!1;
      },
      get_json:function(e, t, i) {
        if (e = this.get_node(e || "#"), !e) return !1;
        t && t.flat && !i && (i = []);
        var n = {
          id:e.id,
          text:e.text,
          icon:this.get_icon(e),
          li_attr:e.li_attr,
          a_attr:e.a_attr,
          state:{},
          data:t && t.no_data ? !1 :e.data
        }, r, s;
        if (t && t.flat ? n.parent = e.parent :n.children = [], !t || !t.no_state) for (r in e.state) e.state.hasOwnProperty(r) && (n.state[r] = e.state[r]);
        if (t && t.no_id && (delete n.id, n.li_attr && n.li_attr.id && delete n.li_attr.id), t && t.flat && "#" !== e.id && i.push(n), !t || !t.no_children) for (r = 0, s = e.children.length; s > r; r++) t && t.flat ? this.get_json(e.children[r], t, i) :n.children.push(this.get_json(e.children[r], t));
        return t && t.flat ? i :"#" === e.id ? n.children :n;
      },
      create_node:function(i, n, r, s, a) {
        if (null === i && (i = "#"), i = this.get_node(i), !i) return !1;
        if (r = r === t ? "last" :r, !("" + r).match(/^(before|after)$/) && !a && !this.is_loaded(i)) return this.load_node(i, function() {
          this.create_node(i, n, r, s, !0);
        });
        n || (n = {
          text:this.get_string("New node")
        }), n.text === t && (n.text = this.get_string("New node"));
        var o, d, l, c;
        switch ("#" === i.id && ("before" === r && (r = "first"), "after" === r && (r = "last")), r) {
         case "before":
          o = this.get_node(i.parent), r = e.inArray(i.id, o.children), i = o;
          break;

         case "after":
          o = this.get_node(i.parent), r = e.inArray(i.id, o.children) + 1, i = o;
          break;

         case "inside":
         case "first":
          r = 0;
          break;

         case "last":
          r = i.children.length;
          break;

         default:
          r || (r = 0);
        }
        if (r > i.children.length && (r = i.children.length), n.id || (n.id = !0), !this.check("create_node", n, i, r)) return this.settings.core.error.call(this, this._data.core.last_error), !1;
        if (n.id === !0 && delete n.id, n = this._parse_model_from_json(n, i.id, i.parents.concat()), !n) return !1;
        for (o = this.get_node(n), d = [], d.push(n), d = d.concat(o.children_d), this.trigger("model", {
          nodes:d,
          parent:i.id
        }), i.children_d = i.children_d.concat(d), l = 0, c = i.parents.length; c > l; l++) this._model.data[i.parents[l]].children_d = this._model.data[i.parents[l]].children_d.concat(d);
        for (n = o, o = [], l = 0, c = i.children.length; c > l; l++) o[l >= r ? l + 1 :l] = i.children[l];
        return o[r] = n.id, i.children = o, this.redraw_node(i, !0), s && s.call(this, this.get_node(n)), this.trigger("create_node", {
          node:this.get_node(n),
          parent:i.id,
          position:r
        }), n.id;
      },
      rename_node:function(t, i) {
        var n, r, s;
        if (e.isArray(t)) {
          for (t = t.slice(), n = 0, r = t.length; r > n; n++) this.rename_node(t[n], i);
          return !0;
        }
        return t = this.get_node(t), t && "#" !== t.id ? (s = t.text, this.check("rename_node", t, this.get_parent(t), i) ? (this.set_text(t, i), this.trigger("rename_node", {
          node:t,
          text:i,
          old:s
        }), !0) :(this.settings.core.error.call(this, this._data.core.last_error), !1)) :!1;
      },
      delete_node:function(t) {
        var i, n, r, s, a, o, d, l, c, h;
        if (e.isArray(t)) {
          for (t = t.slice(), i = 0, n = t.length; n > i; i++) this.delete_node(t[i]);
          return !0;
        }
        if (t = this.get_node(t), !t || "#" === t.id) return !1;
        if (r = this.get_node(t.parent), s = e.inArray(t.id, r.children), h = !1, !this.check("delete_node", t, r, s)) return this.settings.core.error.call(this, this._data.core.last_error), !1;
        for (-1 !== s && (r.children = e.vakata.array_remove(r.children, s)), a = t.children_d.concat([]), a.push(t.id), l = 0, c = a.length; c > l; l++) {
          for (o = 0, d = t.parents.length; d > o; o++) s = e.inArray(a[l], this._model.data[t.parents[o]].children_d), -1 !== s && (this._model.data[t.parents[o]].children_d = e.vakata.array_remove(this._model.data[t.parents[o]].children_d, s));
          this._model.data[a[l]].state.selected && (h = !0, s = e.inArray(a[l], this._data.core.selected), -1 !== s && (this._data.core.selected = e.vakata.array_remove(this._data.core.selected, s)));
        }
        for (this.trigger("delete_node", {
          node:t,
          parent:r.id
        }), h && this.trigger("changed", {
          action:"delete_node",
          node:t,
          selected:this._data.core.selected,
          parent:r.id
        }), l = 0, c = a.length; c > l; l++) delete this._model.data[a[l]];
        return this.redraw_node(r, !0), !0;
      },
      check:function(t, i, n, r, s) {
        i = i && i.id ? i :this.get_node(i), n = n && n.id ? n :this.get_node(n);
        var a = t.match(/^move_node|copy_node|create_node$/i) ? n :i, o = this.settings.core.check_callback;
        return "move_node" !== t && "copy_node" !== t || s && s.is_multi || i.id !== n.id && e.inArray(i.id, n.children) !== r && -1 === e.inArray(n.id, i.children_d) ? (a && a.data && (a = a.data), a && a.functions && (a.functions[t] === !1 || a.functions[t] === !0) ? (a.functions[t] === !1 && (this._data.core.last_error = {
          error:"check",
          plugin:"core",
          id:"core_02",
          reason:"Node data prevents function: " + t,
          data:JSON.stringify({
            chk:t,
            pos:r,
            obj:i && i.id ? i.id :!1,
            par:n && n.id ? n.id :!1
          })
        }), a.functions[t]) :o === !1 || e.isFunction(o) && o.call(this, t, i, n, r, s) === !1 || o && o[t] === !1 ? (this._data.core.last_error = {
          error:"check",
          plugin:"core",
          id:"core_03",
          reason:"User config for core.check_callback prevents function: " + t,
          data:JSON.stringify({
            chk:t,
            pos:r,
            obj:i && i.id ? i.id :!1,
            par:n && n.id ? n.id :!1
          })
        }, !1) :!0) :(this._data.core.last_error = {
          error:"check",
          plugin:"core",
          id:"core_01",
          reason:"Moving parent inside child",
          data:JSON.stringify({
            chk:t,
            pos:r,
            obj:i && i.id ? i.id :!1,
            par:n && n.id ? n.id :!1
          })
        }, !1);
      },
      last_error:function() {
        return this._data.core.last_error;
      },
      move_node:function(i, n, r, s, a) {
        var o, d, l, c, h, _, u, g, f, p, m, v, y;
        if (e.isArray(i)) {
          for (i = i.reverse().slice(), o = 0, d = i.length; d > o; o++) this.move_node(i[o], n, r, s, a);
          return !0;
        }
        if (i = i && i.id ? i :this.get_node(i), n = this.get_node(n), r = r === t ? 0 :r, !n || !i || "#" === i.id) return !1;
        if (!("" + r).match(/^(before|after)$/) && !a && !this.is_loaded(n)) return this.load_node(n, function() {
          this.move_node(i, n, r, s, !0);
        });
        if (l = "" + (i.parent || "#"), c = ("" + r).match(/^(before|after)$/) && "#" !== n.id ? this.get_node(n.parent) :n, h = i.instance ? i.instance :this._model.data[i.id] ? this :e.jstree.reference(i.id), _ = !h || !h._id || this._id !== h._id) return this.copy_node(i, n, r, s, a) ? (h && h.delete_node(i), !0) :!1;
        switch ("#" === c.id && ("before" === r && (r = "first"), "after" === r && (r = "last")), r) {
         case "before":
          r = e.inArray(n.id, c.children);
          break;

         case "after":
          r = e.inArray(n.id, c.children) + 1;
          break;

         case "inside":
         case "first":
          r = 0;
          break;

         case "last":
          r = c.children.length;
          break;

         default:
          r || (r = 0);
        }
        if (r > c.children.length && (r = c.children.length), !this.check("move_node", i, c, r, {
          core:!0,
          is_multi:h && h._id && h._id !== this._id,
          is_foreign:!h || !h._id
        })) return this.settings.core.error.call(this, this._data.core.last_error), !1;
        if (i.parent === c.id) {
          for (u = c.children.concat(), g = e.inArray(i.id, u), -1 !== g && (u = e.vakata.array_remove(u, g), r > g && r--), g = [], f = 0, p = u.length; p > f; f++) g[f >= r ? f + 1 :f] = u[f];
          g[r] = i.id, c.children = g, this._node_changed(c.id), this.redraw("#" === c.id);
        } else {
          for (g = i.children_d.concat(), g.push(i.id), f = 0, p = i.parents.length; p > f; f++) {
            for (u = [], y = h._model.data[i.parents[f]].children_d, m = 0, v = y.length; v > m; m++) -1 === e.inArray(y[m], g) && u.push(y[m]);
            h._model.data[i.parents[f]].children_d = u;
          }
          for (h._model.data[l].children = e.vakata.array_remove_item(h._model.data[l].children, i.id), f = 0, p = c.parents.length; p > f; f++) this._model.data[c.parents[f]].children_d = this._model.data[c.parents[f]].children_d.concat(g);
          for (u = [], f = 0, p = c.children.length; p > f; f++) u[f >= r ? f + 1 :f] = c.children[f];
          for (u[r] = i.id, c.children = u, c.children_d.push(i.id), c.children_d = c.children_d.concat(i.children_d), i.parent = c.id, g = c.parents.concat(), g.unshift(c.id), y = i.parents.length, i.parents = g, g = g.concat(), f = 0, p = i.children_d.length; p > f; f++) this._model.data[i.children_d[f]].parents = this._model.data[i.children_d[f]].parents.slice(0, -1 * y), Array.prototype.push.apply(this._model.data[i.children_d[f]].parents, g);
          this._node_changed(l), this._node_changed(c.id), this.redraw("#" === l || "#" === c.id);
        }
        return s && s.call(this, i, c, r), this.trigger("move_node", {
          node:i,
          parent:c.id,
          position:r,
          old_parent:l,
          is_multi:h && h._id && h._id !== this._id,
          is_foreign:!h || !h._id,
          old_instance:h,
          new_instance:this
        }), !0;
      },
      copy_node:function(i, n, r, s, a) {
        var o, d, l, c, h, _, u, g, f, p, m;
        if (e.isArray(i)) {
          for (i = i.reverse().slice(), o = 0, d = i.length; d > o; o++) this.copy_node(i[o], n, r, s, a);
          return !0;
        }
        if (i = i && i.id ? i :this.get_node(i), n = this.get_node(n), r = r === t ? 0 :r, !n || !i || "#" === i.id) return !1;
        if (!("" + r).match(/^(before|after)$/) && !a && !this.is_loaded(n)) return this.load_node(n, function() {
          this.copy_node(i, n, r, s, !0);
        });
        switch (g = "" + (i.parent || "#"), f = ("" + r).match(/^(before|after)$/) && "#" !== n.id ? this.get_node(n.parent) :n, p = i.instance ? i.instance :this._model.data[i.id] ? this :e.jstree.reference(i.id), m = !p || !p._id || this._id !== p._id, "#" === f.id && ("before" === r && (r = "first"), "after" === r && (r = "last")), r) {
         case "before":
          r = e.inArray(n.id, f.children);
          break;

         case "after":
          r = e.inArray(n.id, f.children) + 1;
          break;

         case "inside":
         case "first":
          r = 0;
          break;

         case "last":
          r = f.children.length;
          break;

         default:
          r || (r = 0);
        }
        if (r > f.children.length && (r = f.children.length), !this.check("copy_node", i, f, r, {
          core:!0,
          is_multi:p && p._id && p._id !== this._id,
          is_foreign:!p || !p._id
        })) return this.settings.core.error.call(this, this._data.core.last_error), !1;
        if (u = p ? p.get_json(i, {
          no_id:!0,
          no_data:!0,
          no_state:!0
        }) :i, !u) return !1;
        if (u.id === !0 && delete u.id, u = this._parse_model_from_json(u, f.id, f.parents.concat()), !u) return !1;
        for (c = this.get_node(u), i && i.state && i.state.loaded === !1 && (c.state.loaded = !1), l = [], l.push(u), l = l.concat(c.children_d), this.trigger("model", {
          nodes:l,
          parent:f.id
        }), h = 0, _ = f.parents.length; _ > h; h++) this._model.data[f.parents[h]].children_d = this._model.data[f.parents[h]].children_d.concat(l);
        for (l = [], h = 0, _ = f.children.length; _ > h; h++) l[h >= r ? h + 1 :h] = f.children[h];
        return l[r] = c.id, f.children = l, f.children_d.push(c.id), f.children_d = f.children_d.concat(c.children_d), this._node_changed(f.id), this.redraw("#" === f.id), s && s.call(this, c, f, r), this.trigger("copy_node", {
          node:c,
          original:i,
          parent:f.id,
          position:r,
          old_parent:g,
          is_multi:p && p._id && p._id !== this._id,
          is_foreign:!p || !p._id,
          old_instance:p,
          new_instance:this
        }), c.id;
      },
      cut:function(i) {
        if (i || (i = this._data.core.selected.concat()), e.isArray(i) || (i = [ i ]), !i.length) return !1;
        var a = [], o, d, l;
        for (d = 0, l = i.length; l > d; d++) o = this.get_node(i[d]), o && o.id && "#" !== o.id && a.push(o);
        return a.length ? (n = a, s = this, r = "move_node", this.trigger("cut", {
          node:i
        }), t) :!1;
      },
      copy:function(i) {
        if (i || (i = this._data.core.selected.concat()), e.isArray(i) || (i = [ i ]), !i.length) return !1;
        var a = [], o, d, l;
        for (d = 0, l = i.length; l > d; d++) o = this.get_node(i[d]), o && o.id && "#" !== o.id && a.push(o);
        return a.length ? (n = a, s = this, r = "copy_node", this.trigger("copy", {
          node:i
        }), t) :!1;
      },
      get_buffer:function() {
        return {
          mode:r,
          node:n,
          inst:s
        };
      },
      can_paste:function() {
        return r !== !1 && n !== !1;
      },
      paste:function(e, i) {
        return e = this.get_node(e), e && r && r.match(/^(copy_node|move_node)$/) && n ? (this[r](n, e, i) && this.trigger("paste", {
          parent:e.id,
          node:n,
          mode:r
        }), n = !1, r = !1, s = !1, t) :!1;
      },
      edit:function(i, n) {
        if (i = this._open_to(i), !i || !i.length) return !1;
        var r = this._data.core.rtl, s = this.element.width(), a = i.children(".jstree-anchor"), o = e("<span>"), d = "string" == typeof n ? n :this.get_text(i), l = e("<div />", {
          css:{
            position:"absolute",
            top:"-200px",
            left:r ? "0px" :"-1000px",
            visibility:"hidden"
          }
        }).appendTo("body"), c = e("<input />", {
          value:d,
          "class":"jstree-rename-input",
          css:{
            padding:"0",
            border:"1px solid silver",
            "box-sizing":"border-box",
            display:"inline-block",
            height:this._data.core.li_height + "px",
            lineHeight:this._data.core.li_height + "px",
            width:"150px"
          },
          blur:e.proxy(function() {
            var e = o.children(".jstree-rename-input"), t = e.val();
            "" === t && (t = d), l.remove(), o.replaceWith(a), o.remove(), this.set_text(i, d), this.rename_node(i, t) === !1 && this.set_text(i, d);
          }, this),
          keydown:function(e) {
            var t = e.which;
            27 === t && (this.value = d), (27 === t || 13 === t || 37 === t || 38 === t || 39 === t || 40 === t || 32 === t) && e.stopImmediatePropagation(), (27 === t || 13 === t) && (e.preventDefault(), this.blur());
          },
          click:function(e) {
            e.stopImmediatePropagation();
          },
          mousedown:function(e) {
            e.stopImmediatePropagation();
          },
          keyup:function(e) {
            c.width(Math.min(l.text("pW" + this.value).width(), s));
          },
          keypress:function(e) {
            return 13 === e.which ? !1 :t;
          }
        }), h = {
          fontFamily:a.css("fontFamily") || "",
          fontSize:a.css("fontSize") || "",
          fontWeight:a.css("fontWeight") || "",
          fontStyle:a.css("fontStyle") || "",
          fontStretch:a.css("fontStretch") || "",
          fontVariant:a.css("fontVariant") || "",
          letterSpacing:a.css("letterSpacing") || "",
          wordSpacing:a.css("wordSpacing") || ""
        };
        this.set_text(i, ""), o.attr("class", a.attr("class")).append(a.contents().clone()).append(c), a.replaceWith(o), l.css(h), c.css(h).width(Math.min(l.text("pW" + c[0].value).width(), s))[0].select();
      },
      set_theme:function(t, i) {
        if (!t) return !1;
        if (i === !0) {
          var n = this.settings.core.themes.dir;
          n || (n = e.jstree.path + "/themes"), i = n + "/" + t + "/style.css";
        }
        i && -1 === e.inArray(i, a) && (e("head").append('<link rel="stylesheet" href="' + i + '" type="text/css" />'), a.push(i)), this._data.core.themes.name && this.element.removeClass("jstree-" + this._data.core.themes.name), this._data.core.themes.name = t, this.element.addClass("jstree-" + t), this.element[this.settings.core.themes.responsive ? "addClass" :"removeClass"]("jstree-" + t + "-responsive"), this.trigger("set_theme", {
          theme:t
        });
      },
      get_theme:function() {
        return this._data.core.themes.name;
      },
      set_theme_variant:function(e) {
        this._data.core.themes.variant && this.element.removeClass("jstree-" + this._data.core.themes.name + "-" + this._data.core.themes.variant), this._data.core.themes.variant = e, e && this.element.addClass("jstree-" + this._data.core.themes.name + "-" + this._data.core.themes.variant);
      },
      get_theme_variant:function() {
        return this._data.core.themes.variant;
      },
      show_stripes:function() {
        this._data.core.themes.stripes = !0, this.get_container_ul().addClass("jstree-striped");
      },
      hide_stripes:function() {
        this._data.core.themes.stripes = !1, this.get_container_ul().removeClass("jstree-striped");
      },
      toggle_stripes:function() {
        this._data.core.themes.stripes ? this.hide_stripes() :this.show_stripes();
      },
      show_dots:function() {
        this._data.core.themes.dots = !0, this.get_container_ul().removeClass("jstree-no-dots");
      },
      hide_dots:function() {
        this._data.core.themes.dots = !1, this.get_container_ul().addClass("jstree-no-dots");
      },
      toggle_dots:function() {
        this._data.core.themes.dots ? this.hide_dots() :this.show_dots();
      },
      show_icons:function() {
        this._data.core.themes.icons = !0, this.get_container_ul().removeClass("jstree-no-icons");
      },
      hide_icons:function() {
        this._data.core.themes.icons = !1, this.get_container_ul().addClass("jstree-no-icons");
      },
      toggle_icons:function() {
        this._data.core.themes.icons ? this.hide_icons() :this.show_icons();
      },
      set_icon:function(t, i) {
        var n, r, s, a;
        if (e.isArray(t)) {
          for (t = t.slice(), n = 0, r = t.length; r > n; n++) this.set_icon(t[n], i);
          return !0;
        }
        return t = this.get_node(t), t && "#" !== t.id ? (a = t.icon, t.icon = i, s = this.get_node(t, !0).children(".jstree-anchor").children(".jstree-themeicon"), i === !1 ? this.hide_icon(t) :i === !0 ? s.removeClass("jstree-themeicon-custom " + a).css("background", "").removeAttr("rel") :-1 === i.indexOf("/") && -1 === i.indexOf(".") ? (s.removeClass(a).css("background", ""), s.addClass(i + " jstree-themeicon-custom").attr("rel", i)) :(s.removeClass(a).css("background", ""), s.addClass("jstree-themeicon-custom").css("background", "url('" + i + "') center center no-repeat").attr("rel", i)), !0) :!1;
      },
      get_icon:function(e) {
        return e = this.get_node(e), e && "#" !== e.id ? e.icon :!1;
      },
      hide_icon:function(t) {
        var i, n;
        if (e.isArray(t)) {
          for (t = t.slice(), i = 0, n = t.length; n > i; i++) this.hide_icon(t[i]);
          return !0;
        }
        return t = this.get_node(t), t && "#" !== t ? (t.icon = !1, this.get_node(t, !0).children("a").children(".jstree-themeicon").addClass("jstree-themeicon-hidden"), !0) :!1;
      },
      show_icon:function(t) {
        var i, n, r;
        if (e.isArray(t)) {
          for (t = t.slice(), i = 0, n = t.length; n > i; i++) this.show_icon(t[i]);
          return !0;
        }
        return t = this.get_node(t), t && "#" !== t ? (r = this.get_node(t, !0), t.icon = r.length ? r.children("a").children(".jstree-themeicon").attr("rel") :!0, t.icon || (t.icon = !0), r.children("a").children(".jstree-themeicon").removeClass("jstree-themeicon-hidden"), !0) :!1;
      }
    }, e.vakata = {}, e.vakata.attributes = function(t, i) {
      t = e(t)[0];
      var n = i ? {} :[];
      return t && t.attributes && e.each(t.attributes, function(t, r) {
        -1 === e.inArray(r.nodeName.toLowerCase(), [ "style", "contenteditable", "hasfocus", "tabindex" ]) && null !== r.nodeValue && "" !== e.trim(r.nodeValue) && (i ? n[r.nodeName] = r.nodeValue :n.push(r.nodeName));
      }), n;
    }, e.vakata.array_unique = function(e) {
      var t = [], i, n, r;
      for (i = 0, r = e.length; r > i; i++) {
        for (n = 0; i >= n; n++) if (e[i] === e[n]) break;
        n === i && t.push(e[i]);
      }
      return t;
    }, e.vakata.array_remove = function(e, t, i) {
      var n = e.slice((i || t) + 1 || e.length);
      return e.length = 0 > t ? e.length + t :t, e.push.apply(e, n), e;
    }, e.vakata.array_remove_item = function(t, i) {
      var n = e.inArray(i, t);
      return -1 !== n ? e.vakata.array_remove(t, n) :t;
    }, function() {
      var t = {}, i = function(e) {
        e = e.toLowerCase();
        var t = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || 0 > e.indexOf("compatible") && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
        return {
          browser:t[1] || "",
          version:t[2] || "0"
        };
      }, n = i(window.navigator.userAgent);
      n.browser && (t[n.browser] = !0, t.version = n.version), t.chrome ? t.webkit = !0 :t.webkit && (t.safari = !0), e.vakata.browser = t;
    }(), e.vakata.browser.msie && 8 > e.vakata.browser.version && (e.jstree.defaults.core.animation = 0);
    var _ = document.createElement("I");
    _.className = "jstree-icon jstree-checkbox", e.jstree.defaults.checkbox = {
      visible:!0,
      three_state:!0,
      whole_node:!0,
      keep_selected_style:!0
    }, e.jstree.plugins.checkbox = function(t, i) {
      this.bind = function() {
        i.bind.call(this), this._data.checkbox.uto = !1, this.element.on("init.jstree", e.proxy(function() {
          this._data.checkbox.visible = this.settings.checkbox.visible, this.settings.checkbox.keep_selected_style || this.element.addClass("jstree-checkbox-no-clicked");
        }, this)).on("loading.jstree", e.proxy(function() {
          this[this._data.checkbox.visible ? "show_checkboxes" :"hide_checkboxes"]();
        }, this)), this.settings.checkbox.three_state && this.element.on("changed.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree", e.proxy(function() {
          this._data.checkbox.uto && clearTimeout(this._data.checkbox.uto), this._data.checkbox.uto = setTimeout(e.proxy(this._undetermined, this), 50);
        }, this)).on("model.jstree", e.proxy(function(t, i) {
          var n = this._model.data, r = n[i.parent], s = i.nodes, a = [], o, d, l, c, h, _;
          if (r.state.selected) {
            for (d = 0, l = s.length; l > d; d++) n[s[d]].state.selected = !0;
            this._data.core.selected = this._data.core.selected.concat(s);
          } else for (d = 0, l = s.length; l > d; d++) if (n[s[d]].state.selected) {
            for (c = 0, h = n[s[d]].children_d.length; h > c; c++) n[n[s[d]].children_d[c]].state.selected = !0;
            this._data.core.selected = this._data.core.selected.concat(n[s[d]].children_d);
          }
          for (d = 0, l = r.children_d.length; l > d; d++) n[r.children_d[d]].children.length || a.push(n[r.children_d[d]].parent);
          for (a = e.vakata.array_unique(a), c = 0, h = a.length; h > c; c++) {
            r = n[a[c]];
            while (r && "#" !== r.id) {
              for (o = 0, d = 0, l = r.children.length; l > d; d++) o += n[r.children[d]].state.selected;
              if (o !== l) break;
              r.state.selected = !0, this._data.core.selected.push(r.id), _ = this.get_node(r, !0), _ && _.length && _.children(".jstree-anchor").addClass("jstree-clicked"), r = this.get_node(r.parent);
            }
          }
          this._data.core.selected = e.vakata.array_unique(this._data.core.selected);
        }, this)).on("select_node.jstree", e.proxy(function(t, i) {
          var n = i.node, r = this._model.data, s = this.get_node(n.parent), a = this.get_node(n, !0), o, d, l, c;
          for (this._data.core.selected = e.vakata.array_unique(this._data.core.selected.concat(n.children_d)), o = 0, d = n.children_d.length; d > o; o++) c = r[n.children_d[o]], c.state.selected = !0, c && c.original && c.original.state && c.original.state.undetermined && (c.original.state.undetermined = !1);
          while (s && "#" !== s.id) {
            for (l = 0, o = 0, d = s.children.length; d > o; o++) l += r[s.children[o]].state.selected;
            if (l !== d) break;
            s.state.selected = !0, this._data.core.selected.push(s.id), c = this.get_node(s, !0), c && c.length && c.children(".jstree-anchor").addClass("jstree-clicked"), s = this.get_node(s.parent);
          }
          a.length && a.find(".jstree-anchor").addClass("jstree-clicked");
        }, this)).on("deselect_all.jstree", e.proxy(function(e, t) {
          var i = this.get_node("#"), n = this._model.data, r, s, a;
          for (r = 0, s = i.children_d.length; s > r; r++) a = n[i.children_d[r]], a && a.original && a.original.state && a.original.state.undetermined && (a.original.state.undetermined = !1);
        }, this)).on("deselect_node.jstree", e.proxy(function(t, i) {
          var n = i.node, r = this.get_node(n, !0), s, a, o;
          for (n && n.original && n.original.state && n.original.state.undetermined && (n.original.state.undetermined = !1), s = 0, a = n.children_d.length; a > s; s++) o = this._model.data[n.children_d[s]], o.state.selected = !1, o && o.original && o.original.state && o.original.state.undetermined && (o.original.state.undetermined = !1);
          for (s = 0, a = n.parents.length; a > s; s++) o = this._model.data[n.parents[s]], o.state.selected = !1, o && o.original && o.original.state && o.original.state.undetermined && (o.original.state.undetermined = !1), o = this.get_node(n.parents[s], !0), o && o.length && o.children(".jstree-anchor").removeClass("jstree-clicked");
          for (o = [], s = 0, a = this._data.core.selected.length; a > s; s++) -1 === e.inArray(this._data.core.selected[s], n.children_d) && -1 === e.inArray(this._data.core.selected[s], n.parents) && o.push(this._data.core.selected[s]);
          this._data.core.selected = e.vakata.array_unique(o), r.length && r.find(".jstree-anchor").removeClass("jstree-clicked");
        }, this)).on("delete_node.jstree", e.proxy(function(e, t) {
          var i = this.get_node(t.parent), n = this._model.data, r, s, a, o;
          while (i && "#" !== i.id) {
            for (a = 0, r = 0, s = i.children.length; s > r; r++) a += n[i.children[r]].state.selected;
            if (a !== s) break;
            i.state.selected = !0, this._data.core.selected.push(i.id), o = this.get_node(i, !0), o && o.length && o.children(".jstree-anchor").addClass("jstree-clicked"), i = this.get_node(i.parent);
          }
        }, this)).on("move_node.jstree", e.proxy(function(t, i) {
          var n = i.is_multi, r = i.old_parent, s = this.get_node(i.parent), a = this._model.data, o, d, l, c, h;
          if (!n) {
            o = this.get_node(r);
            while (o && "#" !== o.id) {
              for (d = 0, l = 0, c = o.children.length; c > l; l++) d += a[o.children[l]].state.selected;
              if (d !== c) break;
              o.state.selected = !0, this._data.core.selected.push(o.id), h = this.get_node(o, !0), h && h.length && h.children(".jstree-anchor").addClass("jstree-clicked"), o = this.get_node(o.parent);
            }
          }
          o = s;
          while (o && "#" !== o.id) {
            for (d = 0, l = 0, c = o.children.length; c > l; l++) d += a[o.children[l]].state.selected;
            if (d === c) o.state.selected || (o.state.selected = !0, this._data.core.selected.push(o.id), h = this.get_node(o, !0), h && h.length && h.children(".jstree-anchor").addClass("jstree-clicked")); else {
              if (!o.state.selected) break;
              o.state.selected = !1, this._data.core.selected = e.vakata.array_remove_item(this._data.core.selected, o.id), h = this.get_node(o, !0), h && h.length && h.children(".jstree-anchor").removeClass("jstree-clicked");
            }
            o = this.get_node(o.parent);
          }
        }, this));
      }, this._undetermined = function() {
        var t, i, n = this._model.data, r = this._data.core.selected, s = [], a = this;
        for (t = 0, i = r.length; i > t; t++) n[r[t]] && n[r[t]].parents && (s = s.concat(n[r[t]].parents));
        for (this.element.find(".jstree-closed").not(":has(ul)").each(function() {
          var e = a.get_node(this), r;
          if (e.state.loaded) for (t = 0, i = e.children_d.length; i > t; t++) r = n[e.children_d[t]], !r.state.loaded && r.original && r.original.state && r.original.state.undetermined && r.original.state.undetermined === !0 && (s.push(r.id), s = s.concat(r.parents)); else e.original && e.original.state && e.original.state.undetermined && e.original.state.undetermined === !0 && (s.push(e.id), s = s.concat(e.parents));
        }), s = e.vakata.array_unique(s), s = e.vakata.array_remove_item(s, "#"), this.element.find(".jstree-undetermined").removeClass("jstree-undetermined"), t = 0, i = s.length; i > t; t++) n[s[t]].state.selected || (r = this.get_node(s[t], !0), r && r.length && r.children("a").children(".jstree-checkbox").addClass("jstree-undetermined"));
      }, this.redraw_node = function(t, n, r) {
        if (t = i.redraw_node.call(this, t, n, r)) {
          var s = t.getElementsByTagName("A")[0];
          s.insertBefore(_.cloneNode(!1), s.childNodes[0]);
        }
        return !r && this.settings.checkbox.three_state && (this._data.checkbox.uto && clearTimeout(this._data.checkbox.uto), this._data.checkbox.uto = setTimeout(e.proxy(this._undetermined, this), 50)), t;
      }, this.activate_node = function(t, n) {
        return (this.settings.checkbox.whole_node || e(n.target).hasClass("jstree-checkbox")) && (n.ctrlKey = !0), i.activate_node.call(this, t, n);
      }, this.show_checkboxes = function() {
        this._data.core.themes.checkboxes = !0, this.element.children("ul").removeClass("jstree-no-checkboxes");
      }, this.hide_checkboxes = function() {
        this._data.core.themes.checkboxes = !1, this.element.children("ul").addClass("jstree-no-checkboxes");
      }, this.toggle_checkboxes = function() {
        this._data.core.themes.checkboxes ? this.hide_checkboxes() :this.show_checkboxes();
      };
    }, e.jstree.defaults.contextmenu = {
      select_node:!0,
      show_at_node:!0,
      items:function(t, i) {
        return {
          create:{
            separator_before:!1,
            separator_after:!0,
            _disabled:!1,
            label:"Create",
            action:function(t) {
              var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
              i.create_node(n, {}, "last", function(e) {
                setTimeout(function() {
                  i.edit(e);
                }, 0);
              });
            }
          },
          rename:{
            separator_before:!1,
            separator_after:!1,
            _disabled:!1,
            label:"Rename",
            action:function(t) {
              var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
              i.edit(n);
            }
          },
          remove:{
            separator_before:!1,
            icon:!1,
            separator_after:!1,
            _disabled:!1,
            label:"Delete",
            action:function(t) {
              var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
              i.is_selected(n) ? i.delete_node(i.get_selected()) :i.delete_node(n);
            }
          },
          ccp:{
            separator_before:!0,
            icon:!1,
            separator_after:!1,
            label:"Edit",
            action:!1,
            submenu:{
              cut:{
                separator_before:!1,
                separator_after:!1,
                label:"Cut",
                action:function(t) {
                  var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
                  i.is_selected(n) ? i.cut(i.get_selected()) :i.cut(n);
                }
              },
              copy:{
                separator_before:!1,
                icon:!1,
                separator_after:!1,
                label:"Copy",
                action:function(t) {
                  var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
                  i.is_selected(n) ? i.copy(i.get_selected()) :i.copy(n);
                }
              },
              paste:{
                separator_before:!1,
                icon:!1,
                _disabled:function(t) {
                  return !e.jstree.reference(t.reference).can_paste();
                },
                separator_after:!1,
                label:"Paste",
                action:function(t) {
                  var i = e.jstree.reference(t.reference), n = i.get_node(t.reference);
                  i.paste(n);
                }
              }
            }
          }
        };
      }
    }, e.jstree.plugins.contextmenu = function(i, n) {
      this.bind = function() {
        n.bind.call(this);
        var t = 0;
        this.element.on("contextmenu.jstree", ".jstree-anchor", e.proxy(function(e) {
          e.preventDefault(), t = e.ctrlKey ? e.timeStamp :0, this.is_loading(e.currentTarget) || this.show_contextmenu(e.currentTarget, e.pageX, e.pageY, e);
        }, this)).on("click.jstree", ".jstree-anchor", e.proxy(function(i) {
          this._data.contextmenu.visible && (!t || i.timeStamp - t > 250) && e.vakata.context.hide();
        }, this)), e(document).on("context_hide.vakata", e.proxy(function() {
          this._data.contextmenu.visible = !1;
        }, this));
      }, this.teardown = function() {
        this._data.contextmenu.visible && e.vakata.context.hide(), n.teardown.call(this);
      }, this.show_contextmenu = function(i, n, r, s) {
        if (i = this.get_node(i), !i || "#" === i.id) return !1;
        var a = this.settings.contextmenu, o = this.get_node(i, !0), d = o.children(".jstree-anchor"), l = !1, c = !1;
        (a.show_at_node || n === t || r === t) && (l = d.offset(), n = l.left, r = l.top + this._data.core.li_height), this.settings.contextmenu.select_node && !this.is_selected(i) && (this.deselect_all(), this.select_node(i, !1, !1, s)), c = a.items, e.isFunction(c) && (c = c.call(this, i, e.proxy(function(e) {
          this._show_contextmenu(i, n, r, e);
        }, this))), e.isPlainObject(c) && this._show_contextmenu(i, n, r, c);
      }, this._show_contextmenu = function(t, i, n, r) {
        var s = this.get_node(t, !0), a = s.children(".jstree-anchor");
        e(document).one("context_show.vakata", e.proxy(function(t, i) {
          var n = "jstree-contextmenu jstree-" + this.get_theme() + "-contextmenu";
          e(i.element).addClass(n);
        }, this)), this._data.contextmenu.visible = !0, e.vakata.context.show(a, {
          x:i,
          y:n
        }, r), this.trigger("show_contextmenu", {
          node:t,
          x:i,
          y:n
        });
      };
    }, function(e) {
      var i = !1, n = {
        element:!1,
        reference:!1,
        position_x:0,
        position_y:0,
        items:[],
        html:"",
        is_visible:!1
      };
      e.vakata.context = {
        settings:{
          hide_onmouseleave:0,
          icons:!0
        },
        _trigger:function(t) {
          e(document).triggerHandler("context_" + t + ".vakata", {
            reference:n.reference,
            element:n.element,
            position:{
              x:n.position_x,
              y:n.position_y
            }
          });
        },
        _execute:function(t) {
          return t = n.items[t], t && (!t._disabled || e.isFunction(t._disabled) && !t._disabled({
            item:t,
            reference:n.reference,
            element:n.element
          })) && t.action ? t.action.call(null, {
            item:t,
            reference:n.reference,
            element:n.element,
            position:{
              x:n.position_x,
              y:n.position_y
            }
          }) :!1;
        },
        _parse:function(i, r) {
          if (!i) return !1;
          r || (n.html = "", n.items = []);
          var s = "", a = !1, o;
          return r && (s += "<ul>"), e.each(i, function(i, r) {
            return r ? (n.items.push(r), !a && r.separator_before && (s += "<li class='vakata-context-separator'><a href='#' " + (e.vakata.context.settings.icons ? "" :'style="margin-left:0px;"') + ">&#160;<" + "/a><" + "/li>"), a = !1, s += "<li class='" + (r._class || "") + (r._disabled === !0 || e.isFunction(r._disabled) && r._disabled({
              item:r,
              reference:n.reference,
              element:n.element
            }) ? " vakata-contextmenu-disabled " :"") + "' " + (r.shortcut ? " data-shortcut='" + r.shortcut + "' " :"") + ">", s += "<a href='#' rel='" + (n.items.length - 1) + "'>", e.vakata.context.settings.icons && (s += "<i ", r.icon && (s += -1 !== r.icon.indexOf("/") || -1 !== r.icon.indexOf(".") ? " style='background:url(\"" + r.icon + "\") center center no-repeat' " :" class='" + r.icon + "' "), s += "></i><span class='vakata-contextmenu-sep'>&#160;</span>"), s += (e.isFunction(r.label) ? r.label({
              item:i,
              reference:n.reference,
              element:n.element
            }) :r.label) + (r.shortcut ? ' <span class="vakata-contextmenu-shortcut vakata-contextmenu-shortcut-' + r.shortcut + '">' + (r.shortcut_label || "") + "</span>" :"") + "<" + "/a>", r.submenu && (o = e.vakata.context._parse(r.submenu, !0), o && (s += o)), s += "</li>", r.separator_after && (s += "<li class='vakata-context-separator'><a href='#' " + (e.vakata.context.settings.icons ? "" :'style="margin-left:0px;"') + ">&#160;<" + "/a><" + "/li>", a = !0), t) :!0;
          }), s = s.replace(/<li class\='vakata-context-separator'\><\/li\>$/, ""), r && (s += "</ul>"), r || (n.html = s, e.vakata.context._trigger("parse")), s.length > 10 ? s :!1;
        },
        _show_submenu:function(t) {
          if (t = e(t), t.length && t.children("ul").length) {
            var n = t.children("ul"), r = t.offset().left + t.outerWidth(), s = t.offset().top, a = n.width(), o = n.height(), d = e(window).width() + e(window).scrollLeft(), l = e(window).height() + e(window).scrollTop();
            i ? t[0 > r - (a + 10 + t.outerWidth()) ? "addClass" :"removeClass"]("vakata-context-left") :t[r + a + 10 > d ? "addClass" :"removeClass"]("vakata-context-right"), s + o + 10 > l && n.css("bottom", "-1px"), n.show();
          }
        },
        show:function(t, r, s) {
          var a, o, d, l, c, h, _, u, g = !0;
          switch (n.element && n.element.length && n.element.width(""), g) {
           case !r && !t:
            return !1;

           case !!r && !!t:
            n.reference = t, n.position_x = r.x, n.position_y = r.y;
            break;

           case !r && !!t:
            n.reference = t, a = t.offset(), n.position_x = a.left + t.outerHeight(), n.position_y = a.top;
            break;

           case !!r && !t:
            n.position_x = r.x, n.position_y = r.y;
          }
          t && !s && e(t).data("vakata_contextmenu") && (s = e(t).data("vakata_contextmenu")), e.vakata.context._parse(s) && n.element.html(n.html), n.items.length && (o = n.element, d = n.position_x, l = n.position_y, c = o.width(), h = o.height(), _ = e(window).width() + e(window).scrollLeft(), u = e(window).height() + e(window).scrollTop(), i && (d -= o.outerWidth(), e(window).scrollLeft() + 20 > d && (d = e(window).scrollLeft() + 20)), d + c + 20 > _ && (d = _ - (c + 20)), l + h + 20 > u && (l = u - (h + 20)), n.element.css({
            left:d,
            top:l
          }).show().find("a:eq(0)").focus().parent().addClass("vakata-context-hover"), n.is_visible = !0, e.vakata.context._trigger("show"));
        },
        hide:function() {
          n.is_visible && (n.element.hide().find("ul").hide().end().find(":focus").blur(), n.is_visible = !1, e.vakata.context._trigger("hide"));
        }
      }, e(function() {
        i = "rtl" === e("body").css("direction");
        var t = !1;
        n.element = e("<ul class='vakata-context'></ul>"), n.element.on("mouseenter", "li", function(i) {
          i.stopImmediatePropagation(), e.contains(this, i.relatedTarget) || (t && clearTimeout(t), n.element.find(".vakata-context-hover").removeClass("vakata-context-hover").end(), e(this).siblings().find("ul").hide().end().end().parentsUntil(".vakata-context", "li").addBack().addClass("vakata-context-hover"), e.vakata.context._show_submenu(this));
        }).on("mouseleave", "li", function(t) {
          e.contains(this, t.relatedTarget) || e(this).find(".vakata-context-hover").addBack().removeClass("vakata-context-hover");
        }).on("mouseleave", function(i) {
          e(this).find(".vakata-context-hover").removeClass("vakata-context-hover"), e.vakata.context.settings.hide_onmouseleave && (t = setTimeout(function(t) {
            return function() {
              e.vakata.context.hide();
            };
          }(this), e.vakata.context.settings.hide_onmouseleave));
        }).on("click", "a", function(e) {
          e.preventDefault();
        }).on("mouseup", "a", function(t) {
          e(this).blur().parent().hasClass("vakata-context-disabled") || e.vakata.context._execute(e(this).attr("rel")) === !1 || e.vakata.context.hide();
        }).on("keydown", "a", function(t) {
          var i = null;
          switch (t.which) {
           case 13:
           case 32:
            t.type = "mouseup", t.preventDefault(), e(t.currentTarget).trigger(t);
            break;

           case 37:
            n.is_visible && (n.element.find(".vakata-context-hover").last().parents("li:eq(0)").find("ul").hide().find(".vakata-context-hover").removeClass("vakata-context-hover").end().end().children("a").focus(), t.stopImmediatePropagation(), t.preventDefault());
            break;

           case 38:
            n.is_visible && (i = n.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").prevAll("li:not(.vakata-context-separator)").first(), i.length || (i = n.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").last()), i.addClass("vakata-context-hover").children("a").focus(), t.stopImmediatePropagation(), t.preventDefault());
            break;

           case 39:
            n.is_visible && (n.element.find(".vakata-context-hover").last().children("ul").show().children("li:not(.vakata-context-separator)").removeClass("vakata-context-hover").first().addClass("vakata-context-hover").children("a").focus(), t.stopImmediatePropagation(), t.preventDefault());
            break;

           case 40:
            n.is_visible && (i = n.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").nextAll("li:not(.vakata-context-separator)").first(), i.length || (i = n.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").first()), i.addClass("vakata-context-hover").children("a").focus(), t.stopImmediatePropagation(), t.preventDefault());
            break;

           case 27:
            e.vakata.context.hide(), t.preventDefault();
            break;

           default:          }
        }).on("keydown", function(e) {
          e.preventDefault();
          var t = n.element.find(".vakata-contextmenu-shortcut-" + e.which).parent();
          t.parent().not(".vakata-context-disabled") && t.mouseup();
        }).appendTo("body"), e(document).on("mousedown", function(t) {
          n.is_visible && !e.contains(n.element[0], t.target) && e.vakata.context.hide();
        }).on("context_show.vakata", function(e, t) {
          n.element.find("li:has(ul)").children("a").addClass("vakata-context-parent"), i && n.element.addClass("vakata-context-rtl").css("direction", "rtl"), n.element.find("ul").hide().end();
        });
      });
    }(e), e.jstree.defaults.dnd = {
      copy:!0,
      open_timeout:500,
      is_draggable:!0,
      check_while_dragging:!0,
      always_copy:!1
    }, e.jstree.plugins.dnd = function(i, n) {
      this.bind = function() {
        n.bind.call(this), this.element.on("mousedown.jstree touchstart.jstree", ".jstree-anchor", e.proxy(function(i) {
          var n = this.get_node(i.target), r = this.is_selected(n) ? this.get_selected().length :1;
          return n && n.id && "#" !== n.id && (1 === i.which || "touchstart" === i.type) && (this.settings.dnd.is_draggable === !0 || e.isFunction(this.settings.dnd.is_draggable) && this.settings.dnd.is_draggable.call(this, r > 1 ? this.get_selected(!0) :[ n ])) ? (this.element.trigger("mousedown.jstree"), e.vakata.dnd.start(i, {
            jstree:!0,
            origin:this,
            obj:this.get_node(n, !0),
            nodes:r > 1 ? this.get_selected() :[ n.id ]
          }, '<div id="jstree-dnd" class="jstree-' + this.get_theme() + '"><i class="jstree-icon jstree-er"></i>' + (r > 1 ? r + " " + this.get_string("nodes") :this.get_text(i.currentTarget, !0)) + '<ins class="jstree-copy" style="display:none;">+</ins></div>')) :t;
        }, this));
      };
    }, e(function() {
      var i = !1, n = !1, r = !1, s = e('<div id="jstree-marker">&#160;</div>').hide().appendTo("body");
      e(document).bind("dnd_start.vakata", function(e, t) {
        i = !1;
      }).bind("dnd_move.vakata", function(a, o) {
        if (r && clearTimeout(r), o.data.jstree && (!o.event.target.id || "jstree-marker" !== o.event.target.id)) {
          var d = e.jstree.reference(o.event.target), l = !1, c = !1, h = !1, _, u, g, f, p, m, v, y, j, x, k, b;
          if (d && d._data && d._data.dnd) if (s.attr("class", "jstree-" + d.get_theme()), o.helper.children().attr("class", "jstree-" + d.get_theme()).find(".jstree-copy:eq(0)")[o.data.origin && (o.data.origin.settings.dnd.always_copy || o.data.origin.settings.dnd.copy && (o.event.metaKey || o.event.ctrlKey)) ? "show" :"hide"](), o.event.target !== d.element[0] && o.event.target !== d.get_container_ul()[0] || 0 !== d.get_container_ul().children().length) {
            if (l = e(o.event.target).closest("a"), l && l.length && l.parent().is(".jstree-closed, .jstree-open, .jstree-leaf") && (c = l.offset(), h = o.event.pageY - c.top, g = l.height(), m = g / 3 > h ? [ "b", "i", "a" ] :h > g - g / 3 ? [ "a", "i", "b" ] :h > g / 2 ? [ "i", "a", "b" ] :[ "i", "b", "a" ], e.each(m, function(a, h) {
              switch (h) {
               case "b":
                _ = c.left - 6, u = c.top - 5, f = d.get_parent(l), p = l.parent().index();
                break;

               case "i":
                _ = c.left - 2, u = c.top - 5 + g / 2 + 1, f = d.get_node(l.parent()).id, p = 0;
                break;

               case "a":
                _ = c.left - 6, u = c.top - 5 + g, f = d.get_parent(l), p = l.parent().index() + 1;
              }
              for (v = !0, y = 0, j = o.data.nodes.length; j > y; y++) if (x = o.data.origin && (o.data.origin.settings.dnd.always_copy || o.data.origin.settings.dnd.copy && (o.event.metaKey || o.event.ctrlKey)) ? "copy_node" :"move_node", k = p, "move_node" === x && "a" === h && o.data.origin && o.data.origin === d && f === d.get_parent(o.data.nodes[y]) && (b = d.get_node(f), k > e.inArray(o.data.nodes[y], b.children) && (k -= 1)), v = v && (d && d.settings && d.settings.dnd && d.settings.dnd.check_while_dragging === !1 || d.check(x, o.data.origin && o.data.origin !== d ? o.data.origin.get_node(o.data.nodes[y]) :o.data.nodes[y], f, k, {
                dnd:!0,
                ref:d.get_node(l.parent()),
                pos:h,
                is_multi:o.data.origin && o.data.origin !== d,
                is_foreign:!o.data.origin
              })), !v) {
                d && d.last_error && (n = d.last_error());
                break;
              }
              return v ? ("i" === h && l.parent().is(".jstree-closed") && d.settings.dnd.open_timeout && (r = setTimeout(function(e, t) {
                return function() {
                  e.open_node(t);
                };
              }(d, l), d.settings.dnd.open_timeout)), i = {
                ins:d,
                par:f,
                pos:p
              }, s.css({
                left:_ + "px",
                top:u + "px"
              }).show(), o.helper.find(".jstree-icon:eq(0)").removeClass("jstree-er").addClass("jstree-ok"), n = {}, m = !0, !1) :t;
            }), m === !0)) return;
          } else {
            for (v = !0, y = 0, j = o.data.nodes.length; j > y; y++) if (v = v && d.check(o.data.origin && (o.data.origin.settings.dnd.always_copy || o.data.origin.settings.dnd.copy && (o.event.metaKey || o.event.ctrlKey)) ? "copy_node" :"move_node", o.data.origin && o.data.origin !== d ? o.data.origin.get_node(o.data.nodes[y]) :o.data.nodes[y], "#", "last", {
              dnd:!0,
              ref:d.get_node("#"),
              pos:"i",
              is_multi:o.data.origin && o.data.origin !== d,
              is_foreign:!o.data.origin
            }), !v) break;
            if (v) return i = {
              ins:d,
              par:"#",
              pos:"last"
            }, s.hide(), o.helper.find(".jstree-icon:eq(0)").removeClass("jstree-er").addClass("jstree-ok"), t;
          }
          i = !1, o.helper.find(".jstree-icon").removeClass("jstree-ok").addClass("jstree-er"), s.hide();
        }
      }).bind("dnd_scroll.vakata", function(e, t) {
        t.data.jstree && (s.hide(), i = !1, t.helper.find(".jstree-icon:eq(0)").removeClass("jstree-ok").addClass("jstree-er"));
      }).bind("dnd_stop.vakata", function(t, a) {
        if (r && clearTimeout(r), a.data.jstree) {
          s.hide();
          var o, d, l = [];
          if (i) {
            for (o = 0, d = a.data.nodes.length; d > o; o++) l[o] = a.data.origin ? a.data.origin.get_node(a.data.nodes[o]) :a.data.nodes[o], a.data.origin && (l[o].instance = a.data.origin);
            i.ins[a.data.origin && (a.data.origin.settings.dnd.always_copy || a.data.origin.settings.dnd.copy && (a.event.metaKey || a.event.ctrlKey)) ? "copy_node" :"move_node"](l, i.par, i.pos);
          } else o = e(a.event.target).closest(".jstree"), o.length && n && n.error && "check" === n.error && (o = o.jstree(!0), o && o.settings.core.error.call(this, n));
        }
      }).bind("keyup keydown", function(t, i) {
        i = e.vakata.dnd._get(), i.data && i.data.jstree && i.helper.find(".jstree-copy:eq(0)")[i.data.origin && (i.data.origin.settings.dnd.always_copy || i.data.origin.settings.dnd.copy && (t.metaKey || t.ctrlKey)) ? "show" :"hide"]();
      });
    }), function(e) {
      var i = {
        element:!1,
        is_down:!1,
        is_drag:!1,
        helper:!1,
        helper_w:0,
        data:!1,
        init_x:0,
        init_y:0,
        scroll_l:0,
        scroll_t:0,
        scroll_e:!1,
        scroll_i:!1
      };
      e.vakata.dnd = {
        settings:{
          scroll_speed:10,
          scroll_proximity:20,
          helper_left:5,
          helper_top:10,
          threshold:5
        },
        _trigger:function(t, i) {
          var n = e.vakata.dnd._get();
          n.event = i, e(document).triggerHandler("dnd_" + t + ".vakata", n);
        },
        _get:function() {
          return {
            data:i.data,
            element:i.element,
            helper:i.helper
          };
        },
        _clean:function() {
          i.helper && i.helper.remove(), i.scroll_i && (clearInterval(i.scroll_i), i.scroll_i = !1), i = {
            element:!1,
            is_down:!1,
            is_drag:!1,
            helper:!1,
            helper_w:0,
            data:!1,
            init_x:0,
            init_y:0,
            scroll_l:0,
            scroll_t:0,
            scroll_e:!1,
            scroll_i:!1
          }, e(document).off("mousemove touchmove", e.vakata.dnd.drag), e(document).off("mouseup touchend", e.vakata.dnd.stop);
        },
        _scroll:function(t) {
          if (!i.scroll_e || !i.scroll_l && !i.scroll_t) return i.scroll_i && (clearInterval(i.scroll_i), i.scroll_i = !1), !1;
          if (!i.scroll_i) return i.scroll_i = setInterval(e.vakata.dnd._scroll, 100), !1;
          if (t === !0) return !1;
          var n = i.scroll_e.scrollTop(), r = i.scroll_e.scrollLeft();
          i.scroll_e.scrollTop(n + i.scroll_t * e.vakata.dnd.settings.scroll_speed), i.scroll_e.scrollLeft(r + i.scroll_l * e.vakata.dnd.settings.scroll_speed), (n !== i.scroll_e.scrollTop() || r !== i.scroll_e.scrollLeft()) && e.vakata.dnd._trigger("scroll", i.scroll_e);
        },
        start:function(t, n, r) {
          "touchstart" === t.type && t.originalEvent && t.originalEvent.changedTouches && t.originalEvent.changedTouches[0] && (t.pageX = t.originalEvent.changedTouches[0].pageX, t.pageY = t.originalEvent.changedTouches[0].pageY, t.target = document.elementFromPoint(t.originalEvent.changedTouches[0].pageX - window.pageXOffset, t.originalEvent.changedTouches[0].pageY - window.pageYOffset)), i.is_drag && e.vakata.dnd.stop({});
          try {
            t.currentTarget.unselectable = "on", t.currentTarget.onselectstart = function() {
              return !1;
            }, t.currentTarget.style && (t.currentTarget.style.MozUserSelect = "none");
          } catch (s) {}
          return i.init_x = t.pageX, i.init_y = t.pageY, i.data = n, i.is_down = !0, i.element = t.currentTarget, r !== !1 && (i.helper = e("<div id='vakata-dnd'></div>").html(r).css({
            display:"block",
            margin:"0",
            padding:"0",
            position:"absolute",
            top:"-2000px",
            lineHeight:"16px",
            zIndex:"10000"
          })), e(document).bind("mousemove touchmove", e.vakata.dnd.drag), e(document).bind("mouseup touchend", e.vakata.dnd.stop), !1;
        },
        drag:function(n) {
          if ("touchmove" === n.type && n.originalEvent && n.originalEvent.changedTouches && n.originalEvent.changedTouches[0] && (n.pageX = n.originalEvent.changedTouches[0].pageX, n.pageY = n.originalEvent.changedTouches[0].pageY, n.target = document.elementFromPoint(n.originalEvent.changedTouches[0].pageX - window.pageXOffset, n.originalEvent.changedTouches[0].pageY - window.pageYOffset)), i.is_down) {
            if (!i.is_drag) {
              if (!(Math.abs(n.pageX - i.init_x) > e.vakata.dnd.settings.threshold || Math.abs(n.pageY - i.init_y) > e.vakata.dnd.settings.threshold)) return;
              i.helper && (i.helper.appendTo("body"), i.helper_w = i.helper.outerWidth()), i.is_drag = !0, e.vakata.dnd._trigger("start", n);
            }
            var r = !1, s = !1, a = !1, o = !1, d = !1, l = !1, c = !1, h = !1, _ = !1, u = !1;
            i.scroll_t = 0, i.scroll_l = 0, i.scroll_e = !1, e(e(n.target).parentsUntil("body").addBack().get().reverse()).filter(function() {
              return /^auto|scroll$/.test(e(this).css("overflow")) && (this.scrollHeight > this.offsetHeight || this.scrollWidth > this.offsetWidth);
            }).each(function() {
              var r = e(this), s = r.offset();
              return this.scrollHeight > this.offsetHeight && (s.top + r.height() - n.pageY < e.vakata.dnd.settings.scroll_proximity && (i.scroll_t = 1), n.pageY - s.top < e.vakata.dnd.settings.scroll_proximity && (i.scroll_t = -1)), this.scrollWidth > this.offsetWidth && (s.left + r.width() - n.pageX < e.vakata.dnd.settings.scroll_proximity && (i.scroll_l = 1), n.pageX - s.left < e.vakata.dnd.settings.scroll_proximity && (i.scroll_l = -1)), i.scroll_t || i.scroll_l ? (i.scroll_e = e(this), !1) :t;
            }), i.scroll_e || (r = e(document), s = e(window), a = r.height(), o = s.height(), d = r.width(), l = s.width(), c = r.scrollTop(), h = r.scrollLeft(), a > o && n.pageY - c < e.vakata.dnd.settings.scroll_proximity && (i.scroll_t = -1), a > o && o - (n.pageY - c) < e.vakata.dnd.settings.scroll_proximity && (i.scroll_t = 1), d > l && n.pageX - h < e.vakata.dnd.settings.scroll_proximity && (i.scroll_l = -1), d > l && l - (n.pageX - h) < e.vakata.dnd.settings.scroll_proximity && (i.scroll_l = 1), (i.scroll_t || i.scroll_l) && (i.scroll_e = r)), i.scroll_e && e.vakata.dnd._scroll(!0), i.helper && (_ = parseInt(n.pageY + e.vakata.dnd.settings.helper_top, 10), u = parseInt(n.pageX + e.vakata.dnd.settings.helper_left, 10), a && _ + 25 > a && (_ = a - 50), d && u + i.helper_w > d && (u = d - (i.helper_w + 2)), i.helper.css({
              left:u + "px",
              top:_ + "px"
            })), e.vakata.dnd._trigger("move", n);
          }
        },
        stop:function(t) {
          "touchend" === t.type && t.originalEvent && t.originalEvent.changedTouches && t.originalEvent.changedTouches[0] && (t.pageX = t.originalEvent.changedTouches[0].pageX, t.pageY = t.originalEvent.changedTouches[0].pageY, t.target = document.elementFromPoint(t.originalEvent.changedTouches[0].pageX - window.pageXOffset, t.originalEvent.changedTouches[0].pageY - window.pageYOffset)), i.is_drag && e.vakata.dnd._trigger("stop", t), e.vakata.dnd._clean();
        }
      };
    }(jQuery), e.jstree.defaults.search = {
      ajax:!1,
      fuzzy:!0,
      case_sensitive:!1,
      show_only_matches:!1,
      close_opened_onclear:!0,
      search_leaves_only:!1
    }, e.jstree.plugins.search = function(t, i) {
      this.bind = function() {
        i.bind.call(this), this._data.search.str = "", this._data.search.dom = e(), this._data.search.res = [], this._data.search.opn = [], this.element.on("before_open.jstree", e.proxy(function(t, i) {
          var n, r, s, a = this._data.search.res, o = [], d = e();
          if (a && a.length) {
            for (this._data.search.dom = e(), n = 0, r = a.length; r > n; n++) o = o.concat(this.get_node(a[n]).parents), s = this.get_node(a[n], !0), s && (this._data.search.dom = this._data.search.dom.add(s));
            for (o = e.vakata.array_unique(o), n = 0, r = o.length; r > n; n++) "#" !== o[n] && (s = this.get_node(o[n], !0), s && (d = d.add(s)));
            this._data.search.dom.children(".jstree-anchor").addClass("jstree-search"), this.settings.search.show_only_matches && this._data.search.res.length && (this.element.find("li").hide().filter(".jstree-last").filter(function() {
              return this.nextSibling;
            }).removeClass("jstree-last"), d = d.add(this._data.search.dom), d.parentsUntil(".jstree").addBack().show().filter("ul").each(function() {
              e(this).children("li:visible").eq(-1).addClass("jstree-last");
            }));
          }
        }, this)), this.settings.search.show_only_matches && this.element.on("search.jstree", function(t, i) {
          i.nodes.length && (e(this).find("li").hide().filter(".jstree-last").filter(function() {
            return this.nextSibling;
          }).removeClass("jstree-last"), i.nodes.parentsUntil(".jstree").addBack().show().filter("ul").each(function() {
            e(this).children("li:visible").eq(-1).addClass("jstree-last");
          }));
        }).on("clear_search.jstree", function(t, i) {
          i.nodes.length && e(this).find("li").css("display", "").filter(".jstree-last").filter(function() {
            return this.nextSibling;
          }).removeClass("jstree-last");
        });
      }, this.search = function(t, i) {
        if (t === !1 || "" === e.trim(t)) return this.clear_search();
        var n = this.settings.search, r = n.ajax ? n.ajax :!1, s = null, a = [], o = [], d, l;
        if (this._data.search.res.length && this.clear_search(), !i && r !== !1) return e.isFunction(r) ? r.call(this, t, e.proxy(function(i) {
          i && i.d && (i = i.d), this._load_nodes(e.isArray(i) ? i :[], function() {
            this.search(t, !0);
          });
        }, this)) :(r = e.extend({}, r), r.data || (r.data = {}), r.data.str = t, e.ajax(r).fail(e.proxy(function() {
          this._data.core.last_error = {
            error:"ajax",
            plugin:"search",
            id:"search_01",
            reason:"Could not load search parents",
            data:JSON.stringify(r)
          }, this.settings.core.error.call(this, this._data.core.last_error);
        }, this)).done(e.proxy(function(i) {
          i && i.d && (i = i.d), this._load_nodes(e.isArray(i) ? i :[], function() {
            this.search(t, !0);
          });
        }, this)));
        if (this._data.search.str = t, this._data.search.dom = e(), this._data.search.res = [], this._data.search.opn = [], s = new e.vakata.search(t, !0, {
          caseSensitive:n.case_sensitive,
          fuzzy:n.fuzzy
        }), e.each(this._model.data, function(e, t) {
          t.text && s.search(t.text).isMatch && (!n.search_leaves_only || t.state.loaded && 0 === t.children.length) && (a.push(e), o = o.concat(t.parents));
        }), a.length) {
          for (o = e.vakata.array_unique(o), this._search_open(o), d = 0, l = a.length; l > d; d++) s = this.get_node(a[d], !0), s && (this._data.search.dom = this._data.search.dom.add(s));
          this._data.search.res = a, this._data.search.dom.children(".jstree-anchor").addClass("jstree-search");
        }
        this.trigger("search", {
          nodes:this._data.search.dom,
          str:t,
          res:this._data.search.res
        });
      }, this.clear_search = function() {
        this._data.search.dom.children(".jstree-anchor").removeClass("jstree-search"), this.settings.search.close_opened_onclear && this.close_node(this._data.search.opn, 0), this.trigger("clear_search", {
          nodes:this._data.search.dom,
          str:this._data.search.str,
          res:this._data.search.res
        }), this._data.search.str = "", this._data.search.res = [], this._data.search.opn = [], this._data.search.dom = e();
      }, this._search_open = function(t) {
        var i = this;
        e.each(t.concat([]), function(n, r) {
          if ("#" === r) return !0;
          try {
            r = e("#" + r.replace(e.jstree.idregex, "\\$&"), i.element);
          } catch (s) {}
          r && r.length && i.is_closed(r) && (i._data.search.opn.push(r[0].id), i.open_node(r, function() {
            i._search_open(t);
          }, 0));
        });
      };
    }, function(e) {
      e.vakata.search = function(e, t, i) {
        i = i || {}, i.fuzzy !== !1 && (i.fuzzy = !0), e = i.caseSensitive ? e :e.toLowerCase();
        var n = i.location || 0, r = i.distance || 100, s = i.threshold || .6, a = e.length, o, d, l, c;
        return a > 32 && (i.fuzzy = !1), i.fuzzy && (o = 1 << a - 1, d = function() {
          var t = {}, i = 0;
          for (i = 0; a > i; i++) t[e.charAt(i)] = 0;
          for (i = 0; a > i; i++) t[e.charAt(i)] |= 1 << a - i - 1;
          return t;
        }(), l = function(e, t) {
          var i = e / a, s = Math.abs(n - t);
          return r ? i + s / r :s ? 1 :i;
        }), c = function(t) {
          if (t = i.caseSensitive ? t :t.toLowerCase(), e === t || -1 !== t.indexOf(e)) return {
            isMatch:!0,
            score:0
          };
          if (!i.fuzzy) return {
            isMatch:!1,
            score:1
          };
          var r, c, h = t.length, _ = s, u = t.indexOf(e, n), g, f, p = a + h, m, v, y, j, x, k = 1, b = [];
          for (-1 !== u && (_ = Math.min(l(0, u), _), u = t.lastIndexOf(e, n + a), -1 !== u && (_ = Math.min(l(0, u), _))), u = -1, r = 0; a > r; r++) {
            g = 0, f = p;
            while (f > g) _ >= l(r, n + f) ? g = f :p = f, f = Math.floor((p - g) / 2 + g);
            for (p = f, v = Math.max(1, n - f + 1), y = Math.min(n + f, h) + a, j = Array(y + 2), j[y + 1] = (1 << r) - 1, c = y; c >= v; c--) if (x = d[t.charAt(c - 1)], j[c] = 0 === r ? (1 | j[c + 1] << 1) & x :(1 | j[c + 1] << 1) & x | (1 | (m[c + 1] | m[c]) << 1) | m[c + 1], j[c] & o && (k = l(r, c - 1), _ >= k)) {
              if (_ = k, u = c - 1, b.push(u), !(u > n)) break;
              v = Math.max(1, 2 * n - u);
            }
            if (l(r + 1, n) > _) break;
            m = j;
          }
          return {
            isMatch:u >= 0,
            score:k
          };
        }, t === !0 ? {
          search:c
        } :c(t);
      };
    }(jQuery), e.jstree.defaults.sort = function(e, t) {
      return this.get_text(e) > this.get_text(t) ? 1 :-1;
    }, e.jstree.plugins.sort = function(t, i) {
      this.bind = function() {
        i.bind.call(this), this.element.on("model.jstree", e.proxy(function(e, t) {
          this.sort(t.parent, !0);
        }, this)).on("rename_node.jstree create_node.jstree", e.proxy(function(e, t) {
          this.sort(t.parent || t.node.parent, !1), this.redraw_node(t.parent || t.node.parent, !0);
        }, this)).on("move_node.jstree copy_node.jstree", e.proxy(function(e, t) {
          this.sort(t.parent, !1), this.redraw_node(t.parent, !0);
        }, this));
      }, this.sort = function(t, i) {
        var n, r;
        if (t = this.get_node(t), t && t.children && t.children.length && (t.children.sort(e.proxy(this.settings.sort, this)), i)) for (n = 0, r = t.children_d.length; r > n; n++) this.sort(t.children_d[n], !1);
      };
    };
    var u = !1;
    e.jstree.defaults.state = {
      key:"jstree",
      events:"changed.jstree open_node.jstree close_node.jstree",
      ttl:!1,
      filter:!1
    }, e.jstree.plugins.state = function(t, i) {
      this.bind = function() {
        i.bind.call(this);
        var t = e.proxy(function() {
          this.element.on(this.settings.state.events, e.proxy(function() {
            u && clearTimeout(u), u = setTimeout(e.proxy(function() {
              this.save_state();
            }, this), 100);
          }, this));
        }, this);
        this.element.on("ready.jstree", e.proxy(function(e, i) {
          this.element.one("restore_state.jstree", t), this.restore_state() || t();
        }, this));
      }, this.save_state = function() {
        var t = {
          state:this.get_state(),
          ttl:this.settings.state.ttl,
          sec:+new Date()
        };
        e.vakata.storage.set(this.settings.state.key, JSON.stringify(t));
      }, this.restore_state = function() {
        var t = e.vakata.storage.get(this.settings.state.key);
        if (t) try {
          t = JSON.parse(t);
        } catch (i) {
          return !1;
        }
        return t && t.ttl && t.sec && +new Date() - t.sec > t.ttl ? !1 :(t && t.state && (t = t.state), t && e.isFunction(this.settings.state.filter) && (t = this.settings.state.filter.call(this, t)), t ? (this.element.one("set_state.jstree", function(i, n) {
          n.instance.trigger("restore_state", {
            state:e.extend(!0, {}, t)
          });
        }), this.set_state(t), !0) :!1);
      }, this.clear_state = function() {
        return e.vakata.storage.del(this.settings.state.key);
      };
    }, function(e, t) {
      e.vakata.storage = {
        set:function(e, t) {
          return window.localStorage.setItem(e, t);
        },
        get:function(e) {
          return window.localStorage.getItem(e);
        },
        del:function(e) {
          return window.localStorage.removeItem(e);
        }
      };
    }(jQuery), e.jstree.defaults.types = {
      "#":{},
      "default":{}
    }, e.jstree.plugins.types = function(i, n) {
      this.init = function(e, i) {
        var r, s;
        if (i && i.types && i.types["default"]) for (r in i.types) if ("default" !== r && "#" !== r && i.types.hasOwnProperty(r)) for (s in i.types["default"]) i.types["default"].hasOwnProperty(s) && i.types[r][s] === t && (i.types[r][s] = i.types["default"][s]);
        n.init.call(this, e, i), this._model.data["#"].type = "#";
      }, this.refresh = function(e) {
        n.refresh.call(this, e), this._model.data["#"].type = "#";
      }, this.bind = function() {
        this.element.on("model.jstree", e.proxy(function(e, i) {
          var n = this._model.data, r = i.nodes, s = this.settings.types, a, o, d = "default";
          for (a = 0, o = r.length; o > a; a++) d = "default", n[r[a]].original && n[r[a]].original.type && s[n[r[a]].original.type] && (d = n[r[a]].original.type), n[r[a]].data && n[r[a]].data.jstree && n[r[a]].data.jstree.type && s[n[r[a]].data.jstree.type] && (d = n[r[a]].data.jstree.type), n[r[a]].type = d, n[r[a]].icon === !0 && s[d].icon !== t && (n[r[a]].icon = s[d].icon);
        }, this)), n.bind.call(this);
      }, this.get_json = function(t, i, r) {
        var s, a, o = this._model.data, d = i ? e.extend(!0, {}, i, {
          no_id:!1
        }) :{}, l = n.get_json.call(this, t, d, r);
        if (l === !1) return !1;
        if (e.isArray(l)) for (s = 0, a = l.length; a > s; s++) l[s].type = l[s].id && o[l[s].id] && o[l[s].id].type ? o[l[s].id].type :"default", i && i.no_id && (delete l[s].id, l[s].li_attr && l[s].li_attr.id && delete l[s].li_attr.id); else l.type = l.id && o[l.id] && o[l.id].type ? o[l.id].type :"default", i && i.no_id && (l = this._delete_ids(l));
        return l;
      }, this._delete_ids = function(t) {
        if (e.isArray(t)) {
          for (var i = 0, n = t.length; n > i; i++) t[i] = this._delete_ids(t[i]);
          return t;
        }
        return delete t.id, t.li_attr && t.li_attr.id && delete t.li_attr.id, t.children && e.isArray(t.children) && (t.children = this._delete_ids(t.children)), t;
      }, this.check = function(i, r, s, a, o) {
        if (n.check.call(this, i, r, s, a, o) === !1) return !1;
        r = r && r.id ? r :this.get_node(r), s = s && s.id ? s :this.get_node(s);
        var d = r && r.id ? e.jstree.reference(r.id) :null, l, c, h, _;
        switch (d = d && d._model && d._model.data ? d._model.data :null, i) {
         case "create_node":
         case "move_node":
         case "copy_node":
          if ("move_node" !== i || -1 === e.inArray(r.id, s.children)) {
            if (l = this.get_rules(s), l.max_children !== t && -1 !== l.max_children && l.max_children === s.children.length) return this._data.core.last_error = {
              error:"check",
              plugin:"types",
              id:"types_01",
              reason:"max_children prevents function: " + i,
              data:JSON.stringify({
                chk:i,
                pos:a,
                obj:r && r.id ? r.id :!1,
                par:s && s.id ? s.id :!1
              })
            }, !1;
            if (l.valid_children !== t && -1 !== l.valid_children && -1 === e.inArray(r.type, l.valid_children)) return this._data.core.last_error = {
              error:"check",
              plugin:"types",
              id:"types_02",
              reason:"valid_children prevents function: " + i,
              data:JSON.stringify({
                chk:i,
                pos:a,
                obj:r && r.id ? r.id :!1,
                par:s && s.id ? s.id :!1
              })
            }, !1;
            if (d && r.children_d && r.parents) {
              for (c = 0, h = 0, _ = r.children_d.length; _ > h; h++) c = Math.max(c, d[r.children_d[h]].parents.length);
              c = c - r.parents.length + 1;
            }
            (0 >= c || c === t) && (c = 1);
            do {
              if (l.max_depth !== t && -1 !== l.max_depth && c > l.max_depth) return this._data.core.last_error = {
                error:"check",
                plugin:"types",
                id:"types_03",
                reason:"max_depth prevents function: " + i,
                data:JSON.stringify({
                  chk:i,
                  pos:a,
                  obj:r && r.id ? r.id :!1,
                  par:s && s.id ? s.id :!1
                })
              }, !1;
              s = this.get_node(s.parent), l = this.get_rules(s), c++;
            } while (s);
          }
        }
        return !0;
      }, this.get_rules = function(e) {
        if (e = this.get_node(e), !e) return !1;
        var i = this.get_type(e, !0);
        return i.max_depth === t && (i.max_depth = -1), i.max_children === t && (i.max_children = -1), i.valid_children === t && (i.valid_children = -1), i;
      }, this.get_type = function(t, i) {
        return t = this.get_node(t), t ? i ? e.extend({
          type:t.type
        }, this.settings.types[t.type]) :t.type :!1;
      }, this.set_type = function(i, n) {
        var r, s, a, o, d;
        if (e.isArray(i)) {
          for (i = i.slice(), s = 0, a = i.length; a > s; s++) this.set_type(i[s], n);
          return !0;
        }
        return r = this.settings.types, i = this.get_node(i), r[n] && i ? (o = i.type, d = this.get_icon(i), i.type = n, (d === !0 || r[o] && r[o].icon && d === r[o].icon) && this.set_icon(i, r[n].icon !== t ? r[n].icon :!0), !0) :!1;
      };
    }, e.jstree.plugins.unique = function(t, i) {
      this.check = function(t, n, r, s, a) {
        if (i.check.call(this, t, n, r, s, a) === !1) return !1;
        if (n = n && n.id ? n :this.get_node(n), r = r && r.id ? r :this.get_node(r), !r || !r.children) return !0;
        var o = "rename_node" === t ? s :n.text, d = [], l = this._model.data, c, h;
        for (c = 0, h = r.children.length; h > c; c++) d.push(l[r.children[c]].text);
        switch (t) {
         case "delete_node":
          return !0;

         case "rename_node":
         case "copy_node":
          return c = -1 === e.inArray(o, d), c || (this._data.core.last_error = {
            error:"check",
            plugin:"unique",
            id:"unique_01",
            reason:"Child with name " + o + " already exists. Preventing: " + t,
            data:JSON.stringify({
              chk:t,
              pos:s,
              obj:n && n.id ? n.id :!1,
              par:r && r.id ? r.id :!1
            })
          }), c;

         case "move_node":
          return c = n.parent === r.id || -1 === e.inArray(o, d), c || (this._data.core.last_error = {
            error:"check",
            plugin:"unique",
            id:"unique_01",
            reason:"Child with name " + o + " already exists. Preventing: " + t,
            data:JSON.stringify({
              chk:t,
              pos:s,
              obj:n && n.id ? n.id :!1,
              par:r && r.id ? r.id :!1
            })
          }), c;
        }
        return !0;
      };
    };
    var g = document.createElement("DIV");
    g.setAttribute("unselectable", "on"), g.className = "jstree-wholerow", g.innerHTML = "&#160;", e.jstree.plugins.wholerow = function(t, i) {
      this.bind = function() {
        i.bind.call(this), this.element.on("loading", e.proxy(function() {
          g.style.height = this._data.core.li_height + "px";
        }, this)).on("ready.jstree set_state.jstree", e.proxy(function() {
          this.hide_dots();
        }, this)).on("ready.jstree", e.proxy(function() {
          this.get_container_ul().addClass("jstree-wholerow-ul");
        }, this)).on("deselect_all.jstree", e.proxy(function(e, t) {
          this.element.find(".jstree-wholerow-clicked").removeClass("jstree-wholerow-clicked");
        }, this)).on("changed.jstree", e.proxy(function(e, t) {
          this.element.find(".jstree-wholerow-clicked").removeClass("jstree-wholerow-clicked");
          var i = !1, n, r;
          for (n = 0, r = t.selected.length; r > n; n++) i = this.get_node(t.selected[n], !0), i && i.length && i.children(".jstree-wholerow").addClass("jstree-wholerow-clicked");
        }, this)).on("open_node.jstree", e.proxy(function(e, t) {
          this.get_node(t.node, !0).find(".jstree-clicked").parent().children(".jstree-wholerow").addClass("jstree-wholerow-clicked");
        }, this)).on("hover_node.jstree dehover_node.jstree", e.proxy(function(e, t) {
          this.get_node(t.node, !0).children(".jstree-wholerow")["hover_node" === e.type ? "addClass" :"removeClass"]("jstree-wholerow-hovered");
        }, this)).on("contextmenu.jstree", ".jstree-wholerow", e.proxy(function(t) {
          t.preventDefault();
          var i = e.Event("contextmenu", {
            metaKey:t.metaKey,
            ctrlKey:t.ctrlKey,
            altKey:t.altKey,
            shiftKey:t.shiftKey,
            pageX:t.pageX,
            pageY:t.pageY
          });
          e(t.currentTarget).closest("li").children("a:eq(0)").trigger(i);
        }, this)).on("click.jstree", ".jstree-wholerow", function(t) {
          t.stopImmediatePropagation();
          var i = e.Event("click", {
            metaKey:t.metaKey,
            ctrlKey:t.ctrlKey,
            altKey:t.altKey,
            shiftKey:t.shiftKey
          });
          e(t.currentTarget).closest("li").children("a:eq(0)").trigger(i).focus();
        }).on("click.jstree", ".jstree-leaf > .jstree-ocl", e.proxy(function(t) {
          t.stopImmediatePropagation();
          var i = e.Event("click", {
            metaKey:t.metaKey,
            ctrlKey:t.ctrlKey,
            altKey:t.altKey,
            shiftKey:t.shiftKey
          });
          e(t.currentTarget).closest("li").children("a:eq(0)").trigger(i).focus();
        }, this)).on("mouseover.jstree", ".jstree-wholerow, .jstree-icon", e.proxy(function(e) {
          return e.stopImmediatePropagation(), this.hover_node(e.currentTarget), !1;
        }, this)).on("mouseleave.jstree", ".jstree-node", e.proxy(function(e) {
          this.dehover_node(e.currentTarget);
        }, this));
      }, this.teardown = function() {
        this.settings.wholerow && this.element.find(".jstree-wholerow").remove(), i.teardown.call(this);
      }, this.redraw_node = function(t, n, r) {
        if (t = i.redraw_node.call(this, t, n, r)) {
          var s = g.cloneNode(!0);
          -1 !== e.inArray(t.id, this._data.core.selected) && (s.className += " jstree-wholerow-clicked"), t.insertBefore(s, t.childNodes[0]);
        }
        return t;
      };
    };
  }
});

(function(global) {
  var k, _handlers = {}, _mods = {
    16:false,
    18:false,
    17:false,
    91:false
  }, _scope = "all", _MODIFIERS = {
    "⇧":16,
    shift:16,
    "⌥":18,
    alt:18,
    option:18,
    "⌃":17,
    ctrl:17,
    control:17,
    "⌘":91,
    command:91
  }, _MAP = {
    backspace:8,
    tab:9,
    clear:12,
    enter:13,
    "return":13,
    esc:27,
    escape:27,
    space:32,
    left:37,
    up:38,
    right:39,
    down:40,
    del:46,
    "delete":46,
    home:36,
    end:35,
    pageup:33,
    pagedown:34,
    ",":188,
    ".":190,
    "/":191,
    "`":192,
    "-":189,
    "=":187,
    ";":186,
    "'":222,
    "[":219,
    "]":221,
    "\\":220
  }, code = function(x) {
    return _MAP[x] || x.toUpperCase().charCodeAt(0);
  }, _downKeys = [];
  for (k = 1; k < 20; k++) _MAP["f" + k] = 111 + k;
  function index(array, item) {
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  }
  function compareArray(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) return false;
    }
    return true;
  }
  var modifierMap = {
    16:"shiftKey",
    18:"altKey",
    17:"ctrlKey",
    91:"metaKey"
  };
  function updateModifierKey(event) {
    for (k in _mods) _mods[k] = event[modifierMap[k]];
  }
  function dispatch(event) {
    var key, handler, k, i, modifiersMatch, scope;
    key = event.keyCode;
    if (index(_downKeys, key) == -1) {
      _downKeys.push(key);
    }
    if (key == 93 || key == 224) key = 91;
    if (key in _mods) {
      _mods[key] = true;
      for (k in _MODIFIERS) if (_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);
    if (!assignKey.filter.call(this, event)) return;
    if (!(key in _handlers)) return;
    scope = getScope();
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];
      if (handler.scope == scope || handler.scope == "all") {
        modifiersMatch = handler.mods.length > 0;
        for (k in _mods) if (!_mods[k] && index(handler.mods, +k) > -1 || _mods[k] && index(handler.mods, +k) == -1) modifiersMatch = false;
        if (handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch) {
          if (handler.method(event, handler) === false) {
            if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
            if (event.stopPropagation) event.stopPropagation();
            if (event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  }
  function clearModifier(event) {
    var key = event.keyCode, k, i = index(_downKeys, key);
    if (i >= 0) {
      _downKeys.splice(i, 1);
    }
    if (key == 93 || key == 224) key = 91;
    if (key in _mods) {
      _mods[key] = false;
      for (k in _MODIFIERS) if (_MODIFIERS[k] == key) assignKey[k] = false;
    }
  }
  function resetModifiers() {
    for (k in _mods) _mods[k] = false;
    for (k in _MODIFIERS) assignKey[k] = false;
  }
  function assignKey(key, scope, method) {
    var keys, mods;
    keys = getKeys(key);
    if (method === undefined) {
      method = scope;
      scope = "all";
    }
    for (var i = 0; i < keys.length; i++) {
      mods = [];
      key = keys[i].split("+");
      if (key.length > 1) {
        mods = getMods(key);
        key = [ key[key.length - 1] ];
      }
      key = key[0];
      key = code(key);
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({
        shortcut:keys[i],
        scope:scope,
        method:method,
        key:keys[i],
        mods:mods
      });
    }
  }
  function unbindKey(key, scope) {
    var multipleKeys, keys, mods = [], i, j, obj;
    multipleKeys = getKeys(key);
    for (j = 0; j < multipleKeys.length; j++) {
      keys = multipleKeys[j].split("+");
      if (keys.length > 1) {
        mods = getMods(keys);
        key = keys[keys.length - 1];
      }
      key = code(key);
      if (scope === undefined) {
        scope = getScope();
      }
      if (!_handlers[key]) {
        return;
      }
      for (i = 0; i < _handlers[key].length; i++) {
        obj = _handlers[key][i];
        if (obj.scope === scope && compareArray(obj.mods, mods)) {
          _handlers[key][i] = {};
        }
      }
    }
  }
  function isPressed(keyCode) {
    if (typeof keyCode == "string") {
      keyCode = code(keyCode);
    }
    return index(_downKeys, keyCode) != -1;
  }
  function getPressedKeyCodes() {
    return _downKeys.slice(0);
  }
  function filter(event) {
    var tagName = (event.target || event.srcElement).tagName;
    return !(tagName == "INPUT" || tagName == "SELECT" || tagName == "TEXTAREA");
  }
  for (k in _MODIFIERS) assignKey[k] = false;
  function setScope(scope) {
    _scope = scope || "all";
  }
  function getScope() {
    return _scope || "all";
  }
  function deleteScope(scope) {
    var key, handlers, i;
    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1); else i++;
      }
    }
  }
  function getKeys(key) {
    var keys;
    key = key.replace(/\s/g, "");
    keys = key.split(",");
    if (keys[keys.length - 1] == "") {
      keys[keys.length - 2] += ",";
    }
    return keys;
  }
  function getMods(key) {
    var mods = key.slice(0, key.length - 1);
    for (var mi = 0; mi < mods.length; mi++) mods[mi] = _MODIFIERS[mods[mi]];
    return mods;
  }
  function addEvent(object, event, method) {
    if (object.addEventListener) object.addEventListener(event, method, false); else if (object.attachEvent) object.attachEvent("on" + event, function() {
      method(window.event);
    });
  }
  addEvent(document, "keydown", function(event) {
    dispatch(event);
  });
  addEvent(document, "keyup", clearModifier);
  addEvent(window, "focus", resetModifiers);
  var previousKey = global.key;
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;
  global.key.unbind = unbindKey;
  if (typeof module !== "undefined") module.exports = key;
})(this);

function Resurrect(options) {
  this.table = null;
  this.prefix = "#";
  this.cleanup = false;
  this.revive = true;
  for (var option in options) {
    if (options.hasOwnProperty(option)) {
      this[option] = options[option];
    }
  }
  this.refcode = this.prefix + "id";
  this.origcode = this.prefix + "original";
  this.buildcode = this.prefix + ".";
  this.valuecode = this.prefix + "v";
}

Resurrect.GLOBAL = (0, eval)("this");

Resurrect.escapeRegExp = function(string) {
  return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

Resurrect.prototype.Error = function ResurrectError(message) {
  this.message = message || "";
  this.stack = new Error().stack;
};

Resurrect.prototype.Error.prototype = Object.create(Error.prototype);

Resurrect.prototype.Error.prototype.name = "ResurrectError";

Resurrect.NamespaceResolver = function(scope) {
  this.scope = scope;
};

Resurrect.NamespaceResolver.prototype.getPrototype = function(name) {
  var constructor = this.scope[name];
  if (constructor) {
    return constructor.prototype;
  } else {
    throw new Resurrect.prototype.Error("Unknown constructor: " + name);
  }
};

Resurrect.NamespaceResolver.prototype.getName = function(object) {
  var constructor = object.constructor.name;
  if (constructor == null) {
    var funcPattern = /^\s*function\s*([A-Za-z0-9_$]*)/;
    constructor = funcPattern.exec(object.constructor)[1];
  }
  if (constructor === "") {
    var msg = "Can't serialize objects with anonymous constructors.";
    throw new Resurrect.prototype.Error(msg);
  } else if (constructor === "Object" || constructor === "Array") {
    return null;
  } else {
    return constructor;
  }
};

Resurrect.prototype.resolver = new Resurrect.NamespaceResolver(Resurrect.GLOBAL);

Resurrect.Node = function(html) {
  var div = document.createElement("div");
  div.innerHTML = html;
  return div.firstChild;
};

Resurrect.is = function(type) {
  var string = "[object " + type + "]";
  return function(object) {
    return Object.prototype.toString.call(object) === string;
  };
};

Resurrect.isArray = Resurrect.is("Array");

Resurrect.isString = Resurrect.is("String");

Resurrect.isBoolean = Resurrect.is("Boolean");

Resurrect.isNumber = Resurrect.is("Number");

Resurrect.isFunction = Resurrect.is("Function");

Resurrect.isDate = Resurrect.is("Date");

Resurrect.isRegExp = Resurrect.is("RegExp");

Resurrect.isObject = Resurrect.is("Object");

Resurrect.isAtom = function(object) {
  return !Resurrect.isObject(object) && !Resurrect.isArray(object);
};

Resurrect.isPrimitive = function(object) {
  return object == null || Resurrect.isNumber(object) || Resurrect.isString(object) || Resurrect.isBoolean(object);
};

Resurrect.prototype.ref = function(object) {
  var ref = {};
  if (object === undefined) {
    ref[this.prefix] = -1;
  } else {
    ref[this.prefix] = object[this.refcode];
  }
  return ref;
};

Resurrect.prototype.deref = function(ref) {
  return this.table[ref[this.prefix]];
};

Resurrect.prototype.tag = function(object) {
  if (this.revive) {
    var constructor = this.resolver.getName(object);
    if (constructor) {
      var proto = Object.getPrototypeOf(object);
      if (this.resolver.getPrototype(constructor) !== proto) {
        throw new this.Error("Constructor mismatch!");
      } else {
        object[this.prefix] = constructor;
      }
    }
  }
  object[this.refcode] = this.table.length;
  this.table.push(object);
  return object[this.refcode];
};

Resurrect.prototype.builder = function(name, value) {
  var builder = {};
  builder[this.buildcode] = name;
  builder[this.valuecode] = value;
  return builder;
};

Resurrect.prototype.build = function(ref) {
  var type = ref[this.buildcode].split(/\./).reduce(function(object, name) {
    return object[name];
  }, Resurrect.GLOBAL);
  var args = [ null ].concat(ref[this.valuecode]);
  var factory = type.bind.apply(type, args);
  var result = new factory();
  if (Resurrect.isPrimitive(result)) {
    return result.valueOf();
  } else {
    return result;
  }
};

Resurrect.prototype.decode = function(ref) {
  if (this.prefix in ref) {
    return this.deref(ref);
  } else if (this.buildcode in ref) {
    return this.build(ref);
  } else {
    throw new this.Error("Unknown encoding.");
  }
};

Resurrect.prototype.isTagged = function(object) {
  return this.refcode in object && object[this.refcode] != null;
};

Resurrect.prototype.visit = function(root, f) {
  if (Resurrect.isAtom(root)) {
    return f(root);
  } else if (!this.isTagged(root)) {
    var copy = null;
    if (Resurrect.isArray(root)) {
      copy = [];
      root[this.refcode] = this.tag(copy);
      for (var i = 0; i < root.length; i++) {
        copy.push(this.visit(root[i], f));
      }
    } else {
      copy = Object.create(Object.getPrototypeOf(root));
      root[this.refcode] = this.tag(copy);
      for (var key in root) {
        if (root.hasOwnProperty(key)) {
          copy[key] = this.visit(root[key], f);
        }
      }
    }
    copy[this.origcode] = root;
    return this.ref(copy);
  } else {
    return this.ref(root);
  }
};

Resurrect.prototype.handleAtom = function(atom) {
  var Node = Resurrect.GLOBAL.Node || function() {};
  if (Resurrect.isFunction(atom)) {
    throw new this.Error("Can't serialize functions.");
  } else if (atom instanceof Node) {
    var xmls = new XMLSerializer();
    return this.builder("Resurrect.Node", [ xmls.serializeToString(atom) ]);
  } else if (Resurrect.isDate(atom)) {
    return this.builder("Date", [ atom.toISOString() ]);
  } else if (Resurrect.isRegExp(atom)) {
    var args = atom.toString().match(/\/(.+)\/([gimy]*)/).slice(1);
    return this.builder("RegExp", args);
  } else if (atom === undefined) {
    return this.ref(undefined);
  } else if (Resurrect.isNumber(atom) && (isNaN(atom) || !isFinite(atom))) {
    return this.builder("Number", [ atom.toString() ]);
  } else {
    return atom;
  }
};

Resurrect.prototype.replacerWrapper = function(replacer) {
  var skip = new RegExp("^" + Resurrect.escapeRegExp(this.prefix));
  return function(k, v) {
    if (skip.test(k)) {
      return v;
    } else {
      return replacer(k, v);
    }
  };
};

Resurrect.prototype.stringify = function(object, replacer, space) {
  if (Resurrect.isFunction(replacer)) {
    replacer = this.replacerWrapper(replacer);
  } else if (Resurrect.isArray(replacer)) {
    var codes = [ this.prefix, this.refcode, this.origcode, this.buildcode, this.valuecode ];
    replacer = codes.concat(replacer);
  }
  if (Resurrect.isAtom(object)) {
    return JSON.stringify(this.handleAtom(object), replacer, space);
  } else {
    this.table = [];
    this.visit(object, this.handleAtom.bind(this));
    for (var i = 0; i < this.table.length; i++) {
      if (this.cleanup) {
        delete this.table[i][this.origcode][this.refcode];
      } else {
        this.table[i][this.origcode][this.refcode] = null;
      }
      delete this.table[i][this.refcode];
      delete this.table[i][this.origcode];
    }
    var table = this.table;
    this.table = null;
    return JSON.stringify(table, replacer, space);
  }
};

Resurrect.prototype.fixPrototype = function(object) {
  if (this.prefix in object) {
    var name = object[this.prefix];
    var prototype = this.resolver.getPrototype(name);
    if ("__proto__" in object) {
      object.__proto__ = prototype;
      if (this.cleanup) {
        delete object[this.prefix];
      }
      return object;
    } else {
      var copy = Object.create(prototype);
      for (var key in object) {
        if (object.hasOwnProperty(key) && key !== this.prefix) {
          copy[key] = object[key];
        }
      }
      return copy;
    }
  } else {
    return object;
  }
};

Resurrect.prototype.resurrect = function(string) {
  var result = null;
  var data = JSON.parse(string);
  if (Resurrect.isArray(data)) {
    this.table = data;
    if (this.revive) {
      for (var i = 0; i < this.table.length; i++) {
        this.table[i] = this.fixPrototype(this.table[i]);
      }
    }
    for (i = 0; i < this.table.length; i++) {
      var object = this.table[i];
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          if (!Resurrect.isAtom(object[key])) {
            object[key] = this.decode(object[key]);
          }
        }
      }
    }
    result = this.table[0];
  } else if (Resurrect.isObject(data)) {
    this.table = [];
    result = this.decode(data);
  } else {
    result = data;
  }
  this.table = null;
  return result;
};