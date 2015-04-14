module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        bt: {
            dist: 'dist',
            build: {
                files: {
                    'dist/element-kit.js': ['src/**/*.js']
                },
                browserifyOptions: {
                    standalone: 'ElementKit'
                }
            },
            min: {
                files: {
                    'dist/element-kit-min.js': ['dist/element-kit.js']
                }
            },
            banner: {
                files: ['build/*']
            },
            tests: {
                mocha: {
                    src: ['tests/*.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('build-tools');
};