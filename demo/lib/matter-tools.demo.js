/*!
 * matter-tools 0.9.1 by Liam Brummitt 2017-01-26
 * https://github.com/liabru/matter-tools
 * License MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Matter"), require("MatterTools"));
	else if(typeof define === 'function' && define.amd)
		define(["Matter", "MatterTools"], factory);
	else if(typeof exports === 'object')
		exports["Demo"] = factory(require("Matter"), require("MatterTools"));
	else
		root["MatterTools"] = root["MatterTools"] || {}, root["MatterTools"]["Demo"] = factory(root["Matter"], root["MatterTools"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/demo/lib";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * A tool for for running and testing example scenes.
	 * @module Demo
	 */

	var Matter = __webpack_require__(1);
	var Common = Matter.Common;
	var Demo = module.exports = {};
	var Gui = __webpack_require__(2).Gui;
	var Inspector = __webpack_require__(2).Inspector;
	var ToolsCommon = __webpack_require__(3);

	Demo._isIOS = window.navigator && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	Demo._matterLink = 'http://brm.io/matter-js/';

	/**
	 * Creates a new demo instance.
	 * See example for options and usage.
	 * @function Demo.create
	 * @param {} options
	 */
	Demo.create = function (options) {
	  var demo = Object.assign({
	    example: {
	      instance: null
	    },
	    examples: [],
	    resetOnOrientation: false,
	    preventZoom: false,
	    inline: false,
	    toolbar: {
	      title: null,
	      url: null,
	      reset: true,
	      source: false,
	      inspector: false,
	      tools: false,
	      fullscreen: true,
	      exampleSelect: false
	    },
	    tools: {
	      inspector: null,
	      gui: null
	    },
	    dom: {}
	  }, options || {});

	  if (demo.examples.length > 1 && options.toolbar.exampleSelect !== false) {
	    demo.toolbar.exampleSelect = true;
	  }

	  if (Demo._isIOS) {
	    demo.toolbar.fullscreen = false;
	  }

	  if (!Gui) {
	    demo.toolbar.tools = false;
	    demo.tools.gui = false;
	  }

	  if (!Inspector) {
	    demo.toolbar.inspector = false;
	    demo.tools.inspector = false;
	  }

	  demo.dom = Demo._createDom(demo);
	  Demo._bindDom(demo);

	  if (options.inline) {
	    demo.dom.root.classList.add('matter-demo-inline');
	  }

	  return demo;
	};

	/**
	 * Starts a new demo instance by running the first or given example.
	 * See example for options and usage.
	 * @function Demo.start
	 * @param {demo} demo
	 * @param {string} [initalExampleId] example to start (defaults to first)
	 */
	Demo.start = function (demo, initalExampleId) {
	  initalExampleId = initalExampleId || demo.examples[0].id;

	  if (window.location.hash.length > 0) {
	    initalExampleId = window.location.hash.slice(1);
	  }

	  Demo.setExampleById(demo, initalExampleId);
	};

	/**
	 * Stops the currently running example in the demo.
	 * This requires that the `example.init` function returned 
	 * an object specifiying a `stop` function.
	 * @function Demo.stop
	 * @param {demo} demo
	 */
	Demo.stop = function (demo) {
	  if (demo.example && demo.example.instance) {
	    demo.example.instance.stop();
	  }
	};

	/**
	 * Stops and restarts the currently running example.
	 * @function Demo.reset
	 * @param {demo} demo
	 */
	Demo.reset = function (demo) {
	  Common._nextId = 0;
	  Common._seed = 0;

	  Demo.setExample(demo, demo.example);
	};

	/**
	 * Starts the given example by its id. 
	 * Any running example will be stopped.
	 * @function Demo.setExampleById
	 * @param {demo} demo
	 * @param {string} exampleId 
	 */
	Demo.setExampleById = function (demo, exampleId) {
	  var example = demo.examples.filter(function (example) {
	    return example.id === exampleId;
	  })[0];

	  Demo.setExample(demo, example);
	};

	/**
	 * Starts the given example.
	 * Any running example will be stopped.
	 * @function Demo.setExample
	 * @param {demo} demo
	 * @param {example} example 
	 */
	Demo.setExample = function (demo, example) {
	  if (example) {
	    var instance = demo.example.instance;

	    if (instance) {
	      instance.stop();

	      if (instance.canvas) {
	        instance.canvas.parentElement.removeChild(instance.canvas);
	      }
	    }

	    window.location.hash = example.id;

	    demo.example.instance = null;
	    demo.example = example;

	    demo.example.instance = instance = example.init(demo);

	    if (!instance.canvas && instance.render) {
	      instance.canvas = instance.render.canvas;
	    }

	    if (instance.canvas) {
	      demo.dom.header.style.maxWidth = instance.canvas.width + 'px';
	      demo.dom.root.appendChild(instance.canvas);
	    }

	    demo.dom.exampleSelect.value = example.id;
	    demo.dom.buttonSource.href = example.sourceLink || demo.url || '#';

	    setTimeout(function () {
	      if (demo.tools.inspector) {
	        Demo.setInspector(demo, true);
	      }

	      if (demo.tools.gui) {
	        Demo.setGui(demo, true);
	      }
	    }, 500);
	  } else {
	    Demo.setExample(demo, demo.examples[0]);
	  }
	};

	/**
	 * Enables or disables the inspector tool.
	 * If `enabled` a new `Inspector` instance will be created and the old one destroyed.
	 * @function Demo.setInspector
	 * @param {demo} demo
	 * @param {bool} enabled
	 */
	Demo.setInspector = function (demo, enabled) {
	  if (!enabled) {
	    Demo._destroyTools(demo, true, false);
	    demo.dom.root.classList.toggle('matter-inspect-active', false);
	    return;
	  }

	  var instance = demo.example.instance;

	  Demo._destroyTools(demo, true, false);
	  demo.dom.root.classList.toggle('matter-inspect-active', true);

	  demo.tools.inspector = Inspector.create(instance.engine, instance.render);
	};

	/**
	 * Enables or disables the Gui tool.
	 * If `enabled` a new `Gui` instance will be created and the old one destroyed.
	 * @function Demo.setGui
	 * @param {demo} demo
	 * @param {bool} enabled
	 */
	Demo.setGui = function (demo, enabled) {
	  if (!enabled) {
	    Demo._destroyTools(demo, false, true);
	    demo.dom.root.classList.toggle('matter-gui-active', false);
	    return;
	  }

	  var instance = demo.example.instance;

	  Demo._destroyTools(demo, false, true);
	  demo.dom.root.classList.toggle('matter-gui-active', true);

	  demo.tools.gui = Gui.create(instance.engine, instance.runner, instance.render);
	};

	Demo._destroyTools = function (demo, destroyInspector, destroyGui) {
	  var inspector = demo.tools.inspector,
	      gui = demo.tools.gui;

	  if (destroyInspector && inspector && inspector !== true) {
	    Inspector.destroy(inspector);
	    demo.tools.inspector = null;
	  }

	  if (destroyGui && gui && gui !== true) {
	    Gui.destroy(gui);
	    demo.tools.gui = null;
	  }
	};

	Demo._toggleFullscreen = function (demo) {
	  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

	  if (!fullscreenElement) {
	    fullscreenElement = demo.dom.root;

	    if (fullscreenElement.requestFullscreen) {
	      fullscreenElement.requestFullscreen();
	    } else if (fullscreenElement.mozRequestFullScreen) {
	      fullscreenElement.mozRequestFullScreen();
	    } else if (fullscreenElement.webkitRequestFullscreen) {
	      fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	    }
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }
	  }
	};

	Demo._bindDom = function (demo) {
	  var dom = demo.dom;

	  window.addEventListener('orientationchange', function () {
	    setTimeout(function () {
	      if (demo.resetOnOrientation) {
	        Demo.reset(demo);
	      }
	    }, 300);
	  });

	  if (demo.preventZoom) {
	    document.body.addEventListener('gesturestart', function (event) {
	      event.preventDefault();
	    });

	    var allowTap = true,
	        tapTimeout;

	    document.body.addEventListener('touchstart', function (event) {
	      if (!allowTap) {
	        event.preventDefault();
	      }

	      allowTap = false;

	      clearTimeout(tapTimeout);
	      tapTimeout = setTimeout(function () {
	        allowTap = true;
	      }, 500);
	    });
	  }

	  if (dom.exampleSelect) {
	    dom.exampleSelect.addEventListener('change', function () {
	      var exampleId = this.options[this.selectedIndex].value;
	      Demo.setExampleById(demo, exampleId);
	    });
	  }

	  if (dom.buttonReset) {
	    dom.buttonReset.addEventListener('click', function () {
	      Demo.reset(demo);
	    });
	  }

	  if (dom.buttonInspect) {
	    dom.buttonInspect.addEventListener('click', function () {
	      var showInspector = !demo.tools.inspector;
	      Demo.setInspector(demo, showInspector);
	    });
	  }

	  if (dom.buttonTools) {
	    dom.buttonTools.addEventListener('click', function () {
	      var showGui = !demo.tools.gui;
	      Demo.setGui(demo, showGui);
	    });
	  }

	  if (dom.buttonFullscreen) {
	    dom.buttonFullscreen.addEventListener('click', function () {
	      Demo._toggleFullscreen(demo);
	    });

	    var fullscreenChange = function fullscreenChange() {
	      var isFullscreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
	      document.body.classList.toggle('matter-is-fullscreen', isFullscreen);

	      setTimeout(function () {
	        Demo.setExample(demo, demo.example);
	      }, 500);
	    };

	    document.addEventListener('webkitfullscreenchange', fullscreenChange);
	    document.addEventListener('mozfullscreenchange', fullscreenChange);
	    document.addEventListener('fullscreenchange', fullscreenChange);
	  }
	};

	Demo._createDom = function (options) {
	  var styles = __webpack_require__(4);
	  ToolsCommon.injectStyles(styles, 'matter-demo-style');

	  var root = document.createElement('div');

	  var exampleOptions = options.examples.map(function (example) {
	    return '<option value="' + example.id + '">' + example.name + '</option>';
	  }).join(' ');

	  var preventZoomClass = options.preventZoom && Demo._isIOS ? 'prevent-zoom-ios' : '';

	  root.innerHTML = '\n    <div class="matter-demo ' + options.toolbar.title + ' ' + preventZoomClass + '">\n      <div class="matter-header-outer">\n        <header class="matter-header">\n          <div class="matter-header-inner">\n            <h1 class="matter-demo-title">\n              <a href="' + options.toolbar.url + '" target="_blank">' + options.toolbar.title + ' \u2197&#xFE0E;</a>\n            </h1>\n            <div class="matter-toolbar">\n              <div class="matter-select-wrapper">\n                <select class="matter-example-select matter-select">\n                  ' + exampleOptions + '\n                </select>\n              </div>\n              <button class="matter-btn matter-btn-reset" title="Reset">\u21BB&#xFE0E;</button>\n              <a href="#" class="matter-btn matter-btn-source" title="Source" target="_blank">{ }</a>\n              <button class="matter-btn matter-btn-tools" title="Tools">\u270E&#xFE0E;</button>\n              <button class="matter-btn matter-btn-inspect" title="Inspect">&#8857;&#xFE0E;</button>\n              <button class="matter-btn matter-btn-fullscreen" title="Fullscreen">&#9633;&#xFE0E;</button>\n            </div>\n            <a class="matter-link" href="' + Demo._matterLink + '" title="matter.js" target="_blank">\n              <i>\u25B2</i><i>\u25CF</i><i>\u25A0</i>\n            </a>\n          </div>\n        </header>\n      </div>\n    </div>\n  ';

	  var dom = {
	    root: root.firstElementChild,
	    title: root.querySelector('.matter-demo-title'),
	    header: root.querySelector('.matter-header'),
	    exampleSelect: root.querySelector('.matter-example-select'),
	    buttonReset: root.querySelector('.matter-btn-reset'),
	    buttonSource: root.querySelector('.matter-btn-source'),
	    buttonTools: root.querySelector('.matter-btn-tools'),
	    buttonInspect: root.querySelector('.matter-btn-inspect'),
	    buttonFullscreen: root.querySelector('.matter-btn-fullscreen')
	  };

	  if (!options.toolbar.title) {
	    ToolsCommon.domRemove(dom.title);
	  }

	  if (!options.toolbar.exampleSelect) {
	    ToolsCommon.domRemove(dom.exampleSelect.parentElement);
	  }

	  if (!options.toolbar.reset) {
	    ToolsCommon.domRemove(dom.buttonReset);
	  }

	  if (!options.toolbar.source) {
	    ToolsCommon.domRemove(dom.buttonSource);
	  }

	  if (!options.toolbar.inspector) {
	    ToolsCommon.domRemove(dom.buttonInspect);
	  }

	  if (!options.toolbar.tools) {
	    ToolsCommon.domRemove(dom.buttonTools);
	  }

	  if (!options.toolbar.fullscreen) {
	    ToolsCommon.domRemove(dom.buttonFullscreen);
	  }

	  return dom;
	};

	/*** EXPORTS FROM exports-loader ***/

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	/**
	* @class Common
	*/

	var Common = module.exports = {};

	Common.injectStyles = function (styles, id) {
	  if (document.getElementById(id)) {
	    return;
	  }

	  var root = document.createElement('div');
	  root.innerHTML = '<style id="' + id + '" type="text/css">' + styles + '</style>';

	  var lastStyle = document.head.querySelector('style:last-of-type');
	  Common.domInsertBefore(root.firstElementChild, lastStyle);
	};

	Common.injectScript = function (url, id, callback) {
	  if (document.getElementById(id)) {
	    return;
	  }

	  var script = document.createElement('script');
	  script.id = id;
	  script.src = url;
	  script.onload = callback;

	  document.body.appendChild(script);
	};

	Common.domRemove = function (element) {
	  return element.parentElement.removeChild(element);
	};

	Common.domInsertBefore = function (element, before) {
	  return before.parentNode.insertBefore(element, before.previousElementSibling);
	};

	/*** EXPORTS FROM exports-loader ***/

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = "/*\n*\tMatterTools.Demo\n*/\n\n.matter-demo {\n  font-family: Helvetica, Arial, sans-serif;\n  display: flex;\n  background: #14151f;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n  height: 100vh;\n}\n\n.matter-demo canvas {\n  border-radius: 8px;\n  max-width: 100%;\n  max-height: 100%;\n}\n\n.matter-demo.matter-demo-inline canvas {\n  max-height: calc(100% - 50px);\n}\n\n@media screen and (min-width: 900px) and (min-height: 600px) {\n  .matter-demo.matter-demo-inline canvas {\n    max-height: calc(100% - 100px);\n  }\n}\n\n.matter-is-fullscreen .matter-demo {\n  width: 100%;\n}\n\n.matter-is-fullscreen .dg.ac,\n.matter-is-fullscreen .ins-container {\n  display: none;\n}\n\n.matter-header-outer {\n  position: fixed;\n  z-index: 100;\n  top: 0;\n  left: 0;\n  right: 0;\n  background: rgba(0, 0, 0, 0.2);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 400ms ease;\n}\n\n.matter-header-outer:hover {\n  background: rgba(0, 0, 0, 0.7);\n}\n\n.matter-demo-inline .matter-header-outer {\n  position: static;\n  background: transparent;\n  z-index: 0;\n  width: 100%;\n}\n\n.matter-header {\n  width: 100%;\n  padding: 10px 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.matter-demo-inline .matter-header {\n  padding: 10px;\n}\n\nbody .ins-container,\nbody .dg .dg.main,\nbody .dg .dg.main.a {\n  padding-top: 52px;\n}\n\n@media screen and (min-width: 500px) {\n  .matter-header {\n    padding: 12px 20px;\n  }\n\n  .matter-demo-inline .matter-header {\n    padding: 10px 30px 16px 30px;\n  }\n}\n\n@media screen and (min-width: 900px) and (min-height: 600px) {\n  .matter-demo-inline .matter-header {\n    padding: 10px 30px 36px 30px;\n  }\n}\n\n.matter-header-inner {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  max-width: 960px;\n  width: 100%;\n}\n\n.matter-header h1 {\n  display: none;\n  margin: 0;\n  width: 18px;\n  overflow: hidden;\n}\n\n.matter-header h1 a {\n  color: #f2f2f5;\n  font-size: 15px;\n  font-weight: 400;\n  font-family: Helvetica, Arial, sans-serif;\n  display: block;\n  text-decoration: none;\n  margin: 7px 0 0 0;\n  padding: 0 0 2px 0;\n  border-bottom: 2px solid transparent;\n  white-space: nowrap;\n  float: right;\n}\n\n@media screen and (min-width: 300px) {\n  .matter-header h1 {\n    display: inline;\n  }\n}\n\n@media screen and (min-width: 600px) {\n  .matter-header h1 {\n    width: auto;\n    overflow: visible;\n  }\n}\n\n.btn-home {\n  display: none;\n}\n\n.matter-header h1 a:hover {\n  border-bottom: 2px solid #F5B862;\n}\n\n.matter-link {\n  font-family: Helvetica, Arial, sans-serif;\n  text-decoration: none;\n  line-height: 13px;\n  transform: translate(0, 3px) scale(0.8);\n}\n\n@media screen and (min-width: 500px) {\n  .matter-link {\n    transform: none;\n  }\n}\n\n.matter-link i {\n  transition: transform 400ms ease;\n}\n\n.matter-link:hover i {\n  transition: transform 400ms ease;\n}\n\n.matter-link:hover i:nth-child(1) {\n  transform: rotate(-26deg) translate3d(-4px, -7px, 0);\n}\n\n.matter-link i:nth-child(2) {\n  transform: translate3d(0, 1px, 0);\n}\n\n.matter-link:hover i:nth-child(2) {\n  transition-delay: 80ms;\n  transform: translate3d(3px, -5px, 0);\n}\n\n.matter-link:hover i:nth-child(3) {\n  transition-delay: 180ms;\n  transform: translate3d(9px, 0, 0);\n}\n\n.matter-link i:nth-child(1) {\n  display: inline-block;\n  color: #76F09B;\n  font-size: 30px;\n}\n\n.matter-link i:nth-child(2) {\n  color: #F5B862;\n  font-size: 16px;\n  padding: 0 2px 0 0;\n  display: inline-block;\n}\n\n.matter-link i:nth-child(3) {\n  display: inline-block;\n  color: #F55F5F; \n  font-size: 46px;\n}\n\n.matter-toolbar {\n  flex-grow: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: -6px 0 0 0;\n}\n\n.matter-select {\n  background: transparent;\n  color: #fff;\n  font-size: 14px;\n  height: 30px;\n  width: 100%;\n  outline: none;\n  padding: 0 7px;\n  margin: 0 0 -6px 0;\n  border: 0;\n  border-bottom: 2px solid rgba(0, 0, 0, 0.1);\n  border-radius: 0;\n  appearance: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n}\n\n.prevent-zoom-ios .matter-select {\n  font-size: 16px;\n}\n\n.matter-demo-inline .matter-select {\n  border-bottom: 2px solid #3a3a3a;\n}\n\n.matter-select:hover {\n  border-bottom-color: #F5B862;\n}\n\n.matter-select-wrapper {\n  width: 20%;\n  min-width: 100px;\n  max-width: 200px;\n  position: relative;\n  display: inline-block;\n  margin: 0 6% 0 0;\n}\n\n.matter-select-wrapper:hover:after {\n  color: #fff;\n}\n\n.matter-select-wrapper:after {\n  content: '▾';\n  display: block;\n  pointer-events: none;\n  color: #cecece;\n  font-size: 14px;\n  position: absolute;\n  top: 6px;\n  right: 5px;\n}\n\n.prevent-zoom-ios .matter-select-wrapper:after {\n  top: 4px;\n}\n\n.matter-btn {\n  font-family: Helvetica, Arial, sans-serif;\n  border: 0;\n  background: rgba(0,0,0,0.1);\n  padding: 2px 0 0 0;\n  width: 40px;\n  height: 33px;\n  border-radius: 2px;\n  margin: 0 0 -6px 0;\n  display: inline-block;\n  font-size: 16px;\n  line-height: 1;\n  color: #c2cad4;\n  text-decoration: none;\n  text-align: center;\n}\n\n.matter-demo-inline .matter-btn {\n  background: #0f0f13;\n}\n\n.matter-btn:focus {\n  outline: 0;\n}\n\n.matter-btn:hover {\n  transform: translate(0px, -1px);\n}\n\n.matter-btn:active {\n  transform: translate(0px, 1px);\n}\n\n.matter-btn:hover {\n  background: #212a3a;\n}\n\n.matter-btn-reset:active {\n  color: #76F09B;\n}\n\n.matter-btn-tools {\n  display: none;\n  font-size: 15px;\n  padding-right: 3px;\n}\n\n.matter-gui-active .matter-btn-tools {\n  color: #F55F5F;\n}\n\n.matter-btn-inspect {\n  display: none;\n}\n\n.matter-inspect-active .matter-btn-inspect {\n  color: #fff036;\n}\n\n.matter-btn-source {\n  display: none;\n  font-size: 12px;\n  text-align: center;\n  line-height: 31px;\n}\n\n.matter-btn-source:active {\n  color: #F5B862;\n}\n\n.matter-btn-fullscreen {\n  font-size: 20px;\n}\n\n.matter-btn-source:active {\n  color: #F5B862;\n}\n\n.matter-is-fullscreen .matter-btn-tools,\n.matter-is-fullscreen .matter-btn-inspect {\n  display: none;\n}\n\n.matter-is-fullscreen .matter-btn-fullscreen {\n  color: #76F09B;\n}\n\n.ins-container,\nbody .dg {\n  display: none;\n}\n\n@media screen and (min-width: 500px) {\n  .ins-container,\n  body .dg,\n  .matter-btn-tools,\n  .matter-btn-inspect,\n  .matter-btn-source {\n    display: block;\n  }\n}"

/***/ }
/******/ ])
});
;