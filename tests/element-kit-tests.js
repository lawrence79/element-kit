var sinon = require('sinon');
var TestUtils = require('test-utils');
var assert = require('assert');

require('../src/element-kit');

describe('Kit', function () {

    it('should has different instances after initialize', function () {
        var firstEl = document.createElement('div');
        var secondEl = document.createElement('div');
        assert.notDeepEqual(firstEl.kit, secondEl.kit, 'after kits initialized, each kit has a different instance');
    });

    it('multiple element kit\'s should return their own instances', function() {
        var firstEl = document.createElement('div');
        assert.deepEqual(firstEl, firstEl.kit.el, 'after initializing first el, its kit instance references the first el also');
        var secondEl = document.createElement('div');
        assert.deepEqual(secondEl, secondEl.kit.el, 'after initialize second el, its kit instance references the second el same el');
        assert.deepEqual(firstEl, firstEl.kit.el, 'first kit\'s el still references the first el');
    });

});