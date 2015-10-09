Qualtrics.SurveyEngine.addOnload(function()
{
  var IDEEPLoaded = false;

  var IDEEPQualtrics = function(qsEngine)
  {
    this.qsEngine = qsEngine;
  }

  IDEEPQualtrics.prototype.setup = function()
  {
    // Save the DEEPID
    this.DEEPID = this.getDEEPID;
    this.bootstrapUI();

    // Initialize the first question
    
  }

  IDEEPQualtrics.prototype.bootstrapUI = function()
  {
    // Disable and hide the next button
    this.qsEngine.disableNextButton();
    jQuery('#NextButton').hide();

    // Save the question container reference
    this.questionContainer = this.qsEngine.getQuestionContainer();

    // Initialize DEEP UI framework
    jQuery(this.questionContainer).after(jQuery('<div class="DEEP-block" id="DEEP-question"><div class="DEEP-content"><div class="QuestionBody"> <table border="0" cellpadding="0" cellspacing="0" class="ChoiceStructure"> <tbody> <tr> <td class="LabelContatiner" width="50%"> <span class="LabelWrapper"> <label class="SingleAnswer" for="DEEP-choice-1" style="padding-top: 20px; padding-bottom: 20px;">Receive <strong>$250 in 3 months</strong></label> </span> <label class="q-radio" for="DEEP-choice-1"></label> </td> <td class="LabelContatiner alt" width="50%"> <span class="LabelWrapper"> <label class="SingleAnswer" for="DEEP-choice-2" style="padding-top: 20px; padding-bottom: 20px;">Receive <strong>$95 today</strong></label> </span> <label class="q-radio" for="DEEP-choice-2"></label> </td> </tr> <tr> <td class="ControlContainer" style="width: 50%;"><input class="radio" id="DEEP-choice-1" name="DEEP-choice-1" type="radio" value="1"></td> <td class="ControlContainer alt" style="width: 50%;"><input class="radio" id="DEEP-choice-2" name="DEEP-choice-2" type="radio" value="2"></td> </tr> </tbody> </table> </div></div></div>'));

    // Hide the question container
    jQuery(this.questionContainer).hide();
  }

  IDEEPQualtrics.prototype.getDEEPID = function ()
  {
    // Find the DEEPID
    var qsQuestionInfo = this.qsEngine.getQuestionInfo();
    return qsQuestionInfo.QuestionText;
  }

  var qsEngine = this;

	if (IDEEPLoaded)
  {
		alert("DEEP cannot be loaded twice on this page.");
	} else {
		IDEEPLoaded = true;

    var IDEEP = new IDEEPQualtrics(qsEngine);
    IDEEP.setup();
	}
});

