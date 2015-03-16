/** 
* element-kit - v0.3.3.
* https://github.com/mkay581/element-kit.git
* Copyright 2015 Mark Kennedy. Licensed MIT.
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.ElementKit=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){"use strict";var c,d=a("./element"),e=a("./image-element"),f=0,g={};b.exports=function(){var a=function(a){this.initialize(a)};return a.prototype={initialize:function(){var a=this;c||document.body.kit||(c=Object.defineProperty(window.Element.prototype,"kit",{get:function(){return a.setup(this)}}))},setup:function(a){var b;return g[a._kitId]||(b=a instanceof window.HTMLImageElement?e:d,f++,a._kitId=f,g[a._kitId]=new b(a)),g[a._kitId]},destroy:function(){}},new a}()},{"./element":2,"./image-element":3}],2:[function(a,b){"use strict";var c=a("./utils"),d=(a("./element-kit"),function(a){this.initialize(a)});d.prototype={initialize:function(a){this.el=a,this.classList=this._getClassList(),this._eventListenerMap=this._eventListenerMap||[],Object.defineProperty(this,"dataset",{get:function(){return this.getData()}.bind(this)})},_traverseEachParent:function(a,b){for(var c,d=b||this.el;d&&"string"==typeof d.className&&(c=a(d),void 0===c||c);)d=d.parentNode},appendOuterHtml:function(a){var b=this.el.parentNode,d=c.createHtmlElement(a);return b?b.replaceChild(d,this.el):(b=document.createDocumentFragment(),b.appendChild(d)),d.appendChild(this.el),d},getUniqueId:function(){return this.el._kitId},getClosestAncestorElementByClassName:function(a){var b;return this._traverseEachParent(function(c){return c.kit._hasClass(a)?(b=c,!1):void 0},this.el.parentNode),b},addEventListener:function(a,b,c,d){var e=b;d=d||{},"function"!=typeof e&&(e=this._createEventListener(c[b],c)),this.el.addEventListener(a,e,d.useCapture),this._eventListenerMap.push({event:a,listener:e,listenerId:b,context:c})},_createEventListener:function(a,b){return function(){b=b||this,a.apply(b,arguments)}},removeEventListener:function(a,b,c){var d,e,f=this._eventListenerMap||[];if(f.length)for(d=0;d<f.length;d++)if(e=f[d],e&&e.event===a&&e.listenerId===b&&e.context===c){this.el.removeEventListener(a,e.listener),this._eventListenerMap[d]=null;break}},waitForTransition:function(a){var b=this.getTransitionDuration();a&&(b>0?setTimeout(a.bind(this,this.el),b):a(this.el))},getTransitionDuration:function(){var a,b=this.getCssComputedProperty("transition-delay")||"0ms",c=this.getCssComputedProperty("transition-duration")||"0ms",d=Array.isArray(c)?c:[c],e=Array.isArray(b)?b:[b],f=0;return d.push.apply(d,e),d.forEach(function(b){b.split(",").forEach(function(b){b=this._convertCssTimeValueToMilliseconds(b),a=this._getCssPropUnitMap(b),a.num>f&&(f=a.num)}.bind(this))}.bind(this)),f},getCssComputedProperty:function(a){var b=window.getComputedStyle(this.el);return b.getPropertyValue(a)||this.el.style[this._getJsPropName(a)]},_getCssPropUnitMap:function(a){a.trim();var b=a.match("[0-9.]+"),c="ms";return b=b?b[0]:"",b&&(c=a.split(b)[1],b=Number(b)),{num:b,unit:c}},_convertCssTimeValueToMilliseconds:function(a){var b=this._getCssPropUnitMap(a).num,c=a.replace(b,"");return a="s"===c?1e3*b:b,a+"ms"},_getClassList:function(){return{add:this._addClass.bind(this),remove:this._removeClass.bind(this),contains:this._hasClass.bind(this),toggle:this._toggleClass.bind(this)}},_getCssClasses:function(){return this.el.className.split(" ")},_toggleClass:function(a){this._hasClass(a)?this._removeClass(a):this._addClass(a)},_addClass:function(){"classList"in document.createElement("_")?this._each(arguments,function(a){this.el.classList.add(a)}.bind(this)):this._each(arguments,function(a){this._hasClass(a)||(this.el.className=this.el.className?this.el.className+" "+a:a)}.bind(this))},_each:function(a,b){var c,d=a.length;for(c=0;d>c;c++)b(a[c])},_removeClass:function(){var a;"classList"in document.createElement("_")?this._each(arguments,function(a){this.el.classList.remove(a)}.bind(this)):this._each(arguments,function(b){this.el.className===b?this.el.className="":(a="[\\s]*"+b,a=new RegExp(a,"i"),this.el.className=this.el.className.replace(a,""))}.bind(this))},_hasClass:function(a){var b=this._getCssClasses();return-1!==b.indexOf(a)},_getJsPropName:function(a){return a=a.replace(/-([a-z])/g,function(a){return a[1].toUpperCase()})},getAttributes:function(){var a=this.el.attributes,b={};if(a.length)for(var c=0;c<a.length;c++)b[a[c].name]=a[c].value;return b},_getDomData:function(){var a,b,c=this.getAttributes(),d={};for(a in c)c.hasOwnProperty(a)&&(b=c[a],0===a.indexOf("data-")&&(a=a.substr(5),d[a]=b));return d},getData:function(){var a;this._data=c.extend({},this._data,this._getDomData());for(a in this._data)if(this._data.hasOwnProperty(a)){var b=this._data[a];Object.defineProperty(this._data,a,{writeable:!0,get:function(){return b}.bind(this),set:function(b){this.setData.bind(this,a,b)}.bind(this)})}return this._data},setData:function(a,b){this.el.setAttribute("data-"+a,b),this._data[a]=b},destroy:function(){}},b.exports=d},{"./element-kit":1,"./utils":4}],3:[function(a,b){"use strict";var c=a("./utils"),d=a("./element"),e=function(a){d.prototype.initialize.call(this,a)};e.prototype=c.extend({},d.prototype,{load:function(a,b){var c=this.el,d=c.getAttribute(a);return d||console.warn('ElementKit error: ImageElement has no "'+a+'" attribute to load'),-1!==d.indexOf(",")&&(d=this._getImageSourceSetPath(d)),this._loadImage(d,b),this},_loadImage:function(a,b){var c=this.el;c.onload=function(){b?b(c):null},c.src=a},_getImageSourceSetPath:function(a){var b,c,d,e,f,g=window.innerWidth,h=window.innerHeight;return a.split(",").forEach(function(a){c=this._buildSourceMapWidthHeight(a),d=c.width||0,e=c.height||0,!f&&g>=d&&h>=e&&(b=a.split(" ")[0],f=!0)}.bind(this)),b},_buildSourceMapWidthHeight:function(a,b){var c,d=a.split(" "),e=function(a){return Number(a.substr(0,a.length-1))};return b=b||{},d.shift(),d.forEach(function(a){c=a.charAt(a.length-1),"w"===c?b.width=e(a):"h"===c&&(b.height=e(a))}),b}}),b.exports=e},{"./element":2,"./utils":4}],4:[function(a,b){b.exports={createHtmlElement:function(a){var b,c;return a?(a=a.trim(a),b=document.createElement("div"),b.innerHTML=a,c=b.childNodes[0],b.removeChild(c)):void 0},extend:function(a){var b,c,d=a;for(c=1;c<arguments.length;c++){b=arguments[c];for(var e in b)b.hasOwnProperty(e)&&(d[e]=b[e])}return d}}},{}]},{},[1,2,3,4])(4)});