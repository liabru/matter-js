# Matter.js Changelog

[brm.io/matter-js](http://brm.io/matter-js)

----------

## 0.8.0-alpha - 2014-05-05

#### Release Highlights

- added [Views](http://brm.io/matter-js-demo/#views) demo
- added [Time Scaling](http://brm.io/matter-js-demo/#timescale) demo
- added [Rounded Corners (Chamfering)](http://brm.io/matter-js-demo#rounded) demo
- added [Raycasting](http://brm.io/matter-js-demo/#raycasting) demo
- added Query module, including raycasting
- added 3 useful new Composite methods
- added support for mouse wheel, mouse scaling and offsets
- added Body.scale for scaling bodies on the fly
- added Body.timeScale for slowing down bodies per-body
- added Body.setStatic for correctly setting static
- added Vertices.chamfer for rounding corners of any set of vertices
- added integration of chamfer to body factories
- added engine.timing.isFixed option to disable dynamic timing
- added render.bounds for translating and scaling views
- easier use of Engine.update and Engine.render for those using custom game loops
- fixed issues with time scaling
- fixed error in calculation of centre of mass
- removed Matter.Gui in preparation for the [MatterTools](https://github.com/liabru/matter-tools) project launch

#### Added

- added Demo.views
- added Demo.timescale
- added Demo.rounded
- added Demo.raycasting
- added demo support for hash + '-inspect' to start the [MatterTools](https://github.com/liabru/matter-tools) inspector
- added Composite.rebase
- added Composite.move
- added Composite.get
- added Matter.Query
- added Query.ray
- added Query.region
- added Bounds.translate
- added Bounds.shift
- added Mouse.setScale
- added Mouse.setPosition
- added mouse.absolute
- added mouse.wheelDelta
- added mouse.offset
- added Body.setStatic
- added Body.scale
- added body.timeScale
- added Vector.angle
- added Vertices.chamfer for rounding corners
- added Engine.render
- added engine.timing.isFixed option
- added render.bounds for translating and scaling views
- added Common.nextId
- added body.label
- added constraint.label
- added composite.label

#### Changed

- changed engine.timing.timestamp to be simulation based rather than wall-clock based
- changed correction to now be optional in Engine.update (defaults to 1)
- changed Events.on to return callback
- changed Events.off to accept callbacks for removal
- changed vertices in Bounds.create to optional
- changed engine.timeScale to engine.timing.timeScale
- moved Matter.Inspector and Matter.Gui to the [MatterTools](https://github.com/liabru/matter-tools) project
- moved event documentation to end of file for clarity
- moved respective engine event triggers into Engine.update and Engine.render

#### Removed

- removed body.render.path (redundant)
- removed Body.nextId
- removed Constraint.nextId
- removed Composite.nextId
- removed Body.updateProperties (now a private method)

#### Fixed

- fixed issues with timing.timeScale
- fixed constraints now account for timeScale
- fixed Vertices.centre calculation to get correct centre of mass

## 0.7.0-alpha - 2014-04-01

#### Release Highlights

- added six new demos
	- all demos are now mobile friendly
- added new event system
	- engine, mouse and collision events
- added sprite texture rendering support
- added WebGL renderer (pixi.js)
- improved `Composite` (and `World`)
	- batch adding
	- type agnostic adding
	- body removal
- major performance increases all round
	- collision detection caching
	- batched rendering
	- improved pair management
	- memory leaks fixed
- stability improvements
	- bodies rest better due to collision caching
	- bodies sleep better
	- constraints are much less volatile
- fixes for a number of issues (see fixes)

#### Added

- added demos 
	- sprites
	- events
	- catapult
	- cloth
	- soft body
	- bridge
- added collision caching and reuse for improved performance
	- added metrics for collision reuse
- added `Events` module ([Issue #8](https://github.com/liabru/matter-js/issues/8))
	- engine events
	- mouse events
	- collision events
- added composite functions, including
	- batch adding (`Composite.add` / `World.add`)
	- type agnostic adding (`Composite.add` / `World.add`)
	- body removal (`Composite.remove` / `World.remove`)
- added factory functions
	- constraint meshing (`Composites.mesh`)
	- soft body factory (`Composites.softBody`)
- added `RenderPixi`, a pixi.js WebGL renderer
	- added `Gui` option to switch renderer
	- added `Mouse.setElement`
- added `render.visible` flag to `Body` and `Constraint` ([Issue #10](https://github.com/liabru/matter-js/issues/10))
- added `id` to `Constraint` and `Composite`
- added `type` names to `Body`, `Constraint`, `Composite`
- added `Common` functions
	- `Common.colorToNumber`
	- `Common.log`
	- `Common.clone`
- added jsdoc annotations
- added travis-ci integration
- added yuidoc build tasks
- added multiple build modes to `Gruntfile` (dev, release, edge)
- added repository to `package.json`, so Browserify may be used
- added `CHANGELOG.md`

#### Changed

- renamed module `Manager` to `Pairs`
- changed `Composite` to be tree-based
- changed timestep to be smoothed over 1s for stability
- changed default `constraintIterations` to 2 for stability
- changed demo to use the new composite functions
- changed right click to now remove bodies in the demos
- changed `Common.now` to use high-resolution timing
- changed `MouseConstraint` to reference a single constraint rather than a list
- changed `Constraint` to now use a `render` property
- changed `Metrics` to only track FPS by default, use the `extended` flag for full metrics

#### Removed

- removed the default in `MouseConstraint`, you must now instantiate one manually

#### Fixed

- fixed a memory leak in `Grid`
- fixed a memory leak in `Manager`
- fixed debug text now uses `Metrics` correctly
- fixed issues regarding passing custom `Render` modules ([Issue #7](https://github.com/liabru/matter-js/issues/7))
- fixed issue in `Common.extend` with `null` properties
- fixed issue with sleeping, now ignores inactive pairs
- fixed issues with `Body.applyForce` ([Issue #7](https://github.com/liabru/matter-js/issues/7))

## 0.5.0-alpha - 2014-02-28

- initial release