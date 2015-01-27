define([
    'sinon',
    'qunit',
    'test-utils',
    'src/element-kit'
], function(
    Sinon,
    QUnit,
    TestUtils
){
    "use strict";
    var kit;

    QUnit.module('Image Element Tests');

    QUnit.test('lazy loading an image in a custom attribute', function() {
        QUnit.expect(5);
        var DomImageEl = document.createElement('img');
        var origImage = window.Image;
        var imageObj = {};
        window.Image = Sinon.stub().returns(imageObj);
        DomImageEl.setAttribute('src', ''); //src should be empty
        var testImagePath = 'path/to/my/lazy/load/image.jpg';
        var callbackSpy = Sinon.spy();
        DomImageEl.setAttribute('lazy-src', testImagePath);
        var virtualImageEl = {src: ''};
        var documentCreateElementStub = Sinon.stub(document, 'createElement');
        documentCreateElementStub.returns(virtualImageEl);
        DomImageEl.kit.load('lazy-src', callbackSpy);
        documentCreateElementStub.restore(); // restore document.createElement immediately or suffer
        QUnit.equal(virtualImageEl.src, testImagePath, 'after calling load(), virtual image src attribute is updated to new lazy load src path to be loaded in virtual memory');
        QUnit.equal(callbackSpy.callCount, 0, 'load callback has not yet been fired because image hasnt loaded yet');
        imageObj.onload(); // trigger image load
        QUnit.equal(callbackSpy.callCount, 1, 'once image is loaded, callback is fired');
        QUnit.equal(DomImageEl.getAttribute('src'), '', 'DOM image src attribute is still empty because show() has not been called');
        DomImageEl.kit.show();
        QUnit.equal(DomImageEl.getAttribute('src'), testImagePath, 'after show() is called, DOM image src attribute has been updated to new path');
        window.Image = origImage;
    });

    QUnit.test('srcset lazy loading', function() {
        QUnit.expect(5);
        var DomImageEl = document.createElement('img');
        var origImage = window.Image;
        var imageObj = {};
        var callbackSpy = Sinon.spy();
        var testSrcSetPaths = 'medium.jpg 1000w, large.jpg 2000w';
        var origWindowWidth = window.innerWidth;
        window.innerWidth = 1200;
        window.Image = Sinon.stub().returns(imageObj);
        DomImageEl.setAttribute('src', ''); //src should be empty
        DomImageEl.setAttribute('my-srcset', testSrcSetPaths);
        QUnit.equal(DomImageEl.getAttribute('src'), '', 'image src attribute is still empty because load() has not been called');
        var virtualImageEl = {src: ''};
        var documentCreateElementStub = Sinon.stub(document, 'createElement');
        documentCreateElementStub.returns(virtualImageEl);
        // test load
        DomImageEl.kit.load('my-srcset', callbackSpy);
        documentCreateElementStub.restore(); // restore document.createElement immediately or suffer
        QUnit.equal(virtualImageEl.src, 'medium.jpg', 'after calling load(), image src attribute was set to medium image because window width fits its requirements');
        QUnit.equal(callbackSpy.callCount, 0, 'load callback has not yet been fired because image hasnt loaded yet');
        imageObj.onload(); // trigger image load
        QUnit.equal(callbackSpy.callCount, 1, 'once image is loaded, callback is fired');
        // test show
        DomImageEl.kit.show();
        QUnit.equal(DomImageEl.getAttribute('src'), 'medium.jpg', 'after show() is called, DOM image src attribute was set to medium image because window width fits its requirements');
        window.Image = origImage;
        window.innerWidth = origWindowWidth;
    });

});