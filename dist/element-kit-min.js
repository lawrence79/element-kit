/** 
* element-kit - v0.3.0.
* https://github.com/mkay581/element-kit.git
* Copyright 2015 Mark Kennedy. Licensed MIT.
*/
"use strict";var Element=require("./element"),ImageElement=require("./image-element"),elementCount=0,cache={},loaded;module.exports=function(){var a=function(a){this.initialize(a)};return a.prototype={initialize:function(){var a=this;loaded||document.body.kit||(loaded=Object.defineProperty(window.Element.prototype,"kit",{get:function(){return a.setup(this)}}))},setup:function(a){var b;return cache[a._kitId]||(b=a instanceof window.HTMLImageElement?ImageElement:Element,elementCount++,a._kitId=elementCount,cache[a._kitId]=new b(a)),cache[a._kitId]},destroy:function(){}},new a}();