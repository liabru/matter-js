# Matter.js

*Matter.js* is a JavaScript 2D rigid body physics engine for the web

[brm.io/matter-js](http://brm.io/matter-js)

[![Build Status](https://travis-ci.org/liabru/matter-js.png?branch=master)](https://travis-ci.org/liabru/matter-js)

[Features](#features) - [Status](#status) - [Install](#install) - [Usage](#usage) -  [Docs](http://brm.io/matter-js-docs/) - [Implementation](#implementation) - [References](#references) - [License](#license)

### Demos

- [Mixed Shapes](http://brm.io/matter-js-demo#mixed)
- [Solid Shapes](http://brm.io/matter-js-demo#mixedSolid)
- [Newton's Cradle](http://brm.io/matter-js-demo#newtonsCradle)
- [Wrecking Ball](http://brm.io/matter-js-demo#wreckingBall)
- [Rounded Corners (Chamfering)](http://brm.io/matter-js-demo#rounded)
- [Views](http://brm.io/matter-js-demo/#views)
- [Time Scaling](http://brm.io/matter-js-demo/#timescale)
- [Raycasting](http://brm.io/matter-js-demo/#raycasting)
- [Sprites](http://brm.io/matter-js-demo/#sprites)
- [Pyramid](http://brm.io/matter-js-demo#pyramid)
- [Car](http://brm.io/matter-js-demo#car)
- [Catapult](http://brm.io/matter-js-demo#catapult)
- [Reverse Gravity](http://brm.io/matter-js-demo#gravity)
- [Bridge](http://brm.io/matter-js-demo#bridge)
- [Avalanche](http://brm.io/matter-js-demo#avalanche)
- [Basic Soft Bodies](http://brm.io/matter-js-demo#softBody)
- [Cloth](http://brm.io/matter-js-demo#cloth)
- [Events](http://brm.io/matter-js-demo/#events)
- [Chains](http://brm.io/matter-js-demo#chains)
- [Ball Pool](http://brm.io/matter-js-demo#ballPool)
- [Stack](http://brm.io/matter-js-demo#stack)
- [Circle Stack](http://brm.io/matter-js-demo#circleStack)
- [Restitution](http://brm.io/matter-js-demo#restitution)
- [Friction](http://brm.io/matter-js-demo#friction)
- [Air Friction](http://brm.io/matter-js-demo#airFriction)
- [Sleeping](http://brm.io/matter-js-demo#sleeping)
- [Grid Broadphase](http://brm.io/matter-js-demo#broadphase)
- [Beach Balls](http://brm.io/matter-js-demo#beachBalls)
- [Stress 1](http://brm.io/matter-js-demo#stress)
- [Stress 2](http://brm.io/matter-js-demo#stress2)

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

### Status

Matter.js is currently only *alpha* status, so production use should be avoided.

This engine is the result of [learning game physics](http://brm.io/game-physics-for-beginners/) and getting a bit carried away. 
<br>There's no intention to compete with other engines, so I'm not sure yet how much it will be developed further. 
<br>That said, the engine is reasonably stable and performs well, it's just not feature complete.

Though if I get time and people are interested, I may continue working on it.
<br>Contributions are also welcome, if you'd like to help.

### Install

Download [matter-0.8.0.js](https://github.com/liabru/matter-js/releases/download/0.8.0-alpha/matter-0.8.0.js) or [matter-0.8.0.min.js](https://github.com/liabru/matter-js/releases/download/0.8.0-alpha/matter-0.8.0.min.js) and include the script in your HTML file:

    <script src="matter-0.8.0.js" type="text/javascript"></script>

For the latest features try the [edge version (master)](https://raw.github.com/liabru/matter-js/master/build/matter.js), but it may not be fully stable.

#### Or install using [Bower](http://bower.io/)

	bower install matter-js

### Usage

See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js) and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for many usage examples.
<br>When loaded, all modules and functions are under the global <code>Matter.*</code> namespace.

Some of the demos are avaliable at [codepen.io/liabru](http://codepen.io/liabru/), where you can easily experiment with them!

### Documentation

See the [Matter.js API Docs (v0.8.0)](http://brm.io/matter-js-docs/).
<br>If you're using the [edge version (master)](https://raw2.github.com/liabru/matter-js/master/build/matter.js) then see the [API Docs (master)](http://brm.io/matter-js-docs-master/).

### Changelog

To see what's new or changed in the latest version, see the [changelog](https://github.com/liabru/matter-js/blob/master/CHANGELOG.md)

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

### Similar Projects

If you need a more complete engine, check out jswiki's list of [Physics libraries](https://github.com/bebraw/jswiki/wiki/Physics-libraries)