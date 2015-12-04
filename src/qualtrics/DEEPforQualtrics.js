// DEEPforQualtrics.js is the code for Qualtrics that is meant to be pasted
// into Qualtrics' JS field.
//
// It includes DEEPCore, DEEPTutorial, and DEEPQualtrics.

Qualtrics.SurveyEngine.addOnload(function()
{
  var DEEPLoaded = false;
  var skipTutorialMode = false;
  var debugMode = true;

  //=require ../DEEPCore.js
  //=require ../DEEPTutorial.js
  //=require ../DEEPQualtrics.js

  // ==============================================
  // ============== Helper Functions ==============
  // ==============================================

  var qualtricsEngine = this;

  // jQuery Randomize function
  // https://stackoverflow.com/questions/1533910/randomize-a-sequence-of-div-elements-with-jquery
  (function($) {
    $.fn.randomize = function(selector){
      (selector ? this.find(selector) : this).parent().each(function(){
          $(this).children(selector).sort(function(){
              return Math.random() - 0.5;
          }).detach().appendTo(this);
      });

      return this;
  };
  })(jQuery)

  // ==================================
  // ============== Init ==============
  // ==================================

  if (window.DEEPLoaded) {
    alert("DEEP cannot be loaded twice on this page.");
  } else {
    window.DEEPLoaded = true;

    var DEEP = new DEEPQualtrics(qualtricsEngine);
    DEEP.setup();
  }
});
