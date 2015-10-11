# Integrated DEEP

Integrated DEEP is a system that implements DEEP for Qualtrics and LimeSurvey.

## What do I need to install DEEP?

- If you're using Qualtrics, paste `/dist/qualtrics/DEEPforQualtrics.js`
  into a text box field.
- If you're using LimeSurvey, install the DEEP plugin at
  `/dist/limesurvey/DEEP.zip`.
- Set the DEEP ID, which is `"DEEP" + "TIME/RISK" + question count`, e.g.
  `DEEPTIME12` or `DEEPRISK8`.
    - In Qualtrics, insert this DEEP ID into the Question Title.
    - In LimeSurvey, insert this DEEP ID into the Question Code.

## Structure

This repository contains:

- `/src/` — Source code for:
	- DEEPCore — the core DEEP logic class
	- DEEPTutorial — the class for the introduction and warmup
	- DEEPQualtrics — DEEP integration class into Qualtrics
	- DEEPLimeSurvey — DEEP integration class into LimeSurvey
	- Framework code: `/src/qualtrics/` and `/src/limesurvey/` are the
	  main folders where compilation starts. These folders contain the
	  boilerplate stuff (like the LimeSurvey plugin PHP file), and the
	  compiler inserts DEEPCore, DEEPTutorial, and DEEPQualtrics/
	  DEEPLimeSurvey into these folders.
		- LimeSurvey: `/src/limesurvey/DEEP.php` is the main plugin
		  file for the DEEP LimeSurvey plugin, and it also contains a
		  CSS file for DEEP in `/src/limesurvey/assets/`. The other
		  assets, DEEPCore, DEEPTutorial, and DEEPLimeSurvey, are
		  copied in compile time.
		- Qualtrics: `/src/qualtrics/DEEPforQualtrics.js` contains the
		  code that you paste into Qualtrics when editing the survey.
		  During compilation, the compile system includes DEEPCore,
		  DEEPTutorial, and DEEPQualtrics inside of this file,
		  resulting in a large file that users paste into the JavaScript
		  editor in Qualtrics.
- `/dist/` — Contains the compiled files, fit for distribution. This is
            where the compile system places final products.
	- `/dist/limesurvey/`
		- `/dist/limesurvey/DEEP.zip` — The DEEP LimeSurvey plugin, which
		  		  		  		  		  	  can be installed in LimeSurvey.
		- `/dist/limesurvey/DEEP/`    — The same as the DEEP plugin
		                                zip file, but uncompressed.
	- `/dist/qualtrics`
		- `/dist/qualtrics/DEEPforQualtrics.js` — The code you copy 
		  		  		  		  		  		         into Qualtrics'
		  		  		  		  		  		         JavaScript editor.
- `/doc/` — Contains HTML documentation for the four classes, JSDoc format.
- `/schema/` — Contains the JSON schema for the DEEP JSON output.
- `/package.json` — Contains the dependencies required for compilation.
- `/gulpfile.js` — Contains the Gulpfile which has compilation instructions.

## Compiling

Compiling, in this program, doesn't really do anything magical or run any actual
compilation. Instead, it just combines files together.

- It combines the Qualtrics framework with DEEPCore, DEEPTutorial, and
DEEPQualtrics, outputting one file that the user can put into Qualtrics.
- It combines the LimeSurvey plugin framework with DEEPCore, DEEPTutorial,
and DEEPLimeSurvey in one folder, zips up the folder, and outputs the zip
file ready for installation into the LimeSurvey admin panel.

### Requirements

- node.js
- npm

### Compiling code

1. Make sure you have gulp installed. If not: `npm install --global gulp`
2. Make sure you have all the package dependencies installed. If not: `npm install`
3. Run `gulp`
4. Output is now in `/dist/`.

For more information, consult `gulpfile.js`.

### Compiling documentation

1. Make sure you have JSDoc installed. If not: `npm install --global jsdoc`
2. `jsdoc src/DEEP*.js -a all -d ./doc`

## Development Log

### October 9, 2015

- Started framework for Qualtrics DEEP
- Built out UI for Qualtrics
- Built out IDEEPTime and IDEEPQualtrics core functions
- Added priors
- Added randomization
- Added most of the logic
- Initial testing against current Qualtrics

### October 10, 2015

- Refactored DEEPTime to DEEPCore; both DEEP Time and DEEP Risk
  will use DEEPCore
- Added selective code switches for DEEP Time and DEEP Risk
- Implemented DEEP Risk
- Documented DEEPCore
- Fixed ID bugs
- Refactored first run

### October 11, 2015

- Minor refactor of getChoiceOption to make it more compact
- Refactored DEEPCore.nextQuestion and .beginDEEP() and
  renderChoices(), and parts of DEEPQualtrics, to decouple
  the tight connection between DEEPCore and DEEPQualtrics
  by not making DEEPCore call anything on the platform object.
- Added validation/error handling
- Added introduction and warm-up
- Added mode to skip the tutorial
- Updated documentation for DEEPQualtrics
- Added documentation for DEEPTutorial
- Refactored skipTutorial and added debugMode
- Implemented DEEP on LimeSurvey
- Added compilation system
- Added README

## TODO

### Consider

- Consider using lz-string to compress itemRisks and codedIndexers or consider lazy-loading them dynamically
- Adding a check for jQuery - may fail without
- Adding a "saving" message in Qualtrics
- Adding !important or clearing all CSS; consider http://yuilibrary.com/yui/docs/cssreset
