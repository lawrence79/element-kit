module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        bt: {
            dist: 'dist',
            src: ['src/element-kit.js'],
            tests: {
                qunit: ['tests/*.js']
            }
        }
    });

    require("load-grunt-tasks")(grunt);
};