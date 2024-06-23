/*!
 * matter-demo bundle 0.20.0 by @liabru
 * http://brm.io/matter-js/
 * License MIT
 */
(this.webpackJsonpMatterDemo=this.webpackJsonpMatterDemo||[]).push([[3],{OPlj:function(n,r,t){
/*!
 * matter-wrap 0.2.0 by Liam Brummitt 2017-07-04
 * https://github.com/liabru/matter-wrap
 * License MIT
 */
var o;o=function(n){return function(n){var r={};function t(o){if(r[o])return r[o].exports;var e=r[o]={i:o,l:!1,exports:{}};return n[o].call(e.exports,e,e.exports,t),e.l=!0,e.exports}return t.m=n,t.c=r,t.i=function(n){return n},t.d=function(n,r,o){t.o(n,r)||Object.defineProperty(n,r,{configurable:!1,enumerable:!0,get:o})},t.n=function(n){var r=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(r,"a",r),r},t.o=function(n,r){return Object.prototype.hasOwnProperty.call(n,r)},t.p="/libs",t(t.s=1)}([function(r,t){r.exports=n},function(n,r,t){"use strict";var o=t(0),e={name:"matter-wrap",version:"0.1.3",for:"matter-js@^0.12.0",install:function(n){n.after("Engine.update",(function(){e.Engine.update(this)}))},Engine:{update:function(n){for(var r=n.world,t=o.Composite.allBodies(r),i=o.Composite.allComposites(r),a=0;a<t.length;a+=1){var u=t[a];u.plugin.wrap&&e.Body.wrap(u,u.plugin.wrap)}for(a=0;a<i.length;a+=1){var s=i[a];s.plugin.wrap&&e.Composite.wrap(s,s.plugin.wrap)}}},Bounds:{wrap:function(n,r){var t=null,o=null;if(void 0!==r.min.x&&void 0!==r.max.x&&(n.min.x>r.max.x?t=r.min.x-n.max.x:n.max.x<r.min.x&&(t=r.max.x-n.min.x)),void 0!==r.min.y&&void 0!==r.max.y&&(n.min.y>r.max.y?o=r.min.y-n.max.y:n.max.y<r.min.y&&(o=r.max.y-n.min.y)),null!==t||null!==o)return{x:t||0,y:o||0}}},Body:{wrap:function(n,r){var t=e.Bounds.wrap(n.bounds,r);return t&&o.Body.translate(n,t),t}},Composite:{bounds:function(n){for(var r=o.Composite.allBodies(n),t=[],e=0;e<r.length;e+=1){var i=r[e];t.push(i.bounds.min,i.bounds.max)}return o.Bounds.create(t)},wrap:function(n,r){var t=e.Bounds.wrap(e.Composite.bounds(n),r);return t&&o.Composite.translate(n,t),t}}};o.Plugin.register(e),n.exports=e}])},n.exports=o(t("lniP"))}}]);