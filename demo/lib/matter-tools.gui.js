/*!
 * matter-tools 0.12.2 by @liabru 2021-01-12
 * https://github.com/liabru/matter-tools
 * License MIT
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Liam Brummitt
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("matter-js"), require("matter-tools"));
	else if(typeof define === 'function' && define.amd)
		define("Gui", ["matter-js", "matter-tools"], factory);
	else if(typeof exports === 'object')
		exports["Gui"] = factory(require("matter-js"), require("matter-tools"));
	else
		root["MatterTools"] = root["MatterTools"] || {}, root["MatterTools"]["Gui"] = factory(root["Matter"], root["MatterTools"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__0__, __WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/demo/lib";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
* @class Common
*/

const Common = module.exports = {};

Common.injectStyles = function(styles, id) {
  if (document.getElementById(id)) {
    return;
  }

  let root = document.createElement('div');
  root.innerHTML = `<style id="${id}" type="text/css">${styles}</style>`;

  let lastStyle = document.head.querySelector('style:last-of-type');

  if (lastStyle) {
    Common.domInsertBefore(root.firstElementChild, lastStyle);
  } else {
    document.head.appendChild(root.firstElementChild);
  }
};

Common.injectScript = function(url, id, callback) {
  if (document.getElementById(id)) {
    return;
  }

  let script = document.createElement('script');
  script.id = id;
  script.src = url;
  script.onload = callback;

  document.body.appendChild(script);
};

Common.domRemove = function(element) {
  return element.parentElement.removeChild(element);
};

Common.domInsertBefore = function(element, before) {
  return before.parentNode.insertBefore(element, before.previousElementSibling);
};


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A tool for modifying the properties of an engine and renderer.
 * @module Gui
 */

var Gui = module.exports = {};

const dat = __webpack_require__(12);
const ToolsCommon = __webpack_require__(2);
const Serializer = __webpack_require__(1).Serializer;

const Matter = __webpack_require__(0);
const Engine = Matter.Engine;
const Detector = Matter.Detector;
const Grid = Matter.Grid;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Composite = Matter.Composite;

/**
 * Creates a Gui
 * @function Gui.create
 * @param {engine} [engine]
 * @param {runner} [runner]
 * @param {render} [render]
 * @return {gui} The created gui instance
 */
Gui.create = function(engine, runner, render) {
  dat.GUI.TEXT_CLOSED = '▲';
  dat.GUI.TEXT_OPEN = '▼';

  var datGui = new dat.GUI({ autoPlace: false });

  var gui = {
    engine: engine,
    runner: runner,
    render: render,
    datGui: datGui,
    broadphase: 'grid',
    broadphaseCache: {
      grid: (engine.broadphase.controller === Grid) ? engine.broadphase : Grid.create(),
      bruteForce: {
        detector: Detector.bruteForce
      }
    },
    amount: 1,
    size: 40,
    sides: 4,
    density: 0.001,
    restitution: 0,
    friction: 0.1,
    frictionStatic: 0.5,
    frictionAir: 0.01,
    offset: { x: 0, y: 0 },
    renderer: 'canvas',
    chamfer: 0,
    isRecording: false
  };
  
  if (Serializer) {
    gui.serializer = Serializer.create();
  }

  let styles = __webpack_require__(13);
  ToolsCommon.injectStyles(styles, 'matter-gui-style');

  _initDatGui(gui);

  return gui;
};

/**
 * Updates the Gui
 * @function Gui.update
 * @param {gui} gui
 */
Gui.update = function(gui) {
  var i;
  var datGui = gui.datGui;
  
  for (i in datGui.__folders) {
    Gui.update(gui, datGui.__folders[i]);
  }
  
  for (i in datGui.__controllers) {
    var controller = datGui.__controllers[i];
    if (controller.updateDisplay)
      controller.updateDisplay();
  }
};

/**
 * Closes all sections of the Gui
 * @function Gui.closeAll
 * @param {gui} gui
 */
Gui.closeAll = function(gui) {
  var datGui = gui.datGui;
  
  for (var i in datGui.__folders) {
    datGui.__folders[i].close();
  }
};

/**
 * Destroys the GUI
 * @function Gui.destroy
 * @param {gui} gui
 */
Gui.destroy = function(gui) {
  gui.datGui.domElement.parentElement.removeChild(gui.datGui.domElement);
  gui.datGui.destroy();
};

var _initDatGui = function(gui) {
  var engine = gui.engine,
    runner = gui.runner,
    datGui = gui.datGui;

  var funcs = {
    addBody: function() { _addBody(gui); },
    clear: function() { _clear(gui); },
    save: function() { Serializer.saveState(gui.serializer, engine, 'guiState'); Events.trigger(gui, 'save'); },
    load: function() { Serializer.loadState(gui.serializer, engine, 'guiState'); Events.trigger(gui, 'load'); }
  };

  var metrics = datGui.addFolder('Metrics');

  if (runner) {
    metrics.add(runner, 'fps').listen();
  }

  if (engine.metrics.extended) {
    if (runner) {
      metrics.add(runner, 'delta').listen();
      metrics.add(runner, 'correction').listen();
    }

    if (engine) {
      metrics.add(engine.metrics, 'bodies').listen();
      metrics.add(engine.metrics, 'collisions').listen();
      metrics.add(engine.metrics, 'pairs').listen();
      metrics.add(engine.metrics, 'broadEff').listen();
      metrics.add(engine.metrics, 'midEff').listen();
      metrics.add(engine.metrics, 'narrowEff').listen();
      metrics.add(engine.metrics, 'narrowReuse').listen();
    }
    
    metrics.open();
  }

  if (engine) {
    var controls = datGui.addFolder('Add Body');
    controls.add(gui, 'amount', 1, 5).step(1);
    controls.add(gui, 'size', 5, 150).step(1);
    controls.add(gui, 'sides', 1, 8).step(1);
    controls.add(gui, 'density', 0.0001, 0.01).step(0.001);
    controls.add(gui, 'friction', 0, 1).step(0.05);
    controls.add(gui, 'frictionStatic', 0, 10).step(0.1);
    controls.add(gui, 'frictionAir', 0, gui.frictionAir * 10).step(gui.frictionAir / 10);
    controls.add(gui, 'restitution', 0, 1).step(0.1);
    controls.add(gui, 'chamfer', 0, 30).step(2);
    controls.add(funcs, 'addBody');
    controls.open();

    var worldGui = datGui.addFolder('World');

    if (gui.serializer) {
      worldGui.add(funcs, 'load');
      worldGui.add(funcs, 'save');
    }

    worldGui.add(funcs, 'clear');
    worldGui.open();
    
    var gravity = datGui.addFolder('Gravity');
    gravity.add(engine.world.gravity, 'scale', 0, 0.001).step(0.0001);
    gravity.add(engine.world.gravity, 'x', -1, 1).step(0.01);
    gravity.add(engine.world.gravity, 'y', -1, 1).step(0.01);

    var physics = datGui.addFolder('Engine');
    physics.add(engine, 'enableSleeping');

    physics.add(engine.timing, 'timeScale', 0, 1.2).step(0.05).listen();
    physics.add(engine, 'velocityIterations', 1, 10).step(1);
    physics.add(engine, 'positionIterations', 1, 10).step(1);
    physics.add(engine, 'constraintIterations', 1, 10).step(1);

    if (runner) {
      physics.add(runner, 'enabled');
    }
  }

  if (gui.render) {
    var render = datGui.addFolder('Render');

    render
      .add(gui.render.options, 'wireframes')
      .onFinishChange(function(value) {
        if (!value) {
          angleIndicatorWidget.setValue(false);
          axesWidget.setValue(false);
        }
      });

    render.add(gui.render.options, 'showDebug');
    render.add(gui.render.options, 'showPositions');
    render.add(gui.render.options, 'showBroadphase');
    render.add(gui.render.options, 'showBounds');
    render.add(gui.render.options, 'showVelocity');
    render.add(gui.render.options, 'showCollisions');
    render.add(gui.render.options, 'showSeparations');
    var axesWidget = render.add(gui.render.options, 'showAxes');
    var angleIndicatorWidget = render.add(gui.render.options, 'showAngleIndicator');
    render.add(gui.render.options, 'showSleeping');
    render.add(gui.render.options, 'showIds');
    render.add(gui.render.options, 'showVertexNumbers');
    render.add(gui.render.options, 'showConvexHulls');
    render.add(gui.render.options, 'showInternalEdges');
    render.add(gui.render.options, 'enabled');
    render.open();
  }

  document.body.appendChild(gui.datGui.domElement);
};

var _addBody = function(gui) {
  var engine = gui.engine;

  var options = { 
    density: gui.density,
    friction: gui.friction,
    frictionStatic: gui.frictionStatic,
    frictionAir: gui.frictionAir,
    restitution: gui.restitution
  };

  if (gui.chamfer && gui.sides > 2) {
    options.chamfer = {
      radius: gui.chamfer
    };
  }

  for (var i = 0; i < gui.amount; i++) {
    World.add(engine.world, Bodies.polygon(gui.offset.x + 120 + i * gui.size + i * 50, gui.offset.y + 200, gui.sides, gui.size, options));
  }
};

var _clear = function(gui) {
  var engine = gui.engine,
    constraints = Composite.allConstraints(engine.world),
    mouseConstraint = null;

  // find mouse constraints
  for (var i = 0; i < constraints.length; i += 1) {
    var constraint = constraints[i];

    // TODO: need a better way than this
    if (constraint.label === 'Mouse Constraint') {
      mouseConstraint = constraint;
      break;
    }
  }
  
  World.clear(engine.world, true);
  Engine.clear(engine);

  // add mouse constraint back in
  if (mouseConstraint) {
    Composite.add(engine.world, mouseConstraint);
  }

  // clear scene graph (if defined in controller)
  if (gui.render) {
    var renderController = gui.render.controller;
    if (renderController.clear)
      renderController.clear(gui.render);
  }

  Events.trigger(gui, 'clear');
};

/*
*
*  Events Documentation
*
*/

/**
* Fired after the gui's clear button pressed
*
* @event clear
* @param {} event An event object
* @param {} event.source The source object of the event
* @param {} event.name The name of the event
*/

/**
* Fired after the gui's save button pressed
*
* @event save
* @param {} event An event object
* @param {} event.source The source object of the event
* @param {} event.name The name of the event
*/

/**
* Fired after the gui's load button pressed
*
* @event load
* @param {} event An event object
* @param {} event.source The source object of the event
* @param {} event.name The name of the event
*/

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
!function(e,t){ true?t(exports):undefined}(this,function(e){"use strict";function t(e,t){var n=e.__state.conversionName.toString(),o=Math.round(e.r),i=Math.round(e.g),r=Math.round(e.b),s=e.a,a=Math.round(e.h),l=e.s.toFixed(1),d=e.v.toFixed(1);if(t||"THREE_CHAR_HEX"===n||"SIX_CHAR_HEX"===n){for(var c=e.hex.toString(16);c.length<6;)c="0"+c;return"#"+c}return"CSS_RGB"===n?"rgb("+o+","+i+","+r+")":"CSS_RGBA"===n?"rgba("+o+","+i+","+r+","+s+")":"HEX"===n?"0x"+e.hex.toString(16):"RGB_ARRAY"===n?"["+o+","+i+","+r+"]":"RGBA_ARRAY"===n?"["+o+","+i+","+r+","+s+"]":"RGB_OBJ"===n?"{r:"+o+",g:"+i+",b:"+r+"}":"RGBA_OBJ"===n?"{r:"+o+",g:"+i+",b:"+r+",a:"+s+"}":"HSV_OBJ"===n?"{h:"+a+",s:"+l+",v:"+d+"}":"HSVA_OBJ"===n?"{h:"+a+",s:"+l+",v:"+d+",a:"+s+"}":"unknown format"}function n(e,t,n){Object.defineProperty(e,t,{get:function(){return"RGB"===this.__state.space?this.__state[t]:(I.recalculateRGB(this,t,n),this.__state[t])},set:function(e){"RGB"!==this.__state.space&&(I.recalculateRGB(this,t,n),this.__state.space="RGB"),this.__state[t]=e}})}function o(e,t){Object.defineProperty(e,t,{get:function(){return"HSV"===this.__state.space?this.__state[t]:(I.recalculateHSV(this),this.__state[t])},set:function(e){"HSV"!==this.__state.space&&(I.recalculateHSV(this),this.__state.space="HSV"),this.__state[t]=e}})}function i(e){if("0"===e||S.isUndefined(e))return 0;var t=e.match(U);return S.isNull(t)?0:parseFloat(t[1])}function r(e){var t=e.toString();return t.indexOf(".")>-1?t.length-t.indexOf(".")-1:0}function s(e,t){var n=Math.pow(10,t);return Math.round(e*n)/n}function a(e,t,n,o,i){return o+(e-t)/(n-t)*(i-o)}function l(e,t,n,o){e.style.background="",S.each(ee,function(i){e.style.cssText+="background: "+i+"linear-gradient("+t+", "+n+" 0%, "+o+" 100%); "})}function d(e){e.style.background="",e.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",e.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}function c(e,t,n){var o=document.createElement("li");return t&&o.appendChild(t),n?e.__ul.insertBefore(o,n):e.__ul.appendChild(o),e.onResize(),o}function u(e){X.unbind(window,"resize",e.__resizeHandler),e.saveToLocalStorageIfPossible&&X.unbind(window,"unload",e.saveToLocalStorageIfPossible)}function _(e,t){var n=e.__preset_select[e.__preset_select.selectedIndex];n.innerHTML=t?n.value+"*":n.value}function h(e,t,n){if(n.__li=t,n.__gui=e,S.extend(n,{options:function(t){if(arguments.length>1){var o=n.__li.nextElementSibling;return n.remove(),f(e,n.object,n.property,{before:o,factoryArgs:[S.toArray(arguments)]})}if(S.isArray(t)||S.isObject(t)){var i=n.__li.nextElementSibling;return n.remove(),f(e,n.object,n.property,{before:i,factoryArgs:[t]})}},name:function(e){return n.__li.firstElementChild.firstElementChild.innerHTML=e,n},listen:function(){return n.__gui.listen(n),n},remove:function(){return n.__gui.remove(n),n}}),n instanceof q){var o=new Q(n.object,n.property,{min:n.__min,max:n.__max,step:n.__step});S.each(["updateDisplay","onChange","onFinishChange","step","min","max"],function(e){var t=n[e],i=o[e];n[e]=o[e]=function(){var e=Array.prototype.slice.call(arguments);return i.apply(o,e),t.apply(n,e)}}),X.addClass(t,"has-slider"),n.domElement.insertBefore(o.domElement,n.domElement.firstElementChild)}else if(n instanceof Q){var i=function(t){if(S.isNumber(n.__min)&&S.isNumber(n.__max)){var o=n.__li.firstElementChild.firstElementChild.innerHTML,i=n.__gui.__listening.indexOf(n)>-1;n.remove();var r=f(e,n.object,n.property,{before:n.__li.nextElementSibling,factoryArgs:[n.__min,n.__max,n.__step]});return r.name(o),i&&r.listen(),r}return t};n.min=S.compose(i,n.min),n.max=S.compose(i,n.max)}else n instanceof K?(X.bind(t,"click",function(){X.fakeEvent(n.__checkbox,"click")}),X.bind(n.__checkbox,"click",function(e){e.stopPropagation()})):n instanceof Z?(X.bind(t,"click",function(){X.fakeEvent(n.__button,"click")}),X.bind(t,"mouseover",function(){X.addClass(n.__button,"hover")}),X.bind(t,"mouseout",function(){X.removeClass(n.__button,"hover")})):n instanceof $&&(X.addClass(t,"color"),n.updateDisplay=S.compose(function(e){return t.style.borderLeftColor=n.__color.toString(),e},n.updateDisplay),n.updateDisplay());n.setValue=S.compose(function(t){return e.getRoot().__preset_select&&n.isModified()&&_(e.getRoot(),!0),t},n.setValue)}function p(e,t){var n=e.getRoot(),o=n.__rememberedObjects.indexOf(t.object);if(-1!==o){var i=n.__rememberedObjectIndecesToControllers[o];if(void 0===i&&(i={},n.__rememberedObjectIndecesToControllers[o]=i),i[t.property]=t,n.load&&n.load.remembered){var r=n.load.remembered,s=void 0;if(r[e.preset])s=r[e.preset];else{if(!r[se])return;s=r[se]}if(s[o]&&void 0!==s[o][t.property]){var a=s[o][t.property];t.initialValue=a,t.setValue(a)}}}}function f(e,t,n,o){if(void 0===t[n])throw new Error('Object "'+t+'" has no property "'+n+'"');var i=void 0;if(o.color)i=new $(t,n);else{var r=[t,n].concat(o.factoryArgs);i=ne.apply(e,r)}o.before instanceof z&&(o.before=o.before.__li),p(e,i),X.addClass(i.domElement,"c");var s=document.createElement("span");X.addClass(s,"property-name"),s.innerHTML=i.property;var a=document.createElement("div");a.appendChild(s),a.appendChild(i.domElement);var l=c(e,a,o.before);return X.addClass(l,he.CLASS_CONTROLLER_ROW),i instanceof $?X.addClass(l,"color"):X.addClass(l,H(i.getValue())),h(e,l,i),e.__controllers.push(i),i}function m(e,t){return document.location.href+"."+t}function g(e,t,n){var o=document.createElement("option");o.innerHTML=t,o.value=t,e.__preset_select.appendChild(o),n&&(e.__preset_select.selectedIndex=e.__preset_select.length-1)}function b(e,t){t.style.display=e.useLocalStorage?"block":"none"}function v(e){var t=e.__save_row=document.createElement("li");X.addClass(e.domElement,"has-save"),e.__ul.insertBefore(t,e.__ul.firstChild),X.addClass(t,"save-row");var n=document.createElement("span");n.innerHTML="&nbsp;",X.addClass(n,"button gears");var o=document.createElement("span");o.innerHTML="Save",X.addClass(o,"button"),X.addClass(o,"save");var i=document.createElement("span");i.innerHTML="New",X.addClass(i,"button"),X.addClass(i,"save-as");var r=document.createElement("span");r.innerHTML="Revert",X.addClass(r,"button"),X.addClass(r,"revert");var s=e.__preset_select=document.createElement("select");if(e.load&&e.load.remembered?S.each(e.load.remembered,function(t,n){g(e,n,n===e.preset)}):g(e,se,!1),X.bind(s,"change",function(){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].innerHTML=e.__preset_select[t].value;e.preset=this.value}),t.appendChild(s),t.appendChild(n),t.appendChild(o),t.appendChild(i),t.appendChild(r),ae){var a=document.getElementById("dg-local-explain"),l=document.getElementById("dg-local-storage");document.getElementById("dg-save-locally").style.display="block","true"===localStorage.getItem(m(e,"isLocal"))&&l.setAttribute("checked","checked"),b(e,a),X.bind(l,"change",function(){e.useLocalStorage=!e.useLocalStorage,b(e,a)})}var d=document.getElementById("dg-new-constructor");X.bind(d,"keydown",function(e){!e.metaKey||67!==e.which&&67!==e.keyCode||le.hide()}),X.bind(n,"click",function(){d.innerHTML=JSON.stringify(e.getSaveObject(),void 0,2),le.show(),d.focus(),d.select()}),X.bind(o,"click",function(){e.save()}),X.bind(i,"click",function(){var t=prompt("Enter a new preset name.");t&&e.saveAs(t)}),X.bind(r,"click",function(){e.revert()})}function y(e){function t(t){return t.preventDefault(),e.width+=i-t.clientX,e.onResize(),i=t.clientX,!1}function n(){X.removeClass(e.__closeButton,he.CLASS_DRAG),X.unbind(window,"mousemove",t),X.unbind(window,"mouseup",n)}function o(o){return o.preventDefault(),i=o.clientX,X.addClass(e.__closeButton,he.CLASS_DRAG),X.bind(window,"mousemove",t),X.bind(window,"mouseup",n),!1}var i=void 0;e.__resize_handle=document.createElement("div"),S.extend(e.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"}),X.bind(e.__resize_handle,"mousedown",o),X.bind(e.__closeButton,"mousedown",o),e.domElement.insertBefore(e.__resize_handle,e.domElement.firstElementChild)}function w(e,t){e.domElement.style.width=t+"px",e.__save_row&&e.autoPlace&&(e.__save_row.style.width=t+"px"),e.__closeButton&&(e.__closeButton.style.width=t+"px")}function x(e,t){var n={};return S.each(e.__rememberedObjects,function(o,i){var r={},s=e.__rememberedObjectIndecesToControllers[i];S.each(s,function(e,n){r[n]=t?e.initialValue:e.getValue()}),n[i]=r}),n}function E(e){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].value===e.preset&&(e.__preset_select.selectedIndex=t)}function C(e){0!==e.length&&oe.call(window,function(){C(e)}),S.each(e,function(e){e.updateDisplay()})}var A=Array.prototype.forEach,k=Array.prototype.slice,S={BREAK:{},extend:function(e){return this.each(k.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach(function(n){this.isUndefined(t[n])||(e[n]=t[n])}.bind(this))},this),e},defaults:function(e){return this.each(k.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach(function(n){this.isUndefined(e[n])&&(e[n]=t[n])}.bind(this))},this),e},compose:function(){var e=k.call(arguments);return function(){for(var t=k.call(arguments),n=e.length-1;n>=0;n--)t=[e[n].apply(this,t)];return t[0]}},each:function(e,t,n){if(e)if(A&&e.forEach&&e.forEach===A)e.forEach(t,n);else if(e.length===e.length+0){var o=void 0,i=void 0;for(o=0,i=e.length;o<i;o++)if(o in e&&t.call(n,e[o],o)===this.BREAK)return}else for(var r in e)if(t.call(n,e[r],r)===this.BREAK)return},defer:function(e){setTimeout(e,0)},debounce:function(e,t,n){var o=void 0;return function(){var i=this,r=arguments,s=n||!o;clearTimeout(o),o=setTimeout(function(){o=null,n||e.apply(i,r)},t),s&&e.apply(i,r)}},toArray:function(e){return e.toArray?e.toArray():k.call(e)},isUndefined:function(e){return void 0===e},isNull:function(e){return null===e},isNaN:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(e){return isNaN(e)}),isArray:Array.isArray||function(e){return e.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return!1===e||!0===e},isFunction:function(e){return e instanceof Function}},O=[{litmus:S.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:t},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:t},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:t},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:t}}},{litmus:S.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:S.isArray,conversions:{RGB_ARRAY:{read:function(e){return 3===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return 4===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:S.isObject,conversions:{RGBA_OBJ:{read:function(e){return!!(S.isNumber(e.r)&&S.isNumber(e.g)&&S.isNumber(e.b)&&S.isNumber(e.a))&&{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return!!(S.isNumber(e.r)&&S.isNumber(e.g)&&S.isNumber(e.b))&&{space:"RGB",r:e.r,g:e.g,b:e.b}},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return!!(S.isNumber(e.h)&&S.isNumber(e.s)&&S.isNumber(e.v)&&S.isNumber(e.a))&&{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return!!(S.isNumber(e.h)&&S.isNumber(e.s)&&S.isNumber(e.v))&&{space:"HSV",h:e.h,s:e.s,v:e.v}},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],T=void 0,L=void 0,R=function(){L=!1;var e=arguments.length>1?S.toArray(arguments):arguments[0];return S.each(O,function(t){if(t.litmus(e))return S.each(t.conversions,function(t,n){if(T=t.read(e),!1===L&&!1!==T)return L=T,T.conversionName=n,T.conversion=t,S.BREAK}),S.BREAK}),L},B=void 0,N={hsv_to_rgb:function(e,t,n){var o=Math.floor(e/60)%6,i=e/60-Math.floor(e/60),r=n*(1-t),s=n*(1-i*t),a=n*(1-(1-i)*t),l=[[n,a,r],[s,n,r],[r,n,a],[r,s,n],[a,r,n],[n,r,s]][o];return{r:255*l[0],g:255*l[1],b:255*l[2]}},rgb_to_hsv:function(e,t,n){var o=Math.min(e,t,n),i=Math.max(e,t,n),r=i-o,s=void 0,a=void 0;return 0===i?{h:NaN,s:0,v:0}:(a=r/i,s=e===i?(t-n)/r:t===i?2+(n-e)/r:4+(e-t)/r,(s/=6)<0&&(s+=1),{h:360*s,s:a,v:i/255})},rgb_to_hex:function(e,t,n){var o=this.hex_with_component(0,2,e);return o=this.hex_with_component(o,1,t),o=this.hex_with_component(o,0,n)},component_from_hex:function(e,t){return e>>8*t&255},hex_with_component:function(e,t,n){return n<<(B=8*t)|e&~(255<<B)}},H="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},F=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},P=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),D=function e(t,n,o){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var r=Object.getPrototypeOf(t);return null===r?void 0:e(r,n,o)}if("value"in i)return i.value;var s=i.get;if(void 0!==s)return s.call(o)},j=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)},V=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},I=function(){function e(){if(F(this,e),this.__state=R.apply(this,arguments),!1===this.__state)throw new Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return P(e,[{key:"toString",value:function(){return t(this)}},{key:"toHexString",value:function(){return t(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),e}();I.recalculateRGB=function(e,t,n){if("HEX"===e.__state.space)e.__state[t]=N.component_from_hex(e.__state.hex,n);else{if("HSV"!==e.__state.space)throw new Error("Corrupted color state");S.extend(e.__state,N.hsv_to_rgb(e.__state.h,e.__state.s,e.__state.v))}},I.recalculateHSV=function(e){var t=N.rgb_to_hsv(e.r,e.g,e.b);S.extend(e.__state,{s:t.s,v:t.v}),S.isNaN(t.h)?S.isUndefined(e.__state.h)&&(e.__state.h=0):e.__state.h=t.h},I.COMPONENTS=["r","g","b","h","s","v","hex","a"],n(I.prototype,"r",2),n(I.prototype,"g",1),n(I.prototype,"b",0),o(I.prototype,"h"),o(I.prototype,"s"),o(I.prototype,"v"),Object.defineProperty(I.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}}),Object.defineProperty(I.prototype,"hex",{get:function(){return"HEX"!==this.__state.space&&(this.__state.hex=N.rgb_to_hex(this.r,this.g,this.b),this.__state.space="HEX"),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var z=function(){function e(t,n){F(this,e),this.initialValue=t[n],this.domElement=document.createElement("div"),this.object=t,this.property=n,this.__onChange=void 0,this.__onFinishChange=void 0}return P(e,[{key:"onChange",value:function(e){return this.__onChange=e,this}},{key:"onFinishChange",value:function(e){return this.__onFinishChange=e,this}},{key:"setValue",value:function(e){return this.object[this.property]=e,this.__onChange&&this.__onChange.call(this,e),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),e}(),M={HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},G={};S.each(M,function(e,t){S.each(e,function(e){G[e]=t})});var U=/(\d+(\.\d+)?)px/,X={makeSelectable:function(e,t){void 0!==e&&void 0!==e.style&&(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,n){var o=n,i=t;S.isUndefined(i)&&(i=!0),S.isUndefined(o)&&(o=!0),e.style.position="absolute",i&&(e.style.left=0,e.style.right=0),o&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,n,o){var i=n||{},r=G[t];if(!r)throw new Error("Event type "+t+" not supported.");var s=document.createEvent(r);switch(r){case"MouseEvents":var a=i.x||i.clientX||0,l=i.y||i.clientY||0;s.initMouseEvent(t,i.bubbles||!1,i.cancelable||!0,window,i.clickCount||1,0,0,a,l,!1,!1,!1,!1,0,null);break;case"KeyboardEvents":var d=s.initKeyboardEvent||s.initKeyEvent;S.defaults(i,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),d(t,i.bubbles||!1,i.cancelable,window,i.ctrlKey,i.altKey,i.shiftKey,i.metaKey,i.keyCode,i.charCode);break;default:s.initEvent(t,i.bubbles||!1,i.cancelable||!0)}S.defaults(s,o),e.dispatchEvent(s)},bind:function(e,t,n,o){var i=o||!1;return e.addEventListener?e.addEventListener(t,n,i):e.attachEvent&&e.attachEvent("on"+t,n),X},unbind:function(e,t,n,o){var i=o||!1;return e.removeEventListener?e.removeEventListener(t,n,i):e.detachEvent&&e.detachEvent("on"+t,n),X},addClass:function(e,t){if(void 0===e.className)e.className=t;else if(e.className!==t){var n=e.className.split(/ +/);-1===n.indexOf(t)&&(n.push(t),e.className=n.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return X},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var n=e.className.split(/ +/),o=n.indexOf(t);-1!==o&&(n.splice(o,1),e.className=n.join(" "))}else e.className=void 0;return X},hasClass:function(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return i(t["border-left-width"])+i(t["border-right-width"])+i(t["padding-left"])+i(t["padding-right"])+i(t.width)},getHeight:function(e){var t=getComputedStyle(e);return i(t["border-top-width"])+i(t["border-bottom-width"])+i(t["padding-top"])+i(t["padding-bottom"])+i(t.height)},getOffset:function(e){var t=e,n={left:0,top:0};if(t.offsetParent)do{n.left+=t.offsetLeft,n.top+=t.offsetTop,t=t.offsetParent}while(t);return n},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},K=function(e){function t(e,n){F(this,t);var o=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),i=o;return o.__prev=o.getValue(),o.__checkbox=document.createElement("input"),o.__checkbox.setAttribute("type","checkbox"),X.bind(o.__checkbox,"change",function(){i.setValue(!i.__prev)},!1),o.domElement.appendChild(o.__checkbox),o.updateDisplay(),o}return j(t,z),P(t,[{key:"setValue",value:function(e){var n=D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),n}},{key:"updateDisplay",value:function(){return!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),Y=function(e){function t(e,n,o){F(this,t);var i=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=o,s=i;if(i.__select=document.createElement("select"),S.isArray(r)){var a={};S.each(r,function(e){a[e]=e}),r=a}return S.each(r,function(e,t){var n=document.createElement("option");n.innerHTML=t,n.setAttribute("value",e),s.__select.appendChild(n)}),i.updateDisplay(),X.bind(i.__select,"change",function(){var e=this.options[this.selectedIndex].value;s.setValue(e)}),i.domElement.appendChild(i.__select),i}return j(t,z),P(t,[{key:"setValue",value:function(e){var n=D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),n}},{key:"updateDisplay",value:function(){return X.isActive(this.__select)?this:(this.__select.value=this.getValue(),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this))}}]),t}(),J=function(e){function t(e,n){function o(){r.setValue(r.__input.value)}F(this,t);var i=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=i;return i.__input=document.createElement("input"),i.__input.setAttribute("type","text"),X.bind(i.__input,"keyup",o),X.bind(i.__input,"change",o),X.bind(i.__input,"blur",function(){r.__onFinishChange&&r.__onFinishChange.call(r,r.getValue())}),X.bind(i.__input,"keydown",function(e){13===e.keyCode&&this.blur()}),i.updateDisplay(),i.domElement.appendChild(i.__input),i}return j(t,z),P(t,[{key:"updateDisplay",value:function(){return X.isActive(this.__input)||(this.__input.value=this.getValue()),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),W=function(e){function t(e,n,o){F(this,t);var i=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),s=o||{};return i.__min=s.min,i.__max=s.max,i.__step=s.step,S.isUndefined(i.__step)?0===i.initialValue?i.__impliedStep=1:i.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(i.initialValue))/Math.LN10))/10:i.__impliedStep=i.__step,i.__precision=r(i.__impliedStep),i}return j(t,z),P(t,[{key:"setValue",value:function(e){var n=e;return void 0!==this.__min&&n<this.__min?n=this.__min:void 0!==this.__max&&n>this.__max&&(n=this.__max),void 0!==this.__step&&n%this.__step!=0&&(n=Math.round(n/this.__step)*this.__step),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,n)}},{key:"min",value:function(e){return this.__min=e,this}},{key:"max",value:function(e){return this.__max=e,this}},{key:"step",value:function(e){return this.__step=e,this.__impliedStep=e,this.__precision=r(e),this}}]),t}(),Q=function(e){function t(e,n,o){function i(){l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}function r(e){var t=d-e.clientY;l.setValue(l.getValue()+t*l.__impliedStep),d=e.clientY}function s(){X.unbind(window,"mousemove",r),X.unbind(window,"mouseup",s),i()}F(this,t);var a=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n,o));a.__truncationSuspended=!1;var l=a,d=void 0;return a.__input=document.createElement("input"),a.__input.setAttribute("type","text"),X.bind(a.__input,"change",function(){var e=parseFloat(l.__input.value);S.isNaN(e)||l.setValue(e)}),X.bind(a.__input,"blur",function(){i()}),X.bind(a.__input,"mousedown",function(e){X.bind(window,"mousemove",r),X.bind(window,"mouseup",s),d=e.clientY}),X.bind(a.__input,"keydown",function(e){13===e.keyCode&&(l.__truncationSuspended=!0,this.blur(),l.__truncationSuspended=!1,i())}),a.updateDisplay(),a.domElement.appendChild(a.__input),a}return j(t,W),P(t,[{key:"updateDisplay",value:function(){return this.__input.value=this.__truncationSuspended?this.getValue():s(this.getValue(),this.__precision),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),q=function(e){function t(e,n,o,i,r){function s(e){e.preventDefault();var t=_.__background.getBoundingClientRect();return _.setValue(a(e.clientX,t.left,t.right,_.__min,_.__max)),!1}function l(){X.unbind(window,"mousemove",s),X.unbind(window,"mouseup",l),_.__onFinishChange&&_.__onFinishChange.call(_,_.getValue())}function d(e){var t=e.touches[0].clientX,n=_.__background.getBoundingClientRect();_.setValue(a(t,n.left,n.right,_.__min,_.__max))}function c(){X.unbind(window,"touchmove",d),X.unbind(window,"touchend",c),_.__onFinishChange&&_.__onFinishChange.call(_,_.getValue())}F(this,t);var u=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n,{min:o,max:i,step:r})),_=u;return u.__background=document.createElement("div"),u.__foreground=document.createElement("div"),X.bind(u.__background,"mousedown",function(e){document.activeElement.blur(),X.bind(window,"mousemove",s),X.bind(window,"mouseup",l),s(e)}),X.bind(u.__background,"touchstart",function(e){1===e.touches.length&&(X.bind(window,"touchmove",d),X.bind(window,"touchend",c),d(e))}),X.addClass(u.__background,"slider"),X.addClass(u.__foreground,"slider-fg"),u.updateDisplay(),u.__background.appendChild(u.__foreground),u.domElement.appendChild(u.__background),u}return j(t,W),P(t,[{key:"updateDisplay",value:function(){var e=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=100*e+"%",D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),Z=function(e){function t(e,n,o){F(this,t);var i=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=i;return i.__button=document.createElement("div"),i.__button.innerHTML=void 0===o?"Fire":o,X.bind(i.__button,"click",function(e){return e.preventDefault(),r.fire(),!1}),X.addClass(i.__button,"button"),i.domElement.appendChild(i.__button),i}return j(t,z),P(t,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),t}(),$=function(e){function t(e,n){function o(e){u(e),X.bind(window,"mousemove",u),X.bind(window,"touchmove",u),X.bind(window,"mouseup",r),X.bind(window,"touchend",r)}function i(e){_(e),X.bind(window,"mousemove",_),X.bind(window,"touchmove",_),X.bind(window,"mouseup",s),X.bind(window,"touchend",s)}function r(){X.unbind(window,"mousemove",u),X.unbind(window,"touchmove",u),X.unbind(window,"mouseup",r),X.unbind(window,"touchend",r),c()}function s(){X.unbind(window,"mousemove",_),X.unbind(window,"touchmove",_),X.unbind(window,"mouseup",s),X.unbind(window,"touchend",s),c()}function a(){var e=R(this.value);!1!==e?(p.__color.__state=e,p.setValue(p.__color.toOriginal())):this.value=p.__color.toString()}function c(){p.__onFinishChange&&p.__onFinishChange.call(p,p.__color.toOriginal())}function u(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=p.__saturation_field.getBoundingClientRect(),n=e.touches&&e.touches[0]||e,o=n.clientX,i=n.clientY,r=(o-t.left)/(t.right-t.left),s=1-(i-t.top)/(t.bottom-t.top);return s>1?s=1:s<0&&(s=0),r>1?r=1:r<0&&(r=0),p.__color.v=s,p.__color.s=r,p.setValue(p.__color.toOriginal()),!1}function _(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=p.__hue_field.getBoundingClientRect(),n=1-((e.touches&&e.touches[0]||e).clientY-t.top)/(t.bottom-t.top);return n>1?n=1:n<0&&(n=0),p.__color.h=360*n,p.setValue(p.__color.toOriginal()),!1}F(this,t);var h=V(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n));h.__color=new I(h.getValue()),h.__temp=new I(0);var p=h;h.domElement=document.createElement("div"),X.makeSelectable(h.domElement,!1),h.__selector=document.createElement("div"),h.__selector.className="selector",h.__saturation_field=document.createElement("div"),h.__saturation_field.className="saturation-field",h.__field_knob=document.createElement("div"),h.__field_knob.className="field-knob",h.__field_knob_border="2px solid ",h.__hue_knob=document.createElement("div"),h.__hue_knob.className="hue-knob",h.__hue_field=document.createElement("div"),h.__hue_field.className="hue-field",h.__input=document.createElement("input"),h.__input.type="text",h.__input_textShadow="0 1px 1px ",X.bind(h.__input,"keydown",function(e){13===e.keyCode&&a.call(this)}),X.bind(h.__input,"blur",a),X.bind(h.__selector,"mousedown",function(){X.addClass(this,"drag").bind(window,"mouseup",function(){X.removeClass(p.__selector,"drag")})}),X.bind(h.__selector,"touchstart",function(){X.addClass(this,"drag").bind(window,"touchend",function(){X.removeClass(p.__selector,"drag")})});var f=document.createElement("div");return S.extend(h.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),S.extend(h.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:h.__field_knob_border+(h.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),S.extend(h.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),S.extend(h.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),S.extend(f.style,{width:"100%",height:"100%",background:"none"}),l(f,"top","rgba(0,0,0,0)","#000"),S.extend(h.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),d(h.__hue_field),S.extend(h.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:h.__input_textShadow+"rgba(0,0,0,0.7)"}),X.bind(h.__saturation_field,"mousedown",o),X.bind(h.__saturation_field,"touchstart",o),X.bind(h.__field_knob,"mousedown",o),X.bind(h.__field_knob,"touchstart",o),X.bind(h.__hue_field,"mousedown",i),X.bind(h.__hue_field,"touchstart",i),h.__saturation_field.appendChild(f),h.__selector.appendChild(h.__field_knob),h.__selector.appendChild(h.__saturation_field),h.__selector.appendChild(h.__hue_field),h.__hue_field.appendChild(h.__hue_knob),h.domElement.appendChild(h.__input),h.domElement.appendChild(h.__selector),h.updateDisplay(),h}return j(t,z),P(t,[{key:"updateDisplay",value:function(){var e=R(this.getValue());if(!1!==e){var t=!1;S.each(I.COMPONENTS,function(n){if(!S.isUndefined(e[n])&&!S.isUndefined(this.__color.__state[n])&&e[n]!==this.__color.__state[n])return t=!0,{}},this),t&&S.extend(this.__color.__state,e)}S.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var n=this.__color.v<.5||this.__color.s>.5?255:0,o=255-n;S.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+n+","+n+","+n+")"}),this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px",this.__temp.s=1,this.__temp.v=1,l(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),S.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+n+","+n+","+n+")",textShadow:this.__input_textShadow+"rgba("+o+","+o+","+o+",.7)"})}}]),t}(),ee=["-moz-","-o-","-webkit-","-ms-",""],te={load:function(e,t){var n=t||document,o=n.createElement("link");o.type="text/css",o.rel="stylesheet",o.href=e,n.getElementsByTagName("head")[0].appendChild(o)},inject:function(e,t){var n=t||document,o=document.createElement("style");o.type="text/css",o.innerHTML=e;var i=n.getElementsByTagName("head")[0];try{i.appendChild(o)}catch(e){}}},ne=function(e,t){var n=e[t];return S.isArray(arguments[2])||S.isObject(arguments[2])?new Y(e,t,arguments[2]):S.isNumber(n)?S.isNumber(arguments[2])&&S.isNumber(arguments[3])?S.isNumber(arguments[4])?new q(e,t,arguments[2],arguments[3],arguments[4]):new q(e,t,arguments[2],arguments[3]):S.isNumber(arguments[4])?new Q(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new Q(e,t,{min:arguments[2],max:arguments[3]}):S.isString(n)?new J(e,t):S.isFunction(n)?new Z(e,t,""):S.isBoolean(n)?new K(e,t):null},oe=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){setTimeout(e,1e3/60)},ie=function(){function e(){F(this,e),this.backgroundElement=document.createElement("div"),S.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),X.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),S.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var t=this;X.bind(this.backgroundElement,"click",function(){t.hide()})}return P(e,[{key:"show",value:function(){var e=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),S.defer(function(){e.backgroundElement.style.opacity=1,e.domElement.style.opacity=1,e.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var e=this,t=function t(){e.domElement.style.display="none",e.backgroundElement.style.display="none",X.unbind(e.domElement,"webkitTransitionEnd",t),X.unbind(e.domElement,"transitionend",t),X.unbind(e.domElement,"oTransitionEnd",t)};X.bind(this.domElement,"webkitTransitionEnd",t),X.bind(this.domElement,"transitionend",t),X.bind(this.domElement,"oTransitionEnd",t),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-X.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-X.getHeight(this.domElement)/2+"px"}}]),e}(),re=function(e){if(e&&"undefined"!=typeof window){var t=document.createElement("style");return t.setAttribute("type","text/css"),t.innerHTML=e,document.head.appendChild(t),e}}(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");te.inject(re);var se="Default",ae=function(){try{return!!window.localStorage}catch(e){return!1}}(),le=void 0,de=!0,ce=void 0,ue=!1,_e=[],he=function e(t){var n=this,o=t||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),X.addClass(this.domElement,"dg"),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],o=S.defaults(o,{closeOnTop:!1,autoPlace:!0,width:e.DEFAULT_WIDTH}),o=S.defaults(o,{resizable:o.autoPlace,hideable:o.autoPlace}),S.isUndefined(o.load)?o.load={preset:se}:o.preset&&(o.load.preset=o.preset),S.isUndefined(o.parent)&&o.hideable&&_e.push(this),o.resizable=S.isUndefined(o.parent)&&o.resizable,o.autoPlace&&S.isUndefined(o.scrollable)&&(o.scrollable=!0);var i=ae&&"true"===localStorage.getItem(m(this,"isLocal")),r=void 0,s=void 0;if(Object.defineProperties(this,{parent:{get:function(){return o.parent}},scrollable:{get:function(){return o.scrollable}},autoPlace:{get:function(){return o.autoPlace}},closeOnTop:{get:function(){return o.closeOnTop}},preset:{get:function(){return n.parent?n.getRoot().preset:o.load.preset},set:function(e){n.parent?n.getRoot().preset=e:o.load.preset=e,E(this),n.revert()}},width:{get:function(){return o.width},set:function(e){o.width=e,w(n,e)}},name:{get:function(){return o.name},set:function(e){o.name=e,s&&(s.innerHTML=o.name)}},closed:{get:function(){return o.closed},set:function(t){o.closed=t,o.closed?X.addClass(n.__ul,e.CLASS_CLOSED):X.removeClass(n.__ul,e.CLASS_CLOSED),this.onResize(),n.__closeButton&&(n.__closeButton.innerHTML=t?e.TEXT_OPEN:e.TEXT_CLOSED)}},load:{get:function(){return o.load}},useLocalStorage:{get:function(){return i},set:function(e){ae&&(i=e,e?X.bind(window,"unload",r):X.unbind(window,"unload",r),localStorage.setItem(m(n,"isLocal"),e))}}}),S.isUndefined(o.parent)){if(this.closed=o.closed||!1,X.addClass(this.domElement,e.CLASS_MAIN),X.makeSelectable(this.domElement,!1),ae&&i){n.useLocalStorage=!0;var a=localStorage.getItem(m(this,"gui"));a&&(o.load=JSON.parse(a))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=e.TEXT_CLOSED,X.addClass(this.__closeButton,e.CLASS_CLOSE_BUTTON),o.closeOnTop?(X.addClass(this.__closeButton,e.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(X.addClass(this.__closeButton,e.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),X.bind(this.__closeButton,"click",function(){n.closed=!n.closed})}else{void 0===o.closed&&(o.closed=!0);var l=document.createTextNode(o.name);X.addClass(l,"controller-name"),s=c(n,l);X.addClass(this.__ul,e.CLASS_CLOSED),X.addClass(s,"title"),X.bind(s,"click",function(e){return e.preventDefault(),n.closed=!n.closed,!1}),o.closed||(this.closed=!1)}o.autoPlace&&(S.isUndefined(o.parent)&&(de&&(ce=document.createElement("div"),X.addClass(ce,"dg"),X.addClass(ce,e.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(ce),de=!1),ce.appendChild(this.domElement),X.addClass(this.domElement,e.CLASS_AUTO_PLACE)),this.parent||w(n,o.width)),this.__resizeHandler=function(){n.onResizeDebounced()},X.bind(window,"resize",this.__resizeHandler),X.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),X.bind(this.__ul,"transitionend",this.__resizeHandler),X.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),o.resizable&&y(this),r=function(){ae&&"true"===localStorage.getItem(m(n,"isLocal"))&&localStorage.setItem(m(n,"gui"),JSON.stringify(n.getSaveObject()))},this.saveToLocalStorageIfPossible=r,o.parent||function(){var e=n.getRoot();e.width+=1,S.defer(function(){e.width-=1})}()};he.toggleHide=function(){ue=!ue,S.each(_e,function(e){e.domElement.style.display=ue?"none":""})},he.CLASS_AUTO_PLACE="a",he.CLASS_AUTO_PLACE_CONTAINER="ac",he.CLASS_MAIN="main",he.CLASS_CONTROLLER_ROW="cr",he.CLASS_TOO_TALL="taller-than-window",he.CLASS_CLOSED="closed",he.CLASS_CLOSE_BUTTON="close-button",he.CLASS_CLOSE_TOP="close-top",he.CLASS_CLOSE_BOTTOM="close-bottom",he.CLASS_DRAG="drag",he.DEFAULT_WIDTH=245,he.TEXT_CLOSED="Close Controls",he.TEXT_OPEN="Open Controls",he._keydownHandler=function(e){"text"===document.activeElement.type||72!==e.which&&72!==e.keyCode||he.toggleHide()},X.bind(window,"keydown",he._keydownHandler,!1),S.extend(he.prototype,{add:function(e,t){return f(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return f(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;S.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&ce.removeChild(this.domElement);var e=this;S.each(this.__folders,function(t){e.removeFolder(t)}),X.unbind(window,"keydown",he._keydownHandler,!1),u(this)},addFolder:function(e){if(void 0!==this.__folders[e])throw new Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var n=new he(t);this.__folders[e]=n;var o=c(this,n.domElement);return X.addClass(o,"folder"),n},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],u(e);var t=this;S.each(e.__folders,function(t){e.removeFolder(t)}),S.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},hide:function(){this.domElement.style.display="none"},show:function(){this.domElement.style.display=""},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=X.getOffset(e.__ul).top,n=0;S.each(e.__ul.childNodes,function(t){e.autoPlace&&t===e.__save_row||(n+=X.getHeight(t))}),window.innerHeight-t-20<n?(X.addClass(e.domElement,he.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-20+"px"):(X.removeClass(e.domElement,he.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&S.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:S.debounce(function(){this.onResize()},50),remember:function(){if(S.isUndefined(le)&&((le=new ie).domElement.innerHTML='<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>'),this.parent)throw new Error("You can only call remember on a top level GUI.");var e=this;S.each(Array.prototype.slice.call(arguments),function(t){0===e.__rememberedObjects.length&&v(e),-1===e.__rememberedObjects.indexOf(t)&&e.__rememberedObjects.push(t)}),this.autoPlace&&w(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=x(this)),e.folders={},S.each(this.__folders,function(t,n){e.folders[n]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=x(this),_(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[se]=x(this,!0)),this.load.remembered[e]=x(this),this.preset=e,g(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){S.each(this.__controllers,function(t){this.getRoot().load.remembered?p(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),S.each(this.__folders,function(e){e.revert(e)}),e||_(this.getRoot(),!1)},listen:function(e){var t=0===this.__listening.length;this.__listening.push(e),t&&C(this.__listening)},updateDisplay:function(){S.each(this.__controllers,function(e){e.updateDisplay()}),S.each(this.__folders,function(e){e.updateDisplay()})}});var pe={Color:I,math:N,interpret:R},fe={Controller:z,BooleanController:K,OptionController:Y,StringController:J,NumberController:W,NumberControllerBox:Q,NumberControllerSlider:q,FunctionController:Z,ColorController:$},me={dom:X},ge={GUI:he},be=he,ve={color:pe,controllers:fe,dom:me,gui:ge,GUI:be};e.color=pe,e.controllers=fe,e.dom=me,e.gui=ge,e.GUI=be,e.default=ve,Object.defineProperty(e,"__esModule",{value:!0})});


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = "/*\n*\tMatterTools.Gui\n*/\n\nbody .dg .c,\nbody .dg .cr.function,\nbody .dg .c select,\nbody .dg .property-name,\nbody .dg .title {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\nbody .dg.main {\n  z-index: 10;\n  box-shadow:\n    0 0px 1.6px rgba(0, 0, 0, 0.025),\n    0 0px 3.9px rgba(0, 0, 0, 0.036),\n    0 0px 7.4px rgba(0, 0, 0, 0.045),\n    0 0px 13.2px rgba(0, 0, 0, 0.054),\n    0 0px 24.7px rgba(0, 0, 0, 0.065),\n    0 0px 60px rgba(0, 0, 0, 0.09)\n  ;\n  height: 100%;\n  background: #14151f;\n  position: fixed;\n  top: 0;\n  right: 0;\n  padding: 48px 0 0 0;\n}\n\nbody .dg.main,\nbody .dg.main * {\n  box-sizing: border-box;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n} \n\nbody .dg.ac {\n  position: static;\n  top: inherit;\n  left: inherit;\n  bottom: inherit;\n  right: inherit;\n}\n\nbody .dg.main {\n  transform: translate(230px, 0);\n  transition: transform ease;\n  transition-delay: 2000ms;\n  transition-duration: 300ms;\n}\n\nbody .dg.main:hover {\n  transform: translate(0, 0);\n  transition-delay: 0ms;\n  transition-duration: 400ms;\n}\n\n@media only screen and (min-width : 1300px) {\n  body .dg.main,\n  body .dg.main:hover {\n    transition-delay: 0;\n    transform: translate(0, 0);\n  }\n}\n\nbody .dg.main .close-button {\n  display: none;\n}\n\nbody .dg.main > ul {\n  height: 100%;\n  overflow-y: auto;\n  scrollbar-color: #0d0f1b #0d0f1b;\n  scrollbar-width: thin;\n}\n\nbody .dg.main > ul:hover {\n  scrollbar-color: #44444e #0d0f1b;\n  scrollbar-width: thin;\n}\n\nbody .dg.main > ul::-webkit-scrollbar {\n  background: #0d0f1b;\n  width: 6px;\n  height: 6px;\n}\n\nbody .dg.main > ul::-webkit-scrollbar-track,\nbody .dg.main > ul::-webkit-scrollbar-corner {\n  background: #0d0f1b;\n}\n  \nbody .dg.main > ul::-webkit-scrollbar-thumb {\n  background: #0d0f1b;\n  border-radius: 3px;\n}\n\nbody .dg.main > ul:hover::-webkit-scrollbar-thumb {\n  background: #44444e;\n}\n \nbody .dg {\n  color: #6d6d7d;\n  text-shadow: none !important;\n  font-size: 12px;\n}\n\nbody .dg .closed .cr {\n  display: none;\n}\n\nbody .dg li:not(.folder) {\n  height: 29px;\n  background: #1c1c25;\n  border-bottom: 0px;\n  padding: 0 8px 0 12px;\n}\n \nbody .dg li.save-row .button {\n  text-shadow: none !important;\n}\n\nbody .dg li.title {\n  padding: 2px 0 0 24px;\n  color: #6a6977;\n  background: #0d0f1b url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) no-repeat;\n  background-position: 12px;\n}\n\nbody .dg li.title:hover {\n  color: #9494a2;\n}\n\nbody .dg .cr.boolean:hover {\n  background: #20212b;\n}\n\nbody .dg .cr.function {\n  background: #262731;\n  color: #636371;\n  border-top: 1px solid #30313c;\n}\n\nbody .dg .cr.function:hover {\n  background: #30313e;\n}\n\nbody .dg .cr.function:active {\n  background: #2d2e3a;\n}\n\nbody .dg .cr.function:active .property-name {\n  -webkit-transform: translateY(1px);\n      -ms-transform: translateY(1px);\n          transform: translateY(1px);\n}\n\nbody .dg .c,\nbody .dg .property-name {\n  width: 50%;\n}\n\nbody .dg .c select {\n  margin-top: 2px;\n  margin-left: -5px;\n  padding: 3px 5px;\n}\n\nbody .dg .c select,\nbody .dg .c input[type=text],\nbody .dg .cr.number input[type=text] {\n  text-align: right;\n  background: transparent;\n  color: #686c7b;\n  border: 0;\n  border-radius: 2px;\n  overflow: hidden;\n  font-size: 11px;\n}\n\nbody .dg .cr.number,\nbody .dg .cr.boolean,\nbody .dg .cr.function {\n  border-left: 0;\n}\n\nbody .dg .c select,\nbody .dg .c select:focus {\n  width: 88px;\n  outline: 0;\n}\n\nbody .dg .c input[type=text]:hover {\n  background: #2b2c3a;\n}\n \nbody .dg .c input[type=text]:focus {\n  background: #1e1f29;\n  color: #fff;\n}\n\nbody .dg .c input[type=checkbox] {\n  margin-top: 10px;\n  border: none;\n  border-radius: 50%;\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  background: #35363e;\n  display: block;\n  width: 7px;\n  height: 7px;\n  float: right;\n}\n\nbody .dg .c input[type=checkbox]:checked {\n  background: #747784;\n}\n\nbody .dg .c input[type=checkbox]:focus {\n  outline: none;\n}\n \nbody .dg .c .slider {\n  background: #23232d;\n  border-radius: 2px;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  padding: 0;\n  overflow: hidden;\n}\n\nbody .dg .c .slider:hover {\n  background: #282b3a;\n}\n\nbody .dg .c .slider-fg {\n  background: #3f4354;\n  border-radius: 0;\n  margin-left: 0;\n  padding-right: 0;\n}\n\nbody .dg .c .slider-fg:after {\n  display: none;\n}\n\nbody .dg .c .slider:hover .slider-fg {\n  background: #4d526b;\n}\n\nbody .dg li.folder {\n  border-left: 0;\n}\n\nbody .dg.a {\n  margin-right: 0;\n}";

/***/ })
/******/ ]);
});