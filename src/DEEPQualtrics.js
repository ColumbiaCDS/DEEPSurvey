// ===========================================
// ============== DEEPQualtrics ==============
// ===========================================

/**
 * Initializes DEEPQualtrics, which is the system that
 * connects to the Qualtrics survey and acts as the
 * middleman between DEEPCore and the Qualtrics survey.
 * @param {object} qualtricsEngine The Qualtrics engine. When loading inside Qualtrics.SurveyEngine, it is `this`.
 * @constructor
 */
var DEEPQualtrics = function(qualtricsEngine) {
  this.qualtricsEngine = qualtricsEngine;

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
 * Set up the DEEPQualtrics system. Stores the DEEP ID and bootstraps the UI.
 * Checks that the DEEP ID is of a valid type and begins the tutorial.
 */
DEEPQualtrics.prototype.setup = function() {
  // Save the DEEPID
  this.DEEPID = this.getDEEPID();

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
DEEPQualtrics.prototype.bootstrapUI = function() {
  var self = this;

  // Disable and hide the next button
  this.qualtricsEngine.disableNextButton();

  // Hack for next button delay Qualtrics bug
  // First, try to hide the buttons
  jQuery('#NextButton').hide();
  jQuery('#Buttons').hide();

  // We may have failed to hide the buttons due to
  // a bug in Qualtrics' page flow animation
  // So, attempt to hide the buttons every 20 milliseconds
  // This means that as soon as the button appears on
  // the screen, we fade it out
  var buttonHideInterval = setInterval(function() {
    jQuery('#NextButton').fadeOut('fast');
    jQuery('#Buttons').fadeOut('fast');
  }, 20);

  // After 5 seconds, most likely the button has come on screen
  // Cancel the buttonHideInterval so it's no longer running
  setTimeout(function() {
    clearInterval(buttonHideInterval);
  }, 5000);

  setTimeout(function() {
    jQuery('#NextButton').hide();
    jQuery('#Buttons').hide();
    $('NextButton').hide();
    $('Buttons').hide();
  }, 200);

  // Save the question container reference
  this.questionContainer = this.qualtricsEngine.getQuestionContainer();

  // Initialize DEEP UI framework
  jQuery(this.questionContainer).after(jQuery(this.HTML.bootstrap));

  // Inject CSS
  jQuery('head').append('<style>' + this.CSS.bootstrap + '</style>');

  // Hide the original question container
  jQuery(this.questionContainer).hide();
}

/**
 * Begins the tutorial prior to the main DEEP process. Hides the main DEEP
 * content container, and initializes the DEEPTutorial, passing in the
 * beginDEEP() function as the completion callback for when DEEPTutorial
 * finishes.
 */
DEEPQualtrics.prototype.beginTutorial = function() {
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
DEEPQualtrics.prototype.beginDEEP = function() {
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
DEEPQualtrics.prototype.getSelectedChoice = function() {
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
 * means that DEEP is over, after which DEEPQualtrics will call finish() to
 * complete the DEEP process.
 */
DEEPQualtrics.prototype.submitChoice = function() {
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
DEEPQualtrics.prototype.clearChoice = function() {
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
DEEPQualtrics.prototype.showError = function() {
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
DEEPQualtrics.prototype.updateChoices = function(choice0, choice1) {
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
DEEPQualtrics.prototype.finish = function() {
  // Get the JSON from Core
  var dataJSON = this.DEEPCore.getJSON();

  // Inject JSON into answer field
  this.qualtricsEngine.setChoiceValue('TEXT',dataJSON);

  // Unhide and enable the next button
  jQuery('#Buttons').show();
  jQuery('#NextButton').show();
  $('Buttons').show();
  $('NextButton').show();
  this.qualtricsEngine.enableNextButton();

  // Show the original question container
  jQuery(this.questionContainer).show();

  // Apply CSS to this question container so it won't show up
  jQuery(this.questionContainer).css('height','0').css('width','0').css('position','absolute').css('margin-left','-9999px').css('overflow','hidden');

  // Add waiting message
  jQuery('#DEEP-question').after('<p style="margin-top: 30px;">Saving survey. Please wait a moment...</p>');

  // Destroy the DEEP UI
  jQuery('#DEEP-question').remove();

  // Unset window.DEEPLoaded
  window.DEEPLoaded = false;

  // Advance to the next page
  this.qualtricsEngine.clickNextButton();
}

/**
 * Gets the DEEP ID, which is contained in the Qualtrics question text.
 * @return {String} The DEEP ID, or whatever is contained in the Qualtrics
 *                  question text.
 */
DEEPQualtrics.prototype.getDEEPID = function () {
  // Find the DEEPID
  var qualtricsQuestionInfo = this.qualtricsEngine.getQuestionInfo();
  return qualtricsQuestionInfo.QuestionText;
}

/**
 * Validates the DEEP ID by using a regex to find the DEEP Type and number of
 * questions; saves them to this.DEEPType and this.DEEPQuestionCount if
 * successfully found, or returns false if not.
 * @return {Boolean} True if the DEEP ID was valid, false if not.
 */
DEEPQualtrics.prototype.validateDEEPID = function() {
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
DEEPQualtrics.prototype.skipTutorialMode = false;

/**
 * Stores the setting for debug mode.
 * @type {Boolean}
 */
DEEPQualtrics.prototype.debugMode = false;

/**
 * Stores boilerplate HTML code.
 * @type {Object}
 */
DEEPQualtrics.prototype.HTML = {};

/**
 * The standard framework used when setting up DEEP inside Qualtrics.
 * @type {String}
 */
DEEPQualtrics.prototype.HTML.bootstrap =  '<div class="DEEP-block" id="DEEP-question">\
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

/**
 * Stores boilerplate CSS code.
 * @type {Object}
 */
DEEPQualtrics.prototype.CSS = {};

/**
 * The standard CSS used when setting up DEEP inside Qualtrics.
 * @type {String}
 */
DEEPQualtrics.prototype.CSS.bootstrap =  'div.DEEP-content {\
                                          }\
                                          div.DEEP-instructions {\
                                            padding: 20px;\
                                          }\
                                          div.DEEP-error {\
                                            text-align: center;\
                                            color: #ff0000;\
                                            margin: 10px 0;\
                                            display: none;\
                                          }\
                                          \
                                          table.DEEP-choice-table {\
                                            width: 100%;\
                                          }\
                                          table.DEEP-choice-table.DEEP-choice-table-error {\
                                            background-color: #e5efff;\
                                          }\
                                          \
                                          .DEEP-choice-label {\
                                            padding: 20px;\
                                            background-color: #f9f9f9;\
                                            border: 1px solid #ccc;\
                                            border-radius: 2px;\
                                            display: block;\
                                            text-align: center;\
                                            transition: background .3s, border .3s;\
                                            text-shadow: none !important;\
                                            color: #111 !important;\
                                          }\
                                          \
                                          .DEEP-choice-label:hover {\
                                            background-color: #E5EFFF;\
                                            border-color: #91B5F5;\
                                            cursor: pointer;\
                                          }\
                                          \
                                          .DEEP-choice-label-selected {\
                                            background-color: #4B86EE;\
                                            border-color: #1351C1;\
                                            color: #fff !important;\
                                          }\
                                          .DEEP-choice-label-selected:hover {\
                                            background-color: #4B86EE;\
                                            border-color: #1351C1;\
                                          }\
                                          .DEEP-choice-input {\
                                            position: absolute;\
                                            margin-left: -9999px;\
                                            height: 0px;\
                                            width: 0px;\
                                          }\
                                          \
                                          .DEEP-buttons {\
                                            margin-top: 20px;\
                                            text-align: center;\
                                          }\
                                          .DEEP-next-button {\
                                            border: none;\
                                            color: #fff !important;\
                                            font-size: 16px;\
                                            padding: 8px 20px;\
                                            border-radius: 4px;\
                                            background-color: #4378D6;\
                                            transition: background .3s;\
                                            cursor: pointer;\
                                            outline: none;\
                                            -webkit-appearance: none;\
                                            text-align: center;\
                                          }\
                                          \
                                          .DEEP-next-button:hover {\
                                            background-color: #3667BC;\
                                          }';
