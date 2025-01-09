# Resizing script for OSWeb
This repository contains the source code (*os_resizing.ts*) for the *os_resizing.js* script that resizes the canvases in OSWeb for consistent visual angles across participants. This ensures more accurate and trustworthy results and is based on the jspsych[^1] implementation of the virtual chinrest[^2].

## Importing
This package is supposed to be imported into OpenSesame directly, through the *OSWeb & JATOS control panel*. Under external libraries add the following:
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

## Usage
It takes a couple milliseconds to load the package, so the suggestion for now is to have a canvas or some kind of buffer item that will bridge the gap. After this, create another '*inline_javascript*' block and create a new instance of the **Resizer** class by typing `var *variable name* = new Resizer(runner, distance);` in the run tab, where distance is the intended distance between the screen and the subject in mm. 'runner' does not need a declaration or alteration, as this is the experiment runner provided by OS. The initialization of the class will run the resizing and blindspot tasks automatically. As shown in the example experiment, some kind of canvas is needed while the resizer is working. This canvas will not be seen, but if it's not added, the rest of the experiment might be compromised.

### Scaling
The scaling will be done automatically. The resizer class calculates the visual angle, and will scale the canvas object to match the visual angle. This should ensure a similar experience for all users.
 


## References
[^1]: de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. Journal of Open Source Software, 8(85), 5351, https://joss.theoj.org/papers/10.21105/joss.05351.
[^2]: Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. doi: 10.1038/s41598-019-57204-1.
