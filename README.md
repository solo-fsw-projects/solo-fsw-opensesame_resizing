# Resizing script for OSWeb
This repository contains the source code (*os_resizing.ts*) for the *os_resizing.js* script that resizes the canvases in OSWeb for consistent visual angles across participants. This ensures more accurate and trustworthy results and is based on the jspsych[^1] implementation of the virtual chinrest[^2].

# Table of contents
1. [Introduction](#resizing-script-for-osweb)
2. [Importing](#importing)
3. [How to use](#howto)
    1. [Initialization](#initialization)
    2. [Determining DPI](#determining-dpi)
    3. [Determining Distance to screen during development](#determining-distance-to-screen-during-development)
    4. [Hiccups](#current-hiccups)
4. [References](#references)


## Importing
This package is supposed to be imported into OpenSesame directly, through the *OSWeb & JATOS control panel* (This currently only seems to function on MacOS). Under external libraries add the following:
```
https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js
```
**OR** create a new '*inline_javascript*' block in the experiment block of your experiment. In the '*prepare*' tab, copy the following:
```
var script = document.createElement('script');
script.src = "https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js";
document.head.appendChild(script);
```
This will allow you to use the classes and functions in the *os_resizing.js* file directly in the inline javascript blocks in OpenSesame.

## How to use <a name="howto"></a>
Once imported, a inline javascript block needs to be created. The current recommendation is to have a sketchpad or some other object before the inline script, as this will allow OSWeb to load the script, depending on how it was imported.

### Initialization
You can then initialize the resizer object. Most of the functionality is automatic, so really only initialization is needed. To initialize the object, in the run tab of the inline script add the following:
```
var resizer = new Resizer(*osweb, runner, *use_perceived_distance, *dpi, *distance_to_screen)
```
The variables with * need to be altered to their respective types. The runner variable is already built into OpenSesame and thus does not need a different value. This is the outline of the variables needed by the constructor:
- osweb: Boolean (true/false). Determines if the class is used within OSWeb
- runner: OSWeb runner that contains the entire experiment
- use_perceived_distance: Boolean. Determines wether or not the true size or the perceived size needs to match on the participants screen (or: wether or not the blindspot task is done to calculate the distance to the screen)
- dpi: Number (any real number). Dpi of the screen that the experiment was developed on
- distance_to_screen: Number. The distance to the screen the experiment is built around. This is needed to ensure an equal visual angle over all distances.

#### Determining DPI
To make it easier to determine the DPI, we created a static page where you can check the dpi of your screen using a credit card. It can be found here:
https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/

#### Determining distance to screen during development
The easiest solution here is to use a chinrest and measuring tape. This will ensure that the distance to the screen stays consistent during the creation of the experiment. If neither are available, an educated guess will do but this will also reduce the accuracy of the program.

#### Current Hiccups
As of right now, the functionality is all in place. There is however a slight issue when you do decide to use the perceived distance functionality. This makes the program skip over the next item in the OpenSesame experiment, rather than moving to that item. We are currently working hard on diagnosing what's causing this and fixing it.

## References
[^1]: de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. Journal of Open Source Software, 8(85), 5351, https://joss.theoj.org/papers/10.21105/joss.05351.
[^2]: Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. doi: 10.1038/s41598-019-57204-1.
