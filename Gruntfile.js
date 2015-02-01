module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        bt: {
            uglifyFiles: {
                'dist/element-kit.min.js': ['src/element-kit.js']
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    dir: "dist",
                    removeCombined: true,
                    optimize: 'uglify',
                    uglify: {
                        preserveComments: true,
                        ASCIIOnly: true,
                        output: 'element-kit.min.js'
                    }
                }
            }
        }
    });

    // Load grunt tasks from node modules
    require("load-grunt-tasks")(grunt);
};