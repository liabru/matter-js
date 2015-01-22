# Matter.js

> *Matter.js* is a JavaScript 2D rigid body physics engine for the web

[brm.io/matter-js](http://brm.io/matter-js)

[Features](#features) - [Status](#status) - [Install](#install) - [Usage](#usage) -  [Docs](http://brm.io/matter-js-docs/) - [Implementation](#implementation) - [References](#references) - [License](#license)

[![Build Status](https://travis-ci.org/liabru/matter-js.png?branch=master)](https://travis-ci.org/liabru/matter-js)

### Demos

<table>
  <tr>
    <td>
      <ul>
        <li><a href="http://brm.io/matter-js-demo#mixed">Mixed Shapes</a></li>
        <li><a href="http://brm.io/matter-js-demo#mixedSolid">Solid Shapes</a></li>
        <li><a href="http://brm.io/matter-js-demo#newtonsCradle">Newton's Cradle</a></li>
        <li><a href="http://brm.io/matter-js-demo#wreckingBall">Wrecking Ball</a></li>
        <li><a href="http://brm.io/matter-js-demo#slingshot">Slingshot Game</a></li>
        <li><a href="http://brm.io/matter-js-demo#rounded">Rounded Corners</a></li>
        <li><a href="http://brm.io/matter-js-demo/#views">Views</a></li>
        <li><a href="http://brm.io/matter-js-demo/#timescale">Time Scaling</a></li>
        <li><a href="http://brm.io/matter-js-demo/#raycasting">Raycasting</a></li>
        <li><a href="http://brm.io/matter-js-demo/#sprites">Sprites</a></li>
        <li><a href="http://brm.io/matter-js-demo#pyramid">Pyramid</a></li>
        <li><a href="http://brm.io/matter-js-demo#car">Car</a></li>
        <li><a href="http://brm.io/matter-js-demo#catapult">Catapult</a></li>
        <li><a href="http://brm.io/matter-js-demo#gravity">Reverse Gravity</a></li>
        <li><a href="http://brm.io/matter-js-demo#bridge">Bridge</a></li>
        <li><a href="http://brm.io/matter-js-demo#avalanche">Avalanche</a></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="http://brm.io/matter-js-demo#softBody">Basic Soft Bodies</a></li>
        <li><a href="http://brm.io/matter-js-demo#cloth">Cloth</a></li>
        <li><a href="http://brm.io/matter-js-demo/#events">Events</a></li>
        <li><a href="http://brm.io/matter-js-demo#chains">Chains</a></li>
        <li><a href="http://brm.io/matter-js-demo#ballPool">Ball Pool</a></li>
        <li><a href="http://brm.io/matter-js-demo#stack">Stack</a></li>
        <li><a href="http://brm.io/matter-js-demo#circleStack">Circle Stack</a></li>
        <li><a href="http://brm.io/matter-js-demo#restitution">Restitution</a></li>
        <li><a href="http://brm.io/matter-js-demo#friction">Friction</a></li>
        <li><a href="http://brm.io/matter-js-demo#airFriction">Air Friction</a></li>
        <li><a href="http://brm.io/matter-js-demo#sleeping">Sleeping</a></li>
        <li><a href="http://brm.io/matter-js-demo#broadphase">Grid Broadphase</a></li>
        <li><a href="http://brm.io/matter-js-demo#beachBalls">Beach Balls</a></li>
        <li><a href="http://brm.io/matter-js-demo#stress">Stress 1</a></li>
        <li><a href="http://brm.io/matter-js-demo#stress2">Stress 2</a></li>
      </ul>
      <br>
    </td>
  </tr>
</table>

### Features

- Physical properties (mass, area, density etc.)
- Rigid bodies of any convex polygon
- Stable stacking and resting
- Collisions (broad-phase, mid-phase and narrow-phase)
- Restitution (elastic and inelastic collisions)
- Conservation of momentum
- Friction and resistance
- Constraints
- Gravity
- Composite bodies
- Sleeping and static bodies
- Events
- Rounded corners (chamfering)
- Views (translate, zoom)
- Collision queries (raycasting, region tests)
- Time scaling (slow-mo, speed-up)
- Canvas renderer (supports vectors and textures)
- WebGL renderer (requires [pixi.js](https://github.com/GoodBoyDigital/pixi.js/))
- [MatterTools](https://github.com/liabru/matter-tools) for creating, testing and debugging worlds
- World state serialisation (requires [resurrect.js](https://github.com/skeeto/resurrect-js))
- Cross-browser (Chrome, Firefox, Safari, IE8+)
- Mobile-compatible (touch, responsive)
- An original JavaScript physics implementation (not a port)

### Install

Download the [edge build (master)](https://github.com/liabru/matter-js/blob/master/build/matter.js) or get a [stable release](https://github.com/liabru/matter-js/releases) and include the script in your web page:

    <script src="matter.js" type="text/javascript"></script>

You can also install using the package managers [Bower](http://bower.io/search/?q=matter-js) and [NPM](https://www.npmjs.org/package/matter-js).

    bower install matter-js
    npm install matter-js

### Usage

See the [Getting started](https://github.com/liabru/matter-js/wiki/Getting-started) wiki page for a minimal usage example.

Matter.js includes a sample renderer, but this is optional and it's easy to use your own.<br>
See the [Rendering](https://github.com/liabru/matter-js/wiki/Rendering) wiki page for information, including on how to use your own custom game loop.

Check out the [demo page](http://brm.io/matter-js-demo/) for more examples and then refer to [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) to see how they work. Some of the demos are also available on [codepen](http://codepen.io/collection/Fuagy/), where you can easily experiment with them.

### Documentation

Edge build documentation is at [Matter.js API Docs (master)](http://brm.io/matter-js-docs-master/)<br>
Stable release documentation is at [Matter.js API Docs (v0.8.0)](http://brm.io/matter-js-docs/)

### Status

Matter.js is currently in *alpha* status, meaning the API is still in development and may change occasionally.<br>
The library is reasonably stable as-is, but it is not yet feature complete.

### Building and Contributing

To build you must first install [node.js](http://nodejs.org/) and [grunt](http://gruntjs.com/), then run

	npm install

This will install the required build dependencies, then run

	grunt dev

which is a task that builds the `matter-dev.js` file, spawns a `connect` and `watch` server, then opens `demo/dev.html` in your browser. Any changes you make to the source will automatically rebuild `matter-dev.js` and reload your browser for quick and easy testing.

Contributions are welcome, please ensure they follow the same style and architecture as the rest of the code. You should run `grunt test` to ensure `jshint` gives no errors. Please do not include any changes to the files in the `build` directory. 

If you'd like to contribute but not sure what to work on, feel free to message me. Thanks!

### Changelog

To see what's new or changed in the latest version, see the [changelog](https://github.com/liabru/matter-js/blob/master/CHANGELOG.md).

### Implementation

The technical details for physics nerds and game devs.
<br>This engine is using the following techniques:

- Time-corrected position Verlet integrator
- Adaptive grid broad-phase detection
- AABB mid-phase detection
- SAT narrow-phase detection
- Iterative sequential impulse solver and position solver
- Resting collisions with resting constraints ala Erin Catto's method
    (GDC08)
- Temporal coherence impulse caching and warming
- Collision pairs, contacts and impulses maintained with a pair
    manager
- Approximate Coulomb friction model using friction constraints
- Constraints solved with the Gauss-Siedel method
- Semi-variable time step, synced with rendering
-   A basic sleeping strategy
- HTML5 Canvas / WebGL renderer

### References

See my post on [Game physics for beginners](http://brm.io/game-physics-for-beginners/).

### License

Matter.js is licensed under [The MIT License (MIT)](http://opensource.org/licenses/MIT)
<br/>Copyright (c) 2014 Liam Brummitt

This license is also supplied with the release and source code.
<br/>As stated in the license, absolutely no warranty is provided.