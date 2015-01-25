define([
    'sinon',
    'qunit',
    'test-utils',
    'src/element-kit'
], function(
    Sinon,
    QUnit,
    TestUtils,
    ElementKit
){
    "use strict";
    var kit;

    QUnit.module('Image Element Tests', {
        setup: function () {
            kit = new ElementKit();
        },
        teardown: function () {
            kit.destroy();
        }
    });

    QUnit.test('lazy loading an image in a custom attribute', function() {
        QUnit.expect(4);
        var el = document.createElement('img');
        var origImage = window.Image;
        var imageObj = {};
        window.Image = Sinon.stub().returns(imageObj);
        el.setAttribute('src', ''); //src should be empty
        var testImagePath = 'path/to/my/lazy/load/image.jpg';
        var callbackSpy = Sinon.spy();
        el.setAttribute('lazy-src', testImagePath);
        QUnit.equal(el.getAttribute('src'), '', 'image src attribute is still empty because load() has not been called');
        el.kit.load('lazy-src', callbackSpy);
        QUnit.equal(el.getAttribute('src'), testImagePath, 'after calling load(), image src attribute is updated to new lazy load src path');
        QUnit.equal(callbackSpy.callCount, 0, 'load callback has not yet been fired because image hasnt loaded yet');
        imageObj.onload(); // trigger image load
        QUnit.equal(callbackSpy.callCount, 1, 'once image is loaded, callback is fired');
        window.Image = origImage;
    });

    QUnit.test('srcset lazy loading', function() {
        QUnit.expect(4);
        var el = document.createElement('img');
        var origImage = window.Image;
        var imageObj = {};
        var callbackSpy = Sinon.spy();
        var testSrcSetPaths = 'medium.jpg 1000w, large.jpg 2000w';
        var origWindowWidth = window.innerWidth;
        window.innerWidth = 1200;
        window.Image = Sinon.stub().returns(imageObj);
        el.setAttribute('src', ''); //src should be empty
        el.setAttribute('my-srcset', testSrcSetPaths);
        QUnit.equal(el.getAttribute('src'), '', 'image src attribute is still empty because load() has not been called');
        el.kit.load('my-srcset', callbackSpy);
        QUnit.equal(el.getAttribute('src'), 'medium.jpg', 'after calling load(), image src attribute was set to medium image because window width fits its requirements');
        QUnit.equal(callbackSpy.callCount, 0, 'load callback has not yet been fired because image hasnt loaded yet');
        imageObj.onload(); // trigger image load
        QUnit.equal(callbackSpy.callCount, 1, 'once image is loaded, callback is fired');
        window.Image = origImage;
        window.innerWidth = origWindowWidth;
    });

});