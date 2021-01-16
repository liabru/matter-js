/*!
 * matter-tools 0.12.3 by @liabru 2021-01-16
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
		define("Demo", ["matter-js", "matter-tools"], factory);
	else if(typeof exports === 'object')
		exports["Demo"] = factory(require("matter-js"), require("matter-tools"));
	else
		root["MatterTools"] = root["MatterTools"] || {}, root["MatterTools"]["Demo"] = factory(root["Matter"], root["MatterTools"]);
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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A tool for for running and testing example scenes.
 * @module Demo
 */

const Demo = module.exports = {};

const Gui = __webpack_require__(1).Gui;
const Inspector = __webpack_require__(1).Inspector;
const ToolsCommon = __webpack_require__(2);

const Matter = __webpack_require__(0);
const Common = Matter.Common;

Demo._isIOS = window.navigator && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
Demo._matterLink = 'https://brm.io/matter-js/';

/**
 * Creates a new demo instance.
 * See example for options and usage.
 * @function Demo.create
 * @param {} options
 */
Demo.create = function(options) {
  let demo = Object.assign({
    example: {
      instance: null
    },
    examples: [],
    resetOnOrientation: false,
    preventZoom: false,
    fullPage: false,
    startExample: true,
    appendTo: document.body,
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

  if (!options.toolbar 
    || (demo.examples.length > 1 && options.toolbar && options.toolbar.exampleSelect !== false)) {
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

  if (!demo.fullPage && demo.inline !== false) {
    demo.dom.root.classList.add('matter-demo-inline');
  }

  if (demo.appendTo) {
    demo.appendTo.appendChild(demo.dom.root);
  }

  if (demo.startExample) {
    Demo.start(demo, demo.startExample);
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
Demo.start = function(demo, initalExampleId) {
  initalExampleId = typeof initalExampleId === 'string' ? initalExampleId : demo.examples[0].id;

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
Demo.stop = function(demo) {
  if (demo.example && demo.example.instance) {
    demo.example.instance.stop();
  }
};

/**
 * Stops and restarts the currently running example.
 * @function Demo.reset
 * @param {demo} demo
 */
Demo.reset = function(demo) {
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
Demo.setExampleById = function(demo, exampleId) {
  let example = demo.examples.filter((example) => {
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
Demo.setExample = function(demo, example) {
  if (example) {
    let instance = demo.example.instance;

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
      demo.dom.root.appendChild(instance.canvas);
    }

    demo.dom.exampleSelect.value = example.id;
    demo.dom.buttonSource.href = example.sourceLink || demo.url || '#';

    setTimeout(function() {
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
Demo.setInspector = function(demo, enabled) {
  if (!enabled) {
    Demo._destroyTools(demo, true, false);
    demo.dom.root.classList.toggle('matter-inspect-active', false);
    return;
  }

  let instance = demo.example.instance;

  Demo._destroyTools(demo, true, false);
  demo.dom.root.classList.toggle('matter-inspect-active', true);

  demo.tools.inspector = Inspector.create(
    instance.engine,
    instance.render
  );
};

/**
 * Enables or disables the Gui tool.
 * If `enabled` a new `Gui` instance will be created and the old one destroyed.
 * @function Demo.setGui
 * @param {demo} demo
 * @param {bool} enabled
 */
Demo.setGui = function(demo, enabled) {
  if (!enabled) {
    Demo._destroyTools(demo, false, true);
    demo.dom.root.classList.toggle('matter-gui-active', false);
    return;
  }

  let instance = demo.example.instance;

  Demo._destroyTools(demo, false, true);
  demo.dom.root.classList.toggle('matter-gui-active', true);

  demo.tools.gui = Gui.create(
    instance.engine, 
    instance.runner, 
    instance.render
  );
};

Demo._destroyTools = function(demo, destroyInspector, destroyGui) {
  let inspector = demo.tools.inspector,
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

Demo._toggleFullscreen = function(demo) {
  let fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

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

Demo._bindDom = function(demo) {
  var dom = demo.dom;

  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      if (demo.resetOnOrientation) {
        Demo.reset(demo);
      }
    }, 300);
  });

  if (demo.preventZoom) {
    document.body.addEventListener('gesturestart', function(event) { 
      event.preventDefault(); 
    });

    var allowTap = true,
      tapTimeout;

    document.body.addEventListener('touchstart', function(event) {
      if (!allowTap) {
        event.preventDefault();
      }

      allowTap = false;

      clearTimeout(tapTimeout);
      tapTimeout = setTimeout(function() {
        allowTap = true;
      }, 500);
    });
  }

  if (dom.exampleSelect) {
    dom.exampleSelect.addEventListener('change', function() {
      let exampleId = this.options[this.selectedIndex].value;
      Demo.setExampleById(demo, exampleId);
    });
  }

  if (dom.buttonReset) {
    dom.buttonReset.addEventListener('click', function() {
      Demo.reset(demo);
    });
  }

  if (dom.buttonInspect) {
    dom.buttonInspect.addEventListener('click', function() {
      var showInspector = !demo.tools.inspector;
      Demo.setInspector(demo, showInspector);
    });
  }

  if (dom.buttonTools) {
    dom.buttonTools.addEventListener('click', function() {
      var showGui = !demo.tools.gui;
      Demo.setGui(demo, showGui);
    });
  }

  if (dom.buttonFullscreen) {
    dom.buttonFullscreen.addEventListener('click', function() {
      Demo._toggleFullscreen(demo);
    });

    var fullscreenChange = function() {
      var isFullscreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
      document.body.classList.toggle('matter-is-fullscreen', isFullscreen);
    };

    document.addEventListener('webkitfullscreenchange', fullscreenChange);
    document.addEventListener('mozfullscreenchange', fullscreenChange);
    document.addEventListener('fullscreenchange', fullscreenChange);
  }
};

Demo._createDom = function(options) {
  let styles = __webpack_require__(10);
  ToolsCommon.injectStyles(styles, 'matter-demo-style');

  let root = document.createElement('div');

  let exampleOptions = options.examples.map((example) => {
    return `<option value="${example.id}">${example.name}</option>`;
  }).join(' ');

  var preventZoomClass = options.preventZoom && Demo._isIOS ? 'prevent-zoom-ios' : '';

  root.innerHTML = `
    <div class="matter-demo ${options.toolbar.title} ${preventZoomClass}">
      <div class="matter-header-outer">
        <header class="matter-header">
          <div class="matter-header-inner">
            <h1 class="matter-demo-title">
              <a href="${options.toolbar.url}" target="_blank">
              ${options.toolbar.title}
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/>
                </svg>
              </a>
            </h1>
            <div class="matter-toolbar">
              <div class="matter-select-wrapper">
                <select aria-label="Select example" title="Select example" class="matter-example-select matter-select">
                  ${exampleOptions}
                </select>
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z"/>
                  <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
              </div>
              <button class="matter-btn matter-btn-reset" title="Reset">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
              </button>
              <a href="#" class="matter-btn matter-btn-source" title="Source" target="_blank">{ }</a>
              <button class="matter-btn matter-btn-tools" title="Tools">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
              </button>
              <button class="matter-btn matter-btn-inspect" title="Inspect">
              <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zm7.32.19C16.84 3.05 15.01 2.25 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43zM19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1c.86 1.11 1.44 2.44 1.62 3.9zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zM15 12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zm3.31 4.9l1.43 1.43c1.21-1.48 2.01-3.32 2.21-5.32h-2.02c-.18 1.45-.76 2.78-1.62 3.89zM13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62zm-7.32-.19C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43z"/>
              </svg>
              </button>
              <button class="matter-btn matter-btn-fullscreen" title="Fullscreen">
                <svg fill="#000000" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
            <a class="matter-link" href="${Demo._matterLink}" title="matter.js" target="_blank">
              <svg class="matter-logo" height="100" viewBox="0 952.04859 330 100" width="268" xmlns="http://www.w3.org/2000/svg">
                <path id="m-triangle" style="fill:#76f09b;" d="m 115.83215,1052.3622 -57.916072,0 -57.916078053812107,0 L 28.958038,1002.2054 57.916077,952.04859 86.874114,1002.2054 Z" />
                <path id="m-square" style="fill:#f55f5f" d="m 168.03172,952.36218 0,100.00002 100,0 0,-100.00002 -100,0 z" />
                <circle id="m-circle" style="fill:#f5b862" r="12.947398" cy="1039.4148" cx="140.28374" />
              </svg>
            </a>
          </div>
        </header>
      </div>
    </div>
  `;

  let dom = {
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

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = "/*\n*\tMatterTools.Demo\n*/\n\n.matter-demo {\n  display: flex;\n  background: #14151f;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n  height: 100vh;\n  padding: 50px 0 0 0;\n}\n\n.matter-demo,\n.matter-demo * {\n  box-sizing: border-box;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.matter-demo *:focus,\n.matter-demo *:active {\n  outline: 0;\n}\n\n.matter-demo *:-moz-focusring {\n  outline: 3px solid #4da4e4;\n  outline-offset: -1px;\n  z-index: 5;\n}\n\n.matter-demo *:focus-visible {\n  outline: 3px solid #4da4e4;\n  outline-offset: -1px;\n  z-index: 5;\n}\n\n.matter-demo.matter-demo-inline {\n  padding: 0;\n  height: inherit;\n}\n\n.matter-demo canvas {\n  border-radius: 8px;\n  border: 1px solid rgba(255, 255, 255, 0.07);\n  max-width: 100%;\n  max-height: 100%;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n.matter-demo.matter-demo-inline canvas {\n  max-height: calc(100% - 49px);\n}\n\n.matter-is-fullscreen .matter-demo {\n  width: 100%;\n}\n\n.matter-is-fullscreen .dg.ac,\n.matter-is-fullscreen .ins-container {\n  display: none;\n}\n\n.matter-header-outer {\n  position: fixed;\n  z-index: 100;\n  top: 0;\n  left: 0;\n  right: 0;\n  background: #0e0f19;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.matter-demo-inline .matter-header-outer {\n  position: static;\n  background: transparent;\n  z-index: 0;\n  width: 100%;\n}\n\n.matter-header {\n  width: 100%;\n  padding: 7px 20px 8px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.matter-header-inner {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n}\n\n.matter-header h1 {\n  display: none;\n  margin: 0 12px 0 0;\n  width: 18px;\n  overflow: hidden;\n  flex-shrink: 0;\n}\n\n.matter-header h1 a {\n  color: #c5c5cc;\n  font-size: 14px;\n  font-weight: 400;\n  display: block;\n  text-decoration: none;\n  padding: 3px 0 2px 0;\n  border-bottom: 1px solid transparent;\n  white-space: nowrap;\n  float: right;\n}\n\n.matter-header h1 a:hover,\n.matter-header h1 a:focus {\n  border-bottom: 1px solid #f5b862;\n  color: #fff;\n  outline: 0;\n}\n\n@media screen and (min-width: 300px) {\n  .matter-header h1 {\n    display: inline;\n  }\n}\n\n@media screen and (min-width: 600px) {\n  .matter-header h1 {\n    width: auto;\n    overflow: visible;\n  }\n}\n\n.btn-home {\n  display: none;\n}\n\n.matter-demo-title svg {\n  fill: #fff;\n  width: 14px;\n  height: 14px;\n  margin: 0px 0 -2px 2px;\n}\n\n.matter-link {\n  text-decoration: none;\n  line-height: 13px;\n  margin: 0 -10px 0 0;\n  flex-shrink: 0;\n}\n\n.matter-link:focus {\n  outline: none;\n}\n\n.matter-logo {\n  height: 33px;\n  width: 46px;\n}\n\n@media screen and (min-width: 1024px) {\n  .matter-logo {\n    width: 50px;\n  }\n}\n\n.matter-logo #m-triangle {\n  transform-origin: 14px 856px;\n  transition: transform 400ms ease;\n}\n\n.matter-link:focus #m-triangle,\n.matter-logo:hover #m-triangle {\n  transform: rotate(-30deg) translate(-98px, -25px);\n}\n\n.matter-logo #m-circle {\n  transition: transform 200ms ease;\n  transition-delay: 300ms;\n}\n\n.matter-link:focus #m-circle,\n.matter-logo:hover #m-circle {\n  transform: translate(18px, -33px);\n}\n\n.matter-logo #m-square {\n  transition: transform 150ms ease;\n  transition-delay: 400ms;\n}\n\n.matter-link:focus #m-square,\n.matter-logo:hover #m-square {\n  transform: translate(47px, -2px);\n}\n\n.matter-toolbar {\n  flex-grow: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 0 18px 0 0;\n}\n\n.matter-select {\n  background: transparent;\n  color: #c5c5cc;\n  font-size: 14px;\n  line-height: 33px;\n  width: 100%;\n  outline: none;\n  padding: 0 25px 0 7px;\n  margin: 0;\n  border: 0;\n  border-radius: 0;\n  appearance: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n.matter-select option {\n  background: #fff;\n  color: #000;\n}\n\n.matter-select-wrapper {\n  height: 33px;\n  width: 100%;\n  min-width: 100px;\n  max-width: 175px;\n  position: relative;\n  display: inline-block;\n  margin-right: 4%;\n}\n\n.matter-select-wrapper:after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  pointer-events: none;\n  width: 28px;\n  height: 100%;\n  background: linear-gradient(-90deg, rgb(14 15 25), rgb(14 15 25 / 0));\n  right: 23px;\n  top: 0;\n}\n\n.matter-demo-inline .matter-select-wrapper:after {\n  display: none;\n}\n\n.matter-select:hover,\n.matter-select-wrapper:hover .matter-select {\n  color: #fff;\n}\n\n.matter-select:focus-visible {\n  color: #fff;\n}\n\n.matter-select:-moz-focusring {\n  color: #fff;\n}\n\n.matter-select:focus {\n  outline: 0;\n}\n\n.matter-select-wrapper svg:hover,\n.matter-select-wrapper:hover svg {\n  background: #232635;\n}\n\n.matter-select-wrapper:hover:after svg {\n  fill: #fff;\n}\n\n.matter-select-wrapper svg {\n  display: block;\n  pointer-events: none;\n  fill: #cecece;\n  width: 20px;\n  height: 20px;\n  position: absolute;\n  z-index: 2;\n  top: 6px;\n  right: 0;\n  border-radius: 5px;\n  background: #101119;\n}\n\n.matter-btn {\n  border: 0;\n  background: #0b0c15;\n  width: 40px;\n  height: 33px;\n  border-radius: 2px;\n  display: inline-block;\n  font-size: 16px;\n  line-height: 1;\n  color: #c2cad4;\n  text-decoration: none;\n  text-align: center;\n  cursor: default;\n  flex-shrink: 0;\n  flex-grow: 0;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n\n.matter-btn svg {\n  fill: #fff;\n  width: 15px;\n  height: 15px;\n  margin: 2px 0 0 0;\n}\n\n.matter-demo-inline .matter-btn {\n  background: #0f0f13;\n}\n\n.matter-btn:hover {\n  background: #1c1f2d;\n  outline: none;\n}\n\n.matter-btn:active {\n  transform: translate(0px, 1px);\n}\n\n.matter-btn:focus-visible {\n  background: #1c1f2d;\n  outline: none;\n}\n\n.matter-btn:-moz-focusring {\n  background: #1c1f2d;\n  outline: none;\n}\n\n.matter-btn-tools {\n  position: relative;\n  display: none;\n  font-size: 15px;\n}\n\n.matter-btn-tools svg {\n  margin-left: -3px;\n}\n\n.matter-btn-inspect {\n  position: relative;\n  display: none;\n}\n\n.matter-btn-inspect svg {\n  margin-left: -3px;\n}\n\n.matter-btn-source {\n  display: none;\n  font-size: 12px;\n  text-align: center;\n  line-height: 31px;\n}\n\n.matter-btn-fullscreen {\n  position: relative;\n  font-size: 18px;\n}\n\n.matter-btn-fullscreen svg {\n  margin-left: -3px;\n}\n\n.matter-is-fullscreen .matter-btn-tools,\n.matter-is-fullscreen .matter-btn-inspect {\n  display: none;\n}\n\n.matter-btn-fullscreen:after,\n.matter-btn-tools:after,\n.matter-btn-inspect:after {\n  content: \" \";\n  position: absolute;\n  bottom: 10px;\n  width: 3px;\n  height: 3px;\n  background: #f5df75;\n  border-radius: 1px;\n  opacity: 0;\n  transform: scale(0);\n  transition: opacity 100ms ease, transform 100ms ease;\n}\n\n.matter-btn-inspect:after {\n  left: 31px;\n}\n\n.matter-btn-tools:after {\n  background: #f45f5f;\n  left: 28px;\n}\n\n.matter-btn-fullscreen:after {\n  background: #76f09b;\n  left: 32px;\n}\n\n.matter-is-fullscreen .matter-btn-fullscreen:after,\n.matter-gui-active .matter-btn-tools:after,\n.matter-inspect-active .matter-btn-inspect:after {\n  opacity: 1;\n  transform: scale(1);\n}\n\n.ins-container,\nbody .dg {\n  display: none;\n}\n\n@media screen and (min-width: 500px) {\n  .ins-container,\n  body .dg,\n  .matter-btn-tools,\n  .matter-btn-inspect,\n  .matter-btn-source {\n    display: block;\n  }\n}\n";

/***/ })
/******/ ]);
});