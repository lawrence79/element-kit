var sinon = require('sinon');
var TestUtils = require('test-utils');
var assert = require('assert');

require('../src/element-kit');

describe('Image Element', function () {

    it('load() should lazy load a path specified in a custom data attribute that is passed', function() {
        var imageEl = document.createElement('img');
        imageEl.setAttribute('src', ''); //src should be empty initially
        var testImagePath = 'path/to/my/lazy/load/image.jpg';
        imageEl.setAttribute('lazy-src', testImagePath);
        var loadPromise = imageEl.kit.load('lazy-src').then(function () {
            assert.equal(imageEl.getAttribute('src'), testImagePath, 'after calling load(), DOM image src attribute has been updated to new path');
        });
        imageEl.onload(); // trigger image load
        return loadPromise;
    });

    it('load() should lazy load a srcset that is passed', function() {
        var imageEl = document.createElement('img');
        var testSrcSetPaths = 'medium.jpg 1000w, large.jpg 2000w';
        var origWindowWidth = window.innerWidth;
        window.innerWidth = 1200;
        imageEl.setAttribute('src', ''); //src should be empty initially
        imageEl.setAttribute('my-srcset', testSrcSetPaths);
        assert.equal(imageEl.getAttribute('src'), '', 'image src attribute is still empty because load() has not been called');
        // test load
        var loadPromise = imageEl.kit.load('my-srcset').then(function () {
            assert.equal(imageEl.getAttribute('src'), 'medium.jpg', 'after calling load(), image src attribute was set to medium image because window width fits its requirements');
            window.innerWidth = origWindowWidth;
        });
        imageEl.onload(); // trigger image load
        return loadPromise;
    });

    it('load() call should return a resolved promise with the image element', function() {
        var imageEl = document.createElement('img');
        var srcAttribute = 'medium.jpg';
        imageEl.setAttribute('src', ''); //src should be empty initially
        imageEl.setAttribute('my-srcset', srcAttribute);
        // test load
        var loadPromise = imageEl.kit.load('my-srcset').then(function (el) {
            assert.deepEqual(el, imageEl, 'once image is loaded, callback is fired with image elemnt as first argument');
        });
        imageEl.onload(); // trigger image load
        return loadPromise;
    });

    it('load() should accept any url as first parameter and load it', function() {
        var imageEl = document.createElement('img');
        var testImageUrl = 'my/faux/image.jpg';
        imageEl.setAttribute('src', ''); //src should be empty initially
        imageEl.setAttribute('data-image', testImageUrl);
        // test load
        var loadPromise = imageEl.kit.load('data-image').then(function () {
            assert.deepEqual(imageEl.getAttribute('src'), testImageUrl, 'url passed was loaded');
        });
        imageEl.onload(); // trigger image load
        return loadPromise;
    });

});