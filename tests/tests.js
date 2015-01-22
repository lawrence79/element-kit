"use strict";

// set config options
require.config({
    'baseUrl': '../',
    'paths': {
        qunit: 'tests/libs/qunit/qunit-require',
        sinon: 'tests/libs/sinon/sinon',
        'test-utils': 'tests/libs/test-utils'
    },
    shim: {
        sinon: {
            exports: 'sinon'
        }
    }
});

// require each test
require([
    'tests/element-kit-tests',
    'tests/element-tests'
], function() {
    QUnit.config.requireExpects = true;
    QUnit.start();
});