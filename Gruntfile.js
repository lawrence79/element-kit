var path = require('path');

var banner = '/** \n' +
    '* ElementKit - v<%= pkg.version %>.\n' +
    '* <%= pkg.repository.url %>\n' +
    '* Copyright <%= grunt.template.today("yyyy") %> Mark Kennedy. Licensed MIT.\n' +
    '*/\n';

module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: ['dist'],
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        dest: 'dist',
                        src: [
                            'element-kit.js'
                        ]
                    }
                ]
            },
            'libs': {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/requirejs',
                        dest: 'external/requirejs',
                        src: ['require.js']
                    }
                ]
            },
            'test-libs': {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/qunit/qunit',
                        dest: 'tests/libs/qunit',
                        src: ['**/*']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/sinonjs',
                        dest: 'tests/libs/sinon',
                        src: ['sinon.js']
                    }
                ]
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            my_target: {
                files: {
                    'dist/element-kit.min.js': ['src/element-kit.js']
                }
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
        },
        connect: {
            test: {
                options: {
                    hostname: 'localhost',
                    port: 7000
                }
            },
            local: {
                options: {
                    keepalive: true,
                    options: { livereload: true }
                }
            }
        },
        qunit: {
            local: {
                options: {
                    urls: [
                        'http://localhost:7000/tests/index.html'
                    ]
                }
            },
            build: {
                options: {
                    urls: [
                        'http://localhost:7000/tests/index-build.html'
                    ]
                }
            }
        },
        usebanner: {
            all: {
                options: {
                    banner: banner,
                    linebreak: false
                },
                files: {
                    src: [ 'dist/element-kit.js']
                }
            }
        },
        release: {
            options: {
                additionalFiles: ['bower.json'],
                tagName: 'v<%= version %>',
                commitMessage: 'release <%= version %>',
                npm: false
            }
        }
    });

    // Load grunt tasks from node modules
    require( "load-grunt-tasks" )( grunt, {
        loadGruntTasks: {
            pattern: 'grunt-*'
        }
    } );

    // Default grunt
    grunt.registerTask( "build", [
        "clean",
        "copy",
        "uglify",
        "usebanner:all",
        "connect:test",
        "qunit:build"
    ]);

    grunt.registerTask( "server", [
        "connect:local"
    ]);

    grunt.registerTask( "test", [
        "connect:test",
        "qunit:local"
    ]);
};