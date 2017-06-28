//use nodejs's require command to bring in gulp library & assign it to a variable called gulp.
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('pngcrush'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    cleanCSS = require('gulp-clean-css'),
    compass = require('gulp-compass'),
    sass = require('gulp-ruby-sass'),
    less = require('gulp-less');

//making declaration of necessary variables that will be used later on in our workflow.
var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir;

//check to see that environment variables is set, if not set it to development environment
var env = process.env.NODE_ENV || 'development';

//using a conditional to modify how the output is used
 if (env==='development')  {
     outputDir = 'builds/development/';
 } else {
     outputDir = 'builds/production/';
 }

 //javascript files that need to be combined
jsSources = [
    'components/js/jquery.js',
    'components/js/alert.js',
    'components/js/button.js',
    'components/js/carousel.js',
    'components/js/collapse.js',
    'components/js/dropdown.js',
    'components/js/modal.js',
    'components/js/tooltip.js',
    'components/js/scrollspy.js',
    'components/js/tab.js',
    'components/js/popover.js'
];

//custom js files that needs to be processed
customJsSources = [
    'components/js/custom.js'
];

//sass files that need to be processed and compiled
sassSources = [
    'components/sass/bootstrap.scss',
    'components/sass/custom/custom.scss',
    'components/sass/fontawesome/font-awesome.scss'
];

//html files that need to be processed
htmlSources = [outputDir + '*.html'];

gulp.task('html', function() {
    //set input sources to html files
    gulp.src('builds/development/*.html')
        //if the environment is production then minify the html
        .pipe(gulpif(env === 'production', minifyHTML()))
        //send the minified html files to production folder
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        //pipe the sources to livereload
        .pipe(connect.reload())
});

gulp.task('sass', () =>
    //specify where the sass files are located & convert the sass files to css files
    sass(sassSources, {
            style: 'expanded'
        })
        //spit log message if there are any errors
        .on('error', sass.logError)
        //autoprefix the sass files
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        //output final css files to destination folder
        .pipe(gulp.dest(outputDir + 'css'))
         //do a reload on the server
        .pipe(connect.reload())
);


gulp.task('minify-css', function() {
    //set input sources to css files
     return gulp.src('builds/development/css/*.css')
    //minify the css
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(outputDir + 'css'));
});

gulp.task('combine-js', function() {
    //gather input sources to be concatenated
    gulp.src(jsSources, customJsSources)
        //concatenate js file into a bootstrap.js file
        //pipe method will send output of previous function to the function below
        .pipe(concat('bootstrap.js'))
        //use conditional to determine whether to minify the file or not based on the environment settings
        .pipe(gulpif(env === 'production', uglify()))
        //output final file to destination folder
        .pipe(gulp.dest(outputDir + 'js'))
        //do a reload on the server
        .pipe(connect.reload())
});

gulp.task('process-js', function() {
    //gather javascript sources to be uglified
    gulp.src(customJsSources)
        .pipe(gulpif(env === 'production', uglify()))
        //output final file to destination folder
        .pipe(gulp.dest(outputDir + 'js'))
        //do a reload on the server
        .pipe(connect.reload())
}); 

gulp.task('log', function(){
    //output piece of text to the console
    gutil.log('Workflows are awesome');
});

gulp.task('images', function() {
    //set input files to the folders in images folder & any folder with (.) in it
    gulp.src('builds/development/images/**/*.*')
        // if its in production run image minification
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngcrush()]
        })))
        //if its in production send the minified images to their destination in production folder
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload())
}); 

gulp.task('compass', function(){
    //specify where the sass files are located
    gulp.src(sassSources)
        //convert the sass files to css files
        .pipe(compass({
            sass: 'components/sass',
            image: 'builds/development/images',
            style: 'expanded'
        }))
        //spit log message if there are any errors
        .on('error', gutil.log)
        //autoprefix the sass files
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        //output final files to destination folder
        .pipe(gulp.dest(outputDir + 'css'))
        //do a reload on the server
        .pipe(connect.reload())
});  



gulp.task('connect', function() {
    //use connect variable's of the server method to create a server
    connect.server({
        //specify the root of your application
        root: outputDir,
        //turn on livereload feature
        livereload: true
    });
});

gulp.task('watch', function() {
    //when any sassSources file changes run less method
    gulp.watch(sassSources, ['sass']);
    //when any jsSources file changes run combine-js method
    gulp.watch(jsSources, ['combine-js']);
    //when any customJsSources file changes run process-js method
    gulp.watch(customJsSources, ['process-js']);
    //when any file with a .scss extension changes, we run the sass task
    gulp.watch('components/sass/*.scss', ['sass']);
    //when any html file changes do a livereload
     gulp.watch(htmlSources, ['html']);
    //when any image file changes do a livereload
    gulp.watch('builds/development/images/**/*.*', ['images']);
});


//custom gulp task to run all tasks
gulp.task('default', ['html', 'sass', 'combine-js', 'process-js', 'log', 'images', 'connect', 'watch', 'minify-css']);

