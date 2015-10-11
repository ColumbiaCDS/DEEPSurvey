// ==========================================
// ============== DEEPTutorial ==============
// ==========================================

/**
 * DEEPTutorial is the system that controls the initial tutorial, i.e. the
 * introduction and the warmup exercise that the user goes through before
 * starting DEEP. DEEPTutorial manages mostly its own HTML/CSS, and does the
 * flow logic and validates the warmup exercise answers to check for
 * correctness, and also handles error messages. It holds the HTML templates
 * for the introduction and warmup exercise for DEEP Time and DEEP Risk,
 * and checks answers against the correct answers, hard-coded in this class.
 * Once the tutorial is over, it executes finishCallback() which calls back
 * to the caller's finish function (the platform's beginDEEP() function).
 * <p>
 * DEEPTutorial piggybacks off of some CSS provided by the platform's CSS,
 * .DEEP-choice-label, .DEEP-choice-input, and .DEEP-next-button. This way,
 * DEEPTutorial can reduce code duplication. The platform must have these
 * fields styled. All other CSS is provided by DEEPTutorial.
 * <p>
 * Lifecycle: Called by the platform, initializes boilerplate HTML, injects
 * CSS, initializes introduction, waits for user to click Continue, renders
 * the warmup exercise and attaches click handlers, waits for user response,
 * validates answers and shows error messages, and finally calls the method
 * that the platform (that originally called DEEPTutorial) specified as the
 * callback to execute when finished.
 * @param {String} DEEPType         The type of DEEP, either TIME or RISK.
 * @param {Function} finishCallback The function to execute when finished
 *                                  with the tutorial; usually the platform's
 *                                  beginDEEP() function.
 * @constructor
 */
var DEEPTutorial = function(DEEPType, finishCallback) {
  // Set the DEEP Type and the completion callback
  this.DEEPType = DEEPType;
  this.finishCallback = finishCallback;
}

/**
 * Begins the tutorial process. Injects CSS, adds boilerplate HTML, and adds
 * the HTML for the intro for the current DEEP type.
 */
DEEPTutorial.prototype.begin = function() {
  var self = this;

  // Inject CSS
  jQuery('head').append('<style>' + this.CSS.bootstrap + '</style>');

  // Inject tutorial boilerplate inside the .DEEP-block
  jQuery('.DEEP-block').append(this.HTML.bootstrap);

  // Inject HTML of the introduction for the corresponding DEEP type
  jQuery('.DEEP-tutorial').html(this.HTML[this.DEEPType.toLowerCase()].introduction);

  // Add click handler to hook up the submit button to the showWarmup() function
  jQuery('#DEEP-tutorial-introduction-button').click(function(){
    self.showWarmup();
  });
}

/**
 * Shows the warmup exercise and attaches the click handlers for the radio
 * select buttons and the submit button.
 */
DEEPTutorial.prototype.showWarmup = function() {
  var self = this;

  // Inject warmup HTML, replacing introduction HTML
  jQuery('.DEEP-tutorial').html(this.HTML[this.DEEPType.toLowerCase()].warmup);

  // Attach click handler to radio buttons
  jQuery('.DEEP-tutorial-question .DEEP-choice-input').click(function(el) {
    // Get the ID for the clicked element
    var choiceID = jQuery(this).attr('id');

    // Remove selected class from all choice labels in this element's parent (the question block)
    jQuery(this).parent().find('.DEEP-choice-label').removeClass('DEEP-choice-label-selected');

    // Find the label that set its "for" to this elemetn's ID and add the selected class
    jQuery('label[for="' + choiceID + '"]').addClass('DEEP-choice-label-selected');
  });

  // Add click hook to the next button to submit the warmup
  jQuery('#DEEP-tutorial-warmup-button').click(function(el) {
    self.submitWarmup();
  });
}

/**
 * Submits the warmup exercise. First validates the answers to make sure they
 * are correct, and if so, calls the completion callback given by the caller.
 */
DEEPTutorial.prototype.submitWarmup = function() {
  // Validate warmup
  if (this.validateWarmup()) {
    // Warmup validated, destroy the tutorial UI
    jQuery('.DEEP-tutorial').remove();

    // Call the callback for continuing DEEP
    this.finishCallback();
  }
}

/**
 * Validates the answers given in the warmup exercise. Checks answers against
 * the warmupAnswers array for DEEP Time or DEEP Risk, which contains the
 * correct answers ordered by the question index. Shows an error message and
 * returns false if there are errors; returns true if all answers match up.
 * @return {Boolean} Returns true if all answers are correct.
 */
DEEPTutorial.prototype.validateWarmup = function() {
  var validated = true;

  // Get the set of answers (an array)
  var answerSet = this.warmupAnswers[this.DEEPType.toLowerCase()];

  // Next, clear out all existing errors
  jQuery('.DEEP-tutorial-question-error').removeClass('DEEP-tutorial-question-error');
  jQuery('.DEEP-tutorial-error').remove();

  // Iterate through each question and check its value
  for (var i = 0; i < answerSet.length; i++) {
    // Get the answer value at this index
    var answerValue = jQuery('input[type="radio"][name="DEEP-tutorial-' + i + '-choice-selector"]:checked');

    // Check if it's null or if not, if it's the wrong value
    if (answerValue === null || (answerValue != null && answerSet[i] != answerValue.val())) {
      // Get the ID of the parent element and add the error class
      jQuery('#DEEP-tutorial-question-' + i).addClass('DEEP-tutorial-question-error');

      // Before that element, add the error message
      jQuery('#DEEP-tutorial-question-' + i).before('<div class="DEEP-tutorial-error">Please answer this question.</div>');

      // Set error flag
      validated = false;
    }
  }

  return validated;
}

/**
 * Contains the answers for the warmup exercises for the DEEP types.
 * @type {Object}
 */
DEEPTutorial.prototype.warmupAnswers = {};

/**
 * Contains the answers for the warmup exercise for DEEP Time.
 * @type {Array}
 */
DEEPTutorial.prototype.warmupAnswers.time = ["30", "0", "20"];

/**
 * Contains the answers for the warmup exercise for DEEP Risk.
 * @type {Array}
 */
DEEPTutorial.prototype.warmupAnswers.risk = ["20", "true", "90", "-1"];

/**
 * Helper method that returns whether the current DEEP
 * variant is DEEP Time or not.
 * @return {Boolean} true if the current DEEP variant is DEEP Time; false if not.
 */
DEEPCore.prototype.isDEEPTime = function() {
  return this.DEEPType == "TIME";
}

/**
 * Helper method that returns whether the current DEEP
 * variant is DEEP Risk or not.
 * @return {Boolean} true if the current DEEP variant is DEEP Risk; false if not.
 */
DEEPCore.prototype.isDEEPRisk = function() {
  return this.DEEPType == "RISK";
}

/**
 * Stores boilerplate HTML code.
 * @type {Object}
 */
DEEPTutorial.prototype.HTML = {};

/**
 * Stores HTML code for the framework around the tutorial.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.bootstrap =  '<div class="DEEP-tutorial"></div>';

/**
 * Stores boilerplate HTML code for DEEP Time.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.time = {};

/**
 * Stores HTML for DEEP Time's introduction.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.time.introduction =  '<p>You will now be presented with a series of questions about your time preferences.  Each question consists of options to compare.  All options are about receiving a certain amount at a specific time.  For example, an option could be: "Receive $10 in 3 days," while another option could be: "Receive $5 today."</p>\
                                                  <p>Please click below to get started.</p>\
                                                  <div class="DEEP-buttons">\
                                                    <input type="button" class="DEEP-next-button" id="DEEP-tutorial-introduction-button" value="Continue">\
                                                  </div>';

/**
 * Stores HTML for DEEP Time's warmup exercise.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.time.warmup =  '<h2>Warm Up Questions</h2>\
                                            <div class="DEEP-tutorial-content">\
                                              <p>To make sure that you understand your task, we would like to ask you a few simple preliminary questions before we get started. You will continue with the survey only if you respond correctly to these questions.</p>\
                                              <p>Consider the following choice:</p>\
                                              <table border="0" class="DEEP-tutorial-warmup-table">\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-header">Option A</td>\
                                                  <td class="DEEP-tutorial-warmup-table-header">Option B</td>\
                                                </tr>\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-content">Receive <strong>$30 in 3 months</strong></td>\
                                                  <td class="DEEP-tutorial-warmup-table-content">Receive <strong>$5 today</strong></td>\
                                                </tr>\
                                              </table>\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-0">\
                                              <p>1. Which of the following is the most you could receive?</p>\
                                              <label for="DEEP-tutorial-0-choice-1" class="DEEP-choice-label" id="DEEP-choice-0-label-1">$20</label>\
                                              <label for="DEEP-tutorial-0-choice-2" class="DEEP-choice-label" id="DEEP-choice-0-label-2">$5</label>\
                                              <label for="DEEP-tutorial-0-choice-3" class="DEEP-choice-label" id="DEEP-choice-0-label-3">$30</label>\
                                              <label for="DEEP-tutorial-0-choice-4" class="DEEP-choice-label" id="DEEP-choice-0-label-4">$0</label>\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-1" value="20">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-2" value="5">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-3" value="30">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-4" value="0">\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-1">\
                                              <p>2. Which of the following options is more attractive financially?</p>\
                                              <label for="DEEP-tutorial-1-choice-1" class="DEEP-choice-label" id="DEEP-choice-1-label-1">Receive <strong>$10 in 2 weeks</strong></label>\
                                              <label for="DEEP-tutorial-1-choice-2" class="DEEP-choice-label" id="DEEP-choice-1-label-2">Receive <strong>$10 today</strong></label>\
                                              <input type="radio" name="DEEP-tutorial-1-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-1-choice-1" value="14">\
                                              <input type="radio" name="DEEP-tutorial-1-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-1-choice-2" value="0">\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-2">\
                                              <p>3. Which of the following options is more attractive financially?</p>\
                                              <label for="DEEP-tutorial-2-choice-1" class="DEEP-choice-label" id="DEEP-choice-2-label-1">Receive <strong>$10 in 2 weeks</strong></label>\
                                              <label for="DEEP-tutorial-2-choice-2" class="DEEP-choice-label" id="DEEP-choice-2-label-2">Receive <strong>$20 in 2 weeks</strong></label>\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-1" value="10">\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-2" value="20">\
                                            </div>\
                                            <div class="DEEP-buttons">\
                                              <input type="button" class="DEEP-next-button" id="DEEP-tutorial-warmup-button" value="Submit">\
                                            </div>';

/**
 * Stores boilerplate HTML code for DEEP Risk.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.risk = {};

/**
 * Stores HTML for DEEP Risk's introduction.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.risk.introduction =  '<p>You will now be presented with a series of questions about gambles.</p>\
                                                  <p><strong>What is a gamble?</strong></p>\
                                                  <p>Each gamble has two potential outcomes. These outcomes may be gains or losses. Each of these outcomes has some chance (probability) of occurring, between 0% (no chance of occurring) and 100% (certain to occur). One of the outcomes will definitely happen, so the probabilities of the two outcomes add up to 100%.</p>\
                                                  <p>For example, one gamble could be:</p>\
                                                  <blockquote>50% chance to win $20<br>50% chance to win $5</blockquote>\
                                                  <p>The two possible outcomes of this gamble have a 50% chance of occurring, which means that in this gamble you are equally likely to win $20 or to win $5. This is equivalent to the outcome being determined by flipping a coin.</p>\
                                                  <p>Another gamble could be:</p>\
                                                  <blockquote>30% chance to win $80<br>70% chance to win $20</blockquote>\
                                                  <p>The chance to win $20 is higher than the chance to win $80 (70% vs. 30%).</p>\
                                                  <p>In both of these examples you can only win money. Other gambles might involve a chance of losing money. For example, another gamble could be:</p>\
                                                  <blockquote>10% chance to win $50<br>90% chance to lose $1</blockquote>\
                                                  <p><strong>What will I need to do?</strong></p>\
                                                  <p>We will ask you a series of questions in which you will make choices between pairs of gambles. In each question, you will indicate which of the two gambles in the pair you would rather play.</p>\
                                                  <p>First we want to make sure that you understand the task, by asking you a few questions to make sure.  Please click below to get started.</p>\
                                                  <div class="DEEP-buttons">\
                                                    <input type="button" class="DEEP-next-button" id="DEEP-tutorial-introduction-button" value="Continue">\
                                                  </div>';

/**
 * Stores HTML for DEEP Risk's warmup exercise.
 * @type {String}
 */
DEEPTutorial.prototype.HTML.risk.warmup =  '<h2>Warm Up Questions</h2>\
                                            <div class="DEEP-tutorial-content">\
                                              <p>To make sure that you understand your task, we would like to ask you a few simple preliminary questions before we get started. You will continue with the survey only if you respond correctly to these questions.</p>\
                                              <p>Consider the following gamble:</p>\
                                              <table border="0" class="DEEP-tutorial-warmup-table">\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-header">Gamble A</td>\
                                                </tr>\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-content">\
                                                    <strong>30%</strong> Chance to <strong>Win $20</strong><br>\
                                                    <strong>70%</strong> Chance to <strong>Win $5</strong><br>\
                                                  </td>\
                                                </tr>\
                                              </table>\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-0">\
                                              <p>1. What is the most money you could win if you played Gamble A?</p>\
                                              <label for="DEEP-tutorial-0-choice-1" class="DEEP-choice-label" id="DEEP-choice-0-label-1">$20</label>\
                                              <label for="DEEP-tutorial-0-choice-2" class="DEEP-choice-label" id="DEEP-choice-0-label-2">$5</label>\
                                              <label for="DEEP-tutorial-0-choice-3" class="DEEP-choice-label" id="DEEP-choice-0-label-3">$50</label>\
                                              <label for="DEEP-tutorial-0-choice-4" class="DEEP-choice-label" id="DEEP-choice-0-label-4">I would lose $1</label>\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-1" value="20">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-2" value="5">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-3" value="50">\
                                              <input type="radio" name="DEEP-tutorial-0-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-0-choice-4" value="-1">\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-1">\
                                              <p>2. Is the following statement true or false? "If I played Gamble A, I would make at least $5."</p>\
                                              <label for="DEEP-tutorial-1-choice-1" class="DEEP-choice-label" id="DEEP-choice-1-label-1">True</label>\
                                              <label for="DEEP-tutorial-1-choice-2" class="DEEP-choice-label" id="DEEP-choice-1-label-2">False</label>\
                                              <input type="radio" name="DEEP-tutorial-1-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-1-choice-1" value="true">\
                                              <input type="radio" name="DEEP-tutorial-1-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-1-choice-2" value="false">\
                                            </div>\
                                            <div class="DEEP-tutorial-content">\
                                              <p>Now consider the following gamble.</p>\
                                              <table border="0" class="DEEP-tutorial-warmup-table">\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-header">Gamble B</td>\
                                                </tr>\
                                                <tr>\
                                                  <td class="DEEP-tutorial-warmup-table-content">\
                                                    <strong>10%</strong> Chance to <strong>Win $50</strong><br>\
                                                    <strong>90%</strong> Chance to <strong>Lose $1</strong><br>\
                                                  </td>\
                                                </tr>\
                                              </table>\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-2">\
                                              <p>3. What is the chance that you would lose money playing Gamble B?</p>\
                                              <label for="DEEP-tutorial-2-choice-1" class="DEEP-choice-label" id="DEEP-choice-2-label-1">30%</label>\
                                              <label for="DEEP-tutorial-2-choice-2" class="DEEP-choice-label" id="DEEP-choice-2-label-2">70%</label>\
                                              <label for="DEEP-tutorial-2-choice-3" class="DEEP-choice-label" id="DEEP-choice-2-label-3">90%</label>\
                                              <label for="DEEP-tutorial-2-choice-4" class="DEEP-choice-label" id="DEEP-choice-2-label-4">10%</label>\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-1" value="30">\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-2" value="70">\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-3" value="90">\
                                              <input type="radio" name="DEEP-tutorial-2-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-2-choice-4" value="10">\
                                            </div>\
                                            <div class="DEEP-tutorial-question" id="DEEP-tutorial-question-3">\
                                              <p>4. What is the most <strong>likely</strong> outcome in Gamble B?</p>\
                                              <label for="DEEP-tutorial-3-choice-1" class="DEEP-choice-label" id="DEEP-choice-3-label-1">Winning $50</label>\
                                              <label for="DEEP-tutorial-3-choice-2" class="DEEP-choice-label" id="DEEP-choice-3-label-2">Winning $1</label>\
                                              <label for="DEEP-tutorial-3-choice-3" class="DEEP-choice-label" id="DEEP-choice-3-label-3">Losing $1</label>\
                                              <input type="radio" name="DEEP-tutorial-3-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-3-choice-1" value="50">\
                                              <input type="radio" name="DEEP-tutorial-3-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-3-choice-2" value="1">\
                                              <input type="radio" name="DEEP-tutorial-3-choice-selector" class="DEEP-choice-input" id="DEEP-tutorial-3-choice-3" value="-1">\
                                            </div>\
                                            <div class="DEEP-buttons">\
                                              <input type="button" class="DEEP-next-button" id="DEEP-tutorial-warmup-button" value="Submit">\
                                            </div>';

/**
 * Stores boilerplate CSS code.
 * @type {Object}
 */
DEEPTutorial.prototype.CSS = {};

/**
 * The standard CSS used when setting up the tutorial.
 * @type {String}
 */
DEEPTutorial.prototype.CSS.bootstrap = '.DEEP-tutorial {\
                                        }\
                                        \
                                        .DEEP-tutorial p {\
                                          margin-bottom: 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial h2 {\
                                          margin: 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial blockquote {\
                                          margin-bottom: 20px;\
                                          margin-left: 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial-content {\
                                          margin: 0 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial-error {\
                                          padding: 10px;\
                                          color: #ff0000;\
                                          text-align: center;\
                                        }\
                                        \
                                        .DEEP-tutorial-question {\
                                          margin-bottom: 20px;\
                                          padding: 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial-question .DEEP-choice-label {\
                                          margin-bottom: 10px;\
                                          text-align: left;\
                                          padding: 15px;\
                                        }\
                                        \
                                        .DEEP-tutorial-question-error {\
                                          background-color: #e5efff;\
                                        }\
                                        \
                                        .DEEP-tutorial-warmup-table {\
                                          margin-bottom: 20px;\
                                        }\
                                        \
                                        .DEEP-tutorial-warmup-table-header {\
                                          background-color: #93BC0D;\
                                          color: #fff;\
                                          padding: 10px;\
                                        }\
                                        \
                                        .DEEP-tutorial-warmup-table-content {\
                                          background-color: #F0F0F0;\
                                          padding: 10px;\
                                        }'