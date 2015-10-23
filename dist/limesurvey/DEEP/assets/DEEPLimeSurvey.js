// ============================================
// ============== DEEPLimeSurvey ==============
// ============================================

/**
 * Initializes DEEPLimeSurvey, which is the system that
 * connects to the Qualtrics survey and acts as the
 * middleman between DEEPCore and the Qualtrics survey.
 * @param {String} questionCode The LimeSurvey question code for the DEEP input.
 * @constructor
 */
var DEEPLimeSurvey = function(questionCode) {
  this.questionCode = questionCode;

  // Set modes: skipTutorialMode
  if (typeof skipTutorialMode != 'undefined' && skipTutorialMode === true) {
    this.skipTutorialMode = true;
  }

  // Set modes: debugMode
  if (typeof debugMode != 'undefined' && debugMode === true) {
    this.debugMode = true;
  }
}

/**
 * Set up the DEEPLimeSurvey system. Stores the DEEP ID and bootstraps the UI.
 * Checks that the DEEP ID is of a valid type and begins the tutorial.
 */
DEEPLimeSurvey.prototype.setup = function() {
  this.DEEPID = this.questionCode;

  // Build out UI framework
  this.bootstrapUI();

  // Validate that the DEEP ID is correct
  // If correctly validated, it will also set DEEPQuestionCount and DEEPType
  if (this.validateDEEPID()) {
    this.beginTutorial();
  }
}

/**
 * Bootstraps the UI framework for DEEP. Removes the Qualtrics next button,
 * hides the question container, and injects the HTML/CSS for DEEP.
 */
DEEPLimeSurvey.prototype.bootstrapUI = function() {
  var self = this;

  // Disable and hide the next button
  jQuery('#movenextbtn, #movesubmitbtn').hide();

  // Initialize DEEP UI framework
  jQuery('.DEEP-answer').after(jQuery(this.HTML.bootstrap));

  // Hide the DEEP answer
  jQuery('.DEEP-answer').hide();
}

/**
 * Begins the tutorial prior to the main DEEP process. Hides the main DEEP
 * content container, and initializes the DEEPTutorial, passing in the
 * beginDEEP() function as the completion callback for when DEEPTutorial
 * finishes.
 */
DEEPLimeSurvey.prototype.beginTutorial = function() {
  var self = this;

  // Hide the DEEP-content container in preparation for the tutorial
  jQuery('.DEEP-content').hide();

  if (this.skipTutorialMode) {
    // Go directly to DEEP
    this.beginDEEP();
  } else {
    // Call a new DEEPTutorial passing in the completion callback this.beginDEEP();
    this.DEEPTutorial = new DEEPTutorial(this.DEEPType, function() { self.beginDEEP(); });
    this.DEEPTutorial.begin();
  }
}

/**
 * Begins the DEEP process. Adds click hooks to the radio buttons, adds the
 * hook to the next button, and initializes the DEEP system by calling
 * DEEPCore passing in the DEEP Type and the number of questions. Gets the
 * first question from DEEPCore and updates the choices shown in the UI.
 */
DEEPLimeSurvey.prototype.beginDEEP = function() {
  var self = this;

  // Show DEEP-content again
  jQuery('.DEEP-content').show();

  // Add click hooks
  jQuery('.DEEP-choice-input').click(function(el) {
    // Get value
    var selectedChoice = self.getSelectedChoice();
    if (selectedChoice !== null) {
      // Set the currently selected radio button's label as selected
      jQuery('.DEEP-choice-label').removeClass('DEEP-choice-label-selected');
      jQuery('#DEEP-choice-label-' + selectedChoice).addClass('DEEP-choice-label-selected');
    }
  });

  // Next button click hook
  jQuery('#DEEP-next-button').click(function(el){
    self.submitChoice();
  });

  // Initialize DEEP
  this.DEEPCore = new DEEPCore(this.DEEPType, this.DEEPQuestionCount);

  // Call beginDEEP, which will return an array of the questions
  var firstQuestion = this.DEEPCore.beginDEEP();
  this.updateChoices(firstQuestion[0], firstQuestion[1]);
  
  // Scroll to top
  window.scrollTo(0, 0);
}

/**
 * Returns the currently selected choice in the choice set.
 * @return {Number} The ID of the currently selected choice, 1 or 2.
 */
DEEPLimeSurvey.prototype.getSelectedChoice = function() { 
  var selectChoice = jQuery("input[type='radio'][name='DEEP-choice-selector']:checked");
  if (selectChoice.length > 0) {
    var choice = parseInt(selectChoice.val());
    if (choice === 0 || choice === 1) {
      return choice;
    }
  } else {
    return null;
  }
}

/**
 * Handler for the Submit button that is clicked after a user selects a
 * choice. Checks if a choice has been selected (if not, shows an error),
 * then calls DEEPCore.saveChoice() to save the selected choice. Then,
 * to display the next choice, it clears the next choice and gets the next
 * question from DEEPCore. DEEPCore can return a set of choices, which
 * then get passed to updateChoices(), or it can also return false, which
 * means that DEEP is over, after which DEEPLimeSurvey will call finish() to
 * complete the DEEP process.
 */
DEEPLimeSurvey.prototype.submitChoice = function() {
  // Get the selectedChoice
  var selectedChoice = this.getSelectedChoice();

  if (selectedChoice === null) {
    // User did not select a choice
    this.showError();
  } else {
    // Save the choice
    this.DEEPCore.saveChoice(selectedChoice);

    // Clear the choice for the next one
    this.clearChoice();

    // Get next question
    var nextQuestion = this.DEEPCore.nextQuestion();

    if (nextQuestion === false) {
      // DEEPCore says that we reached the end of DEEP
      // So, call finish() which will get the JSON and
      // deconstruct DEEP.
      this.finish();
    } else if (nextQuestion.constructor === Array && nextQuestion.length == 2) {
      // Call updateChoices with the two new choices
      this.updateChoices(nextQuestion[0], nextQuestion[1]);
    }
  }
}

/**
 * Clears the choices of their values and of error messages.
 */
DEEPLimeSurvey.prototype.clearChoice = function() {
  // Unselect the choice label
  jQuery('.DEEP-choice-label').removeClass('DEEP-choice-label-selected');

  // Unselect the radio button
  var selectChoice = jQuery("input[type='radio'][name='DEEP-choice-selector']:checked");
  if (selectChoice.length > 0) {
    selectChoice.prop('checked', false);
  }

  // Clear errrs
  jQuery('.DEEP-error').hide();
  jQuery('.DEEP-error').text('');
  jQuery('.DEEP-choice-table').removeClass('DEEP-choice-table-error');
}

/**
 * Shows an error message on the question.
 */
DEEPLimeSurvey.prototype.showError = function() {
  // Show error message
  jQuery('.DEEP-error').show();
  jQuery('.DEEP-error').text('Please answer this question.')

  // Highlight table
  jQuery('.DEEP-choice-table').addClass('DEEP-choice-table-error');
}

/**
 * Updates the choices given in the UI. In DEEP Time, it randomizes the order
 * of the choices.
 * @param  {string} choice0 HTML text for the first choice.
 * @param  {string} choice1 HTML text for the second choice.
 */
DEEPLimeSurvey.prototype.updateChoices = function(choice0, choice1) {
  jQuery('#DEEP-choice-label-0').html(choice0);
  jQuery('#DEEP-choice-label-1').html(choice1); 

  if (this.DEEPCore.isDEEPTime()) {
    // Randomize placement if DEEP Time
    jQuery('.DEEP-choice-cell').randomize();
  }
}

/**
 * Finishes the DEEP process and deconstructs DEEP. First, it gets the JSON
 * string from DEEPCore, inserts it into the text area that DEEP was called
 * from, enables the Qualtrics next button, hides the question container,
 * destroys the DEEP UI, and clicks the next button to submit the data.
 */
DEEPLimeSurvey.prototype.finish = function() {
  // Get the JSON from Core
  var dataJSON = this.DEEPCore.getJSON();

  // Show the answer container
  jQuery('.DEEP-answer').show();

  // Apply CSS to the textarea so it won't show up
  jQuery('.DEEP-answer textarea').css('height','0').css('width','0').css('visibility','hidden').css('overflow','hidden');

  // Inject JSON into answer field
  jQuery('.DEEP-answer textarea').val(dataJSON);

  // Unhide and enable the next button
  jQuery('#movenextbtn, #movesubmitbtn').show();

  // Destroy the DEEP UI
  jQuery('#DEEP-question').remove();

  // Show the completion message
  jQuery('.DEEP-answer').append('<p>You may now continue the survey.</p>');
}

/**
 * Validates the DEEP ID by using a regex to find the DEEP Type and number of
 * questions; saves them to this.DEEPType and this.DEEPQuestionCount if
 * successfully found, or returns false if not.
 * @return {Boolean} True if the DEEP ID was valid, false if not.
 */
DEEPLimeSurvey.prototype.validateDEEPID = function() {
  // Validate that the DEEPID given is valid
  // DEEPID *may* be in the format "DEEPCore12"
  // First validate that it begins with DEEP
  if (this.DEEPID) {
    // Next, run the regex to pull out the name of the DEEP variant and the number of questions
    var validationRegex = /DEEP(TIME|RISK)([0-9]{1,2})/i;

    // Now, match
    var validationCheck = this.DEEPID.match(validationRegex);

    // Check if it worked
    if (validationCheck == null) {
      alert('This survey has encountered an error. Please contact the survey administrator with the following error message: "DEEP was not initialized correctly. Please check the DEEP ID on your survey."');
      return false;
    } else {
      // Correctly validated
      // Store the type and questions
      this.DEEPType = validationCheck[1].toUpperCase();
      this.DEEPQuestionCount = validationCheck[2];
      return true;
    }
  } else {
    alert('This survey has encountered an error. Please contact the survey administrator with the following error message: "DEEP was not initialized correctly. Please check the DEEP ID on your survey."');
    return false;
  }
}

/**
 * Stores the setting for skipping the tutorial.
 * @type {Boolean}
 */
DEEPLimeSurvey.prototype.skipTutorialMode = false;

/**
 * Stores the setting for debug mode.
 * @type {Boolean}
 */
DEEPLimeSurvey.prototype.debugMode = false;

/**
 * Stores boilerplate HTML code.
 * @type {Object}
 */
DEEPLimeSurvey.prototype.HTML = {};

/**
 * The standard framework used when setting up DEEP inside Qualtrics.
 * @type {String}
 */
DEEPLimeSurvey.prototype.HTML.bootstrap =  '<div class="DEEP-block" id="DEEP-question">\
                                              <div class="DEEP-content">\
                                                <div class="DEEP-instructions">\
                                                  Please consider the two options below. Which of these two options do you find more attractive?\
                                                </div>\
                                                <div class="DEEP-error">\
                                                </div>\
                                                <div class="DEEP-choices">\
                                                  <table border="0" cellpadding="0" cellspacing="20" class="DEEP-choice-table">\
                                                    <tr>\
                                                      <td width="50%" class="DEEP-choice-cell">\
                                                        <label for="DEEP-choice-0" class="DEEP-choice-label" id="DEEP-choice-label-0">0</label>\
                                                        <input type="radio" name="DEEP-choice-selector" class="DEEP-choice-input" id="DEEP-choice-0" value="0">\
                                                      </td>\
                                                      <td width="50%" class="DEEP-choice-cell">\
                                                        <label for="DEEP-choice-1" class="DEEP-choice-label" id="DEEP-choice-label-1">1</label>\
                                                        <input type="radio" name="DEEP-choice-selector" class="DEEP-choice-input" id="DEEP-choice-1" value="1">\
                                                      </td>\
                                                    </tr>\
                                                  </table>\
                                                </div>\
                                                <div class="DEEP-buttons">\
                                                  <input type="button" class="DEEP-next-button" id="DEEP-next-button" value="Next">\
                                                </div>\
                                              </div>\
                                            </div>';