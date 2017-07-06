/*!
 * matter-wrap 0.2.0 by Liam Brummitt 2017-07-04
 * https://github.com/liabru/matter-wrap
 * License MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("matter-js"));
	else if(typeof define === 'function' && define.amd)
		define(["matter-js"], factory);
	else if(typeof exports === 'object')
		exports["MatterWrap"] = factory(require("matter-js"));
	else
		root["MatterWrap"] = factory(root["Matter"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/libs";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matter = __webpack_require__(0);

/**
 * A coordinate wrapping plugin for matter.js.
 * See the readme for usage and examples.
 * @module MatterWrap
 */
var MatterWrap = {
  // plugin meta
  name: 'matter-wrap', // PLUGIN_NAME
  version: '0.1.3', // PLUGIN_VERSION
  for: 'matter-js@^0.12.0',

  // installs the plugin where `base` is `Matter`
  // you should not need to call this directly.
  install: function install(base) {
    base.after('Engine.update', function () {
      MatterWrap.Engine.update(this);
    });
  },

  Engine: {
    /**
     * Updates the engine by wrapping bodies and composites inside `engine.world`.
     * This is called automatically by the plugin.
     * @function MatterWrap.Engine.update
     * @param {Matter.Engine} engine The engine to update.
     * @returns {void} No return value.
     */
    update: function update(engine) {
      var world = engine.world,
          bodies = Matter.Composite.allBodies(world),
          composites = Matter.Composite.allComposites(world);

      for (var i = 0; i < bodies.length; i += 1) {
        var body = bodies[i];

        if (body.plugin.wrap) {
          MatterWrap.Body.wrap(body, body.plugin.wrap);
        }
      }

      for (i = 0; i < composites.length; i += 1) {
        var composite = composites[i];

        if (composite.plugin.wrap) {
          MatterWrap.Composite.wrap(composite, composite.plugin.wrap);
        }
      }
    }
  },

  Bounds: {
    /**
     * Returns a translation vector that wraps the `objectBounds` inside the `bounds`.
     * @function MatterWrap.Bounds.wrap
     * @param {Matter.Bounds} objectBounds The bounds of the object to wrap inside the bounds.
     * @param {Matter.Bounds} bounds The bounds to wrap the body inside.
     * @returns {?Matter.Vector} A translation vector (only if wrapping is required).
     */
    wrap: function wrap(objectBounds, bounds) {
      var x = null,
          y = null;

      if (typeof bounds.min.x !== 'undefined' && typeof bounds.max.x !== 'undefined') {
        if (objectBounds.min.x > bounds.max.x) {
          x = bounds.min.x - objectBounds.max.x;
        } else if (objectBounds.max.x < bounds.min.x) {
          x = bounds.max.x - objectBounds.min.x;
        }
      }

      if (typeof bounds.min.y !== 'undefined' && typeof bounds.max.y !== 'undefined') {
        if (objectBounds.min.y > bounds.max.y) {
          y = bounds.min.y - objectBounds.max.y;
        } else if (objectBounds.max.y < bounds.min.y) {
          y = bounds.max.y - objectBounds.min.y;
        }
      }

      if (x !== null || y !== null) {
        return {
          x: x || 0,
          y: y || 0
        };
      }
    }
  },

  Body: {
    /**
     * Wraps the `body` position such that it always stays within the given bounds. 
     * Upon crossing a boundary the body will appear on the opposite side of the bounds, 
     * while maintaining its velocity.
     * This is called automatically by the plugin.
     * @function MatterWrap.Body.wrap
     * @param {Matter.Body} body The body to wrap.
     * @param {Matter.Bounds} bounds The bounds to wrap the body inside.
     * @returns {?Matter.Vector} The translation vector that was applied (only if wrapping was required).
     */
    wrap: function wrap(body, bounds) {
      var translation = MatterWrap.Bounds.wrap(body.bounds, bounds);

      if (translation) {
        Matter.Body.translate(body, translation);
      }

      return translation;
    }
  },

  Composite: {
    /**
     * Returns the union of the bounds of all of the composite's bodies
     * (not accounting for constraints).
     * @function MatterWrap.Composite.bounds
     * @param {Matter.Composite} composite The composite.
     * @returns {Matter.Bounds} The composite bounds.
     */
    bounds: function bounds(composite) {
      var bodies = Matter.Composite.allBodies(composite),
          vertices = [];

      for (var i = 0; i < bodies.length; i += 1) {
        var body = bodies[i];
        vertices.push(body.bounds.min, body.bounds.max);
      }

      return Matter.Bounds.create(vertices);
    },

    /**
     * Wraps the `composite` position such that it always stays within the given bounds. 
     * Upon crossing a boundary the composite will appear on the opposite side of the bounds, 
     * while maintaining its velocity.
     * This is called automatically by the plugin.
     * @function MatterWrap.Composite.wrap
     * @param {Matter.Composite} composite The composite to wrap.
     * @param {Matter.Bounds} bounds The bounds to wrap the composite inside.
     * @returns {?Matter.Vector} The translation vector that was applied (only if wrapping was required).
     */
    wrap: function wrap(composite, bounds) {
      var translation = MatterWrap.Bounds.wrap(MatterWrap.Composite.bounds(composite), bounds);

      if (translation) {
        Matter.Composite.translate(composite, translation);
      }

      return translation;
    }
  }
};

Matter.Plugin.register(MatterWrap);

module.exports = MatterWrap;

/**
 * @namespace Matter.Body
 * @see http://brm.io/matter-js/docs/classes/Body.html
 */

/**
 * This plugin adds a new property `body.plugin.wrap` to instances of `Matter.Body`.  
 * This is a `Matter.Bounds` instance that specifies the wrapping region.
 * @property {Matter.Bounds} body.plugin.wrap
 * @memberof Matter.Body
 */

/**
 * This plugin adds a new property `composite.plugin.wrap` to instances of `Matter.Composite`.  
 * This is a `Matter.Bounds` instance that specifies the wrapping region.
 * @property {Matter.Bounds} composite.plugin.wrap
 * @memberof Matter.Composite
 */

/***/ })
/******/ ]);
});