module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      build: {
        options: {
          process: function(src, filepath) {
            return '// Begin ' + filepath + '\n\n' + src + '\n\n;   // End ' + filepath + '\n\n';
          }
        },
        src: ['src/**/*.js', '!src/module/*'],
        dest: 'build/<%= pkg.name %>.js'
      },
      pack: {
        options: {
          banner: '/**\n* <%= pkg.name %>.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n',
        },
        src: ['src/module/Intro.js', 'build/<%= pkg.name %>.js', 'src/module/Outro.js'],
        dest: 'build/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/**\n* <%= pkg.name %>.min.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n',
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      demo: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'demo/js/lib/<%= pkg.name %>.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['src/**/*.js', '!src/module/*']
    },
    connect: {
      watch: {
        options: {
          port: 9000,
          open: 'http://localhost:9000/demo',
          livereload: 9001
        }
      }
    },
    watch: {
      options: {
        livereload: {
          port: 9001
        }
      },
      src: {
        files: ['src/**/*.js'],
        tasks: ['concat', 'uglify', 'copy']
      },
      demo: {
        files: ['build/matter.js', 'demo/js/**/*.html', 'demo/js/**/*.js', 'demo/css/**/*.css']
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['test', 'concat', 'uglify', 'copy']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('dev', ['connect:watch', 'watch']);
};