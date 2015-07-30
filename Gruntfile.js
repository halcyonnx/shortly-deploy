module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      dist: {
        src: [
          './public/lib/jquery.js',
          './public/lib/underscore.js',
          './public/lib/backbone.js',
          './public/lib/handlebars.js',
          './public/client/*.js'
        ],
        dest: './public/dist/production.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      client: {
        src: './public/dist/production.js', 
        dest: './public/dist/production.min.js',
      },
      lib: {
        backbone: {
          src: './public/lib/backbone.js',
          dest: './public/lib/backbone.min.js'
        },
        handlebars: {
          src: './public/lib/handlebars.js',
          dest: './public/lib/handlebars.min.js'
        },
        jquery: {
          src: './public/lib/jquery.js',
          dest: './public/lib/jquery.min.js'
        },
        underscore: {
          src: './public/lib/underscore.js',
          dest: './public/lib/underscore.min.js'
        },
      }
    },

    jshint: {
      files: [
        // Add filespec list here
        './public/**/*.js',
        './app/**/*.js',
        './lib/*.js',
        './*.js'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
        // Add filespec list here
      target: {
        files: [{
          expand: true,
          cwd: './public',
          src: ['*.css', '!*.min.css'],
          dest: './public/dist',
          ext: '.min.css'
        }]
      }
    },

    clean: {

      lib: ['./public/lib/*.js', '!./public/lib/*.min.js'],
      client: ['./public/client/*.js'],
      style: ['./public/style.css'],
      dist: ['./public/dist/*.js', '!./public/dist/*.min.js']

    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      'git-add': {
        command: 'git --no-pager add .',
        options: {
          stdout: true,
          stderr: true
        }
      },

      'git-commit': {
        command: 'git --no-pager commit -m "Deployment"',
        options: {
          stdout: true,
          stderr: true
        }
      },

      'git-push': {
        command: 'git --no-pager push azure master',
        options: {
          failOnError: true,
          stdout: true,
          stderr: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat',
    'cssmin',
    'uglify:client',
    //'clean',
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['shell']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
      // add your production server task here
      'test',
      'upload'
  ]);


};
