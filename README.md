<img alt="Matter.js" src="https://brm.io/matter-js/img/matter-js.svg" width="300">

> *Matter.js* is a JavaScript 2D rigid body physics engine for the web

[brm.io/matter-js](https://brm.io/matter-js/)

[Demos](#demos) ・ [Gallery](#gallery) ・ [Features](#features) ・ [Plugins](#plugins) ・ [Install](#install) ・ [Usage](#usage) ・ [Examples](#examples) ・ [Docs](#documentation) ・ [Wiki](https://github.com/liabru/matter-js/wiki) ・ [References](#references) ・ [License](#license)

[![Build Status](https://travis-ci.org/liabru/matter-js.png?branch=master)](https://travis-ci.org/liabru/matter-js)

### Demos

<table>
  <tr>
    <td>
      <ul>
        <li><a href="https://brm.io/matter-js/demo/#mixed">Mixed Shapes</a></li>
        <li><a href="https://brm.io/matter-js/demo/#mixedSolid">Solid Shapes</a></li>
        <li><a href="https://brm.io/matter-js/demo/#svg">Concave SVG Paths</a></li>
        <li><a href="https://brm.io/matter-js/demo/#terrain">Concave Terrain</a></li>
        <li><a href="https://brm.io/matter-js/demo/#concave">Concave Bodies</a></li>
        <li><a href="https://brm.io/matter-js/demo/#compound">Compound Bodies</a></li>
        <li><a href="https://brm.io/matter-js/demo/#newtonsCradle">Newton's Cradle</a></li>
        <li><a href="https://brm.io/matter-js/demo/#wreckingBall">Wrecking Ball</a></li>
        <li><a href="https://brm.io/matter-js/demo/#slingshot">Slingshot Game</a></li>
        <li><a href="https://brm.io/matter-js/demo/#rounded">Rounded Corners</a></li>
        <li><a href="https://brm.io/matter-js/demo/#views">Views</a></li>
        <li><a href="https://brm.io/matter-js/demo/#timescale">Time Scaling</a></li>
        <li><a href="https://brm.io/matter-js/demo/#manipulation">Body Manipulation</a></li>
        <li><a href="https://brm.io/matter-js/demo/#compositeManipulation">Composite Manipulation</a></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="https://brm.io/matter-js/demo/#raycasting">Raycasting</a></li>
        <li><a href="https://brm.io/matter-js/demo/#sprites">Sprites</a></li>
        <li><a href="https://brm.io/matter-js/demo/#pyramid">Pyramid</a></li>
        <li><a href="https://brm.io/matter-js/demo/#car">Car</a></li>
        <li><a href="https://brm.io/matter-js/demo/#catapult">Catapult</a></li>
        <li><a href="https://brm.io/matter-js/demo/#gravity">Reverse Gravity</a></li>
        <li><a href="https://brm.io/matter-js/demo/#bridge">Bridge</a></li>
        <li><a href="https://brm.io/matter-js/demo/#avalanche">Avalanche</a></li>
        <li><a href="https://brm.io/matter-js/demo/#softBody">Basic Soft Bodies</a></li>
        <li><a href="https://brm.io/matter-js/demo/#cloth">Cloth</a></li>
        <li><a href="https://brm.io/matter-js/demo/#events">Events</a></li>
        <li><a href="https://brm.io/matter-js/demo/#collisionFiltering">Collision Filtering</a></li>
        <li><a href="https://brm.io/matter-js/demo/#chains">Chains</a></li>
        <li><a href="https://brm.io/matter-js/demo/#ballPool">Ball Pool</a></li>
      </ul>
    </td>
    <td>
      <ul>
        <li><a href="https://brm.io/matter-js/demo/#stack">Stack</a></li>
        <li><a href="https://brm.io/matter-js/demo/#circleStack">Circle Stack</a></li>
        <li><a href="https://brm.io/matter-js/demo/#compoundStack">Compound Stack</a></li>
        <li><a href="https://brm.io/matter-js/demo/#restitution">Restitution</a></li>
        <li><a href="https://brm.io/matter-js/demo/#friction">Friction</a></li>
        <li><a href="https://brm.io/matter-js/demo/#airFriction">Air Friction</a></li>
        <li><a href="https://brm.io/matter-js/demo/#staticFriction">Static Friction</a></li>
        <li><a href="https://brm.io/matter-js/demo/#sleeping">Sleeping</a></li>
        <li><a href="https://brm.io/matter-js/demo/#beachBalls">Beach Balls</a></li>
        <li><a href="https://brm.io/matter-js/demo/#stress">Stress 1</a></li>
        <li><a href="https://brm.io/matter-js/demo/#stress2">Stress 2</a></li>
        <li><a href="https://brm.io/matter-js/demo/#sensors">Sensors</a></li>
      </ul>
      <br>
    </td>
  </tr>
</table>

### Gallery

See how others are using matter.js physics

- [Patrick Heng](https://patrickheng.com/) by Patrick Heng
- [USELESS](https://useless.london/) by Nice and Serious
- [Secret 7](https://secret-7.com/) by Goodness
- [New Company](https://www.new.company/) by New Company
- [Game of The Year](https://gameoftheyear.withgoogle.com/) by Google
- [Pablo The Flamingo](https://pablotheflamingo.com/) by Nathan Gordon
- [Les métamorphoses de Mr. Kalia](https://lab212.org/oeuvres/2:art/18/Les-metamorphoses-de-Mr-Kalia) by Lab212
- [Phaser](https://phaser.io/) by Photon Storm
- [Sorry I Have No Filter](https://sorryihavenofilter.com/pages/about/) by Jessica Walsh
- [Fuse](https://fuse.blog/) by Fuse
- [Glyphfinder](https://www.glyphfinder.com/) by überdosis
- [Isolation](https://isolation.is/postcards/my-week) by sabato studio
- [more...](https://github.com/liabru/matter-js/wiki/Gallery)

### Features

- Rigid bodies
- Compound bodies
- Composite bodies
- Concave and convex hulls
- Physical properties (mass, area, density etc.)
- Restitution (elastic and inelastic collisions)
- Collisions (broad-phase, mid-phase and narrow-phase)
- Stable stacking and resting
- Conservation of momentum
- Friction and resistance
- Events
- Constraints
- Gravity
- Sleeping and static bodies
- Plugins
- Rounded corners (chamfering)
- Views (translate, zoom)
- Collision queries (raycasting, region tests)
- Time scaling (slow-mo, speed-up)
- Canvas renderer (supports vectors and textures)
- [MatterTools](https://github.com/liabru/matter-tools) for creating, testing and debugging worlds
- World state serialisation (requires [resurrect.js](https://github.com/skeeto/resurrect-js))
- Cross-browser and Node.js support (Chrome, Firefox, Safari, IE8+)
- Mobile-compatible (touch, responsive)
- An original JavaScript physics implementation (not a port)

### Install

You can install using package managers [npm](https://www.npmjs.org/package/matter-js) and [Yarn](https://yarnpkg.com/) using:

    npm install matter-js

Alternatively you can download a [stable release](https://github.com/liabru/matter-js/tags) or try the latest experimental [alpha build](https://github.com/liabru/matter-js/tree/master/build) (master) and include the script in your web page:

    <script src="matter.js" type="text/javascript"></script>

### Webpack

Some [webpack](https://webpack.js.org/) configs including the default may impact your project's performance during development, for a solution see [issue](https://github.com/liabru/matter-js/issues/1001).

### Usage

Visit the [Getting started](https://github.com/liabru/matter-js/wiki/Getting-started) wiki page for a minimal usage example which should work in both browsers and Node.js.  
Also see the [Running](https://github.com/liabru/matter-js/wiki/Running) and [Rendering](https://github.com/liabru/matter-js/wiki/Rendering) wiki pages, which show how to use your own game and rendering loops.

### Tutorials

See the list of [tutorials](https://github.com/liabru/matter-js/wiki/Tutorials).

### Examples

See the [examples](https://github.com/liabru/matter-js/tree/master/examples) directory which contains the source for all [demos](#demos).  
There are even more examples on [codepen](https://codepen.io/collection/Fuagy/).

### Plugins

The engine can be extended through plugins, see these resources:

- [Using plugins](https://github.com/liabru/matter-js/wiki/Using-plugins)
- [Creating plugins](https://github.com/liabru/matter-js/wiki/Creating-plugins)
- [List of plugins](https://github.com/liabru/matter-js/wiki/List-of-plugins)
- [matter-plugin-boilerplate](https://github.com/liabru/matter-plugin-boilerplate)

### Documentation

See the [API Documentation](https://brm.io/matter-js/docs/) and the [wiki](https://github.com/liabru/matter-js/wiki)

### Building and Contributing

To build you must first install [node.js](https://nodejs.org/), then run

	npm install

This will install the required build dependencies, then run

	npm run dev

to spawn a development server. For information on contributing see [CONTRIBUTING.md](https://github.com/liabru/matter-js/blob/master/CONTRIBUTING.md).

### Changelog

To see what's new or changed in the latest version, see the [changelog](https://github.com/liabru/matter-js/blob/master/CHANGELOG.md).

### References

See the wiki page on [References](https://github.com/liabru/matter-js/wiki/References).

### License

Matter.js is licensed under [The MIT License (MIT)](https://opensource.org/licenses/MIT)  
Copyright (c) 2014 Liam Brummitt

This license is also supplied with the release and source code.  
As stated in the license, absolutely no warranty is provided.
