var gulp    = require('gulp'),
    include = require('gulp-include'),
    rename  = require('gulp-rename'),
    zip     = require('gulp-zip');

// Qualtrics compilation
gulp.task('qualtrics', function() {
  // Compile DEEPforQualtrics.js
  
  gulp.src("src/qualtrics/DEEPforQualtrics.js")
    .pipe(include())
      .on('error', console.log)
    .pipe(gulp.dest("dist/qualtrics"));
});

// LimeSurvey compilation
gulp.task('limesurvey', function() {
  
  // Move the LimeSurvey plugin framework folder
  gulp.src('src/limesurvey/**/*')
    .pipe(gulp.dest('dist/limesurvey/DEEP'));

  // Copy DEEPCore, DEEPTutorial, and DEEPLimeSurvey
  gulp.src('src/DEEPCore.js')
    .pipe(gulp.dest('dist/limesurvey/DEEP/assets'));

  gulp.src('src/DEEPTutorial.js')
    .pipe(gulp.dest('dist/limesurvey/DEEP/assets'));

  gulp.src('src/DEEPLimeSurvey.js')
    .pipe(gulp.dest('dist/limesurvey/DEEP/assets'));

  // Zip up the DEEP folder to DEEP.zip
  return gulp.src('dist/limesurvey/DEEP/**/*')
        .pipe(zip('DEEP.zip'))
        .pipe(gulp.dest('dist/limesurvey'));
});

gulp.task('default', ['qualtrics', 'limesurvey']);