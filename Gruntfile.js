module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildName: 'matter',
    concat: {
      build: {
        options: {
          process: function(src, filepath) {
            return '// Begin ' + filepath + '\n\n' + src + '\n\n;   // End ' + filepath + '\n\n';
          }
        },
        src: ['src/**/*.js', '!src/module/*'],
        dest: 'build/<%= buildName %>.js'
      },
      pack: {
        options: {
          banner: '/**\n* <%= buildName %>.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n',
        },
        src: ['src/module/Intro.js', 'build/<%= buildName %>.js', 'src/module/Outro.js'],
        dest: 'build/<%= buildName %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/**\n* <%= buildName %>.min.js <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n',
      },
      build: {
        src: 'build/<%= buildName %>.js',
        dest: 'build/<%= buildName %>.min.js'
      }
    },
    copy: {
      demo: {
        src: 'build/<%= buildName %>.js',
        dest: 'demo/js/lib/<%= buildName %>.js'
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
          open: 'http://localhost:9000/demo/dev.html',
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
        tasks: ['set_config:buildName:matter-dev','build']
      },
      demo: {
        files: ['build/matter.js', 'demo/js/**/*.html', 'demo/js/**/*.js', 'demo/css/**/*.css']
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>.js Physics Engine API Documentation',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'src',
          themedir: 'matter-doc-theme',
          outdir: 'doc',
          linkNatives: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', ['concat', 'uglify', 'copy']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('dev', ['set_config:buildName:matter-dev', 'build', 'connect:watch', 'watch']);
  grunt.registerTask('doc', ['yuidoc']);

  grunt.registerTask('set_config', 'Set a config property.', function(name, val) {
    grunt.config.set(name, val);
  });
};