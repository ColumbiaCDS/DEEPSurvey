<?php
/**
 * DEEP System
 *
 * @author Mark Bao
 * @version 0.1
 *
 */
class DEEP extends PluginBase
{
    static protected $name = 'Integrated DEEP';
    static protected $description = 'System for DEEP in LimeSurvey';

    public function __construct(PluginManager $manager, $id)
    {
        parent::__construct($manager, $id);
        $this->subscribe('beforeSurveyPage');
        $this->subscribe('beforeQuestionRender');
    }

    public function beforeSurveyPage()
    {
        $oEvent = $this->getEvent();

        // Inject JS and CSS
        // TODO: Defer injection until after we know a survey requires DEEP

        $coreURL = Yii::app()->assetManager->publish(dirname(__FILE__) . '/assets/DEEPCore.js');
        App()->getClientScript()->registerScriptFile($coreURL);

        $tutorialURL = Yii::app()->assetManager->publish(dirname(__FILE__) . '/assets/DEEPTutorial.js');
        App()->getClientScript()->registerScriptFile($tutorialURL);

        $jsURL = Yii::app()->assetManager->publish(dirname(__FILE__) . '/assets/DEEPLimeSurvey.js');
        App()->getClientScript()->registerScriptFile($jsURL);

        $cssURL = Yii::app()->assetManager->publish(dirname(__FILE__) . '/assets/DEEPLimeSurvey.css');
        App()->getClientScript()->registerCssFile($cssURL);
    }

    public function beforeQuestionRender()
    {
        $oEvent = $this->getEvent();

        if (substr($oEvent->get('code'), 0, 4) == "DEEP") {
            $answers = <<<EOD
<div class="DEEP-answer">
{$oEvent->get('answers')}
</div>
<script type="text/javascript">
jQuery(function() {
    if (window.DEEPLoaded) {
        alert("Error: DEEP cannot be loaded twice on this page.");
    } else {
        window.DEEPLoaded = true;
        
        var DEEP = new DEEPLimeSurvey('{$oEvent->get('code')}');
        DEEP.setup();
    }
});
</script>
EOD;

            $oEvent->set('answers', $answers);
        }
    }
}
