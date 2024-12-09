# Resizing script for OSWeb
This repository contains the source code for the *os_resizing.js* script that resizes the canvases in OSWeb for consistent visual angles across participants. This ensures more accurate and trustworthy results and is based on the jspsych[^1] implementation of the virtual chinrest[^2].

## Importing
This package is supposed to be imported into OpenSesame directly, through the **OSWeb & JATOS control panel**. Under external libraries add the following:
```
https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js
```
OR create a new '*inline_javascript*' block in the experiment block of your experiment. In the '*prepare*' tab, copy the following:
```
var script = document.createElement('script');
script.src = "https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js";
document.head.appendChild(script);
```
This will allow you to use the classes and functions in the *os_resizing.js* file directly in the inline javascript blocks in OpenSesame.

## Usage
It takes a couple milliseconds to load the package, so the suggestion for now is to have a canvas or some kind of buffer item that will bridge the gap. After this, create another '*inline_javascript*' block and create a new instance of the **Resizer** class by typing `var *variable name* = new Resizer();` in the run tab. The initialization of the class will run the resizing task automatically. As shown in the example experiment, the recommendation is to have another 'buffer', in this case a focus point. This canvas will be visible after the resizing task has been completed.

### Scaling
To scale items to real world millimeters in OpenSesame sketchpads, draw or import the desired object. choose the desired size in mm for height and with and divide it by the property `px2mm` (pixels to millimeter) of the Resizer object as such (this example is a white square of 30x30mm):
```
draw rect color=white fill=1 h="{30/*variable name*.px2mm}" penwidth=1 show_if=True w="{30/*variable name*.px2mm}" x=-32 y=-32 z_index=0
``` 
This will make sure the dimensions on the canvas match to the real world metric.
 


## References
[^1]: de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. Journal of Open Source Software, 8(85), 5351, https://joss.theoj.org/papers/10.21105/joss.05351.
[^2]: Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. doi: 10.1038/s41598-019-57204-1.
