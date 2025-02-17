# Resizing script for OSWeb
## Introduction
This repository contains the source code (*os_resizing.ts*) for the *os_resizing.js* script that resizes the canvases in OSWeb for consistent visual angles across participants. This ensures more accurate and trustworthy results and is based on the jspsych[^1] implementation of the virtual chinrest[^2].

## Table of contents
1. [Introduction](#resizing-script-for-osweb)
2. [Definitions](#definitions)
3. [Importing](#importing)
4. [How to use](#howto)
    1. [Initialization](#initialization)
    2. [Determining Distance to screen during development](#determining-distance-to-screen-during-development)
    3. [Designing the experiment](#designing-the-experiment)
    4. [Hiccups](#current-hiccups)
    5. [Variables](#variables)
5. [Example](#example)
6. [References](#references)

## Definitions
- Visual angle: The angle a viewed object subtends at the eye. Also referred to as an objects angular size.
- Nominal size: 
- True size: The size of an object in real world millimeters.
- Perceived size: The size of an object as it's perceived over a certain distance.
- DPI: A measure of dot density, the number of individual dots that can be placed in a line of one inch. It is used to bridge the gap between pixels and real world millimetres.

## Importing
This package is supposed to be imported into OpenSesame directly, through the `OSWeb & JATOS control panel` (This currently only seems to function on MacOS). Under external libraries add the following:
```
https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js
```
**OR** create a new `inline_javascript` block in the experiment block of your experiment. In the `prepare` tab, copy the following:
```
var script = document.createElement('script');
script.src = "https://solo-fsw-projects.github.io/solo-fsw-opensesame_resizing/os_resizing_plugin/os_resizing.js";
document.head.appendChild(script);
```
This will allow you to use the classes and functions in the *os_resizing.js* file directly in the inline javascript blocks in OpenSesame.

## How to use <a name="howto"></a>
Once imported, a `inline_javascript` block needs to be created. The current recommendation is to have a sketchpad or some other object before the inline script, as this will allow OSWeb to load the script, depending on how it was imported.

### Initialization
You can then initialize the `Resizer` object. Most of the functionality is automatic, so really only initialization is needed. To initialize the object, in the run tab of the inline script add the following:
```
var resizer = new Resizer(runner, *use_perceived_distance, *canvas_width_in_mm, *distance_to_screen)
```
The variables with `*` need to be altered to their respective types. The runner variable is already built into OpenSesame and thus does not need a different value. This is the outline of the variables needed by the constructor:
- runner: OSWeb runner that contains the entire experiment
- use_perceived_distance: Boolean. Determines wether or not the true size or the perceived size needs to match on the participants screen (or: wether or not the blindspot task is done to calculate the distance to the screen)
- canvas_width_in_mm: Number. The size you need the experiment display width to be in millimeters.
- distance_to_screen: Number. The distance to the screen the experiment is built around. This is needed to ensure an equal visual angle over all distances.

The *use_perceived_distance* variable set to true if the program needs to rescale the OSWeb canvas to make the visual angles matching across different distances on different screens.
If set to false, the program will simply rescale the canvas to make the true size matching on both screens. The reason this is possible is because of the DPI determining credit card resizing task. Using the dpi, the gap to the real world can be bridged, and every screen will display the same true size of a certain object.

The *distance_to_screen* variable is used to get a measure of the intended distance for the experiment. This is needed to calculate the proper scaling factor for the visual angle, so the perceived distance matches across different monitors and distances.

#### Determining distance to screen during development
The easiest solution here is to use a chinrest and measuring tape. This will ensure that the distance to the screen stays consistent during the creation of the experiment. If neither are available, an educated guess will do but this will also reduce the accuracy of the program.

### Designing the experiment
To ensure consistency, it is nice to design the experiment with true size in mind. This means that while creating objects in a sketchpad, the height and width should be decided beforehand. This is done so you can verify the size is equal on all screens.
If the objects are not designed with true size in mind the performance of the program will not be inhibited, as the visual angle, true and perceived sizes will remain the same, the information for what size the objects of interest are will simply be missing. 

Like described in [Current Hiccups](#current-hiccups), when implementing the resizer, bear in mind whether or not you want to use perceived size or true size.
When using the perceived size make sure there is a sketchpad item with the '*keypress*' duration after the inline javascript block that can be skipped (it can be empty).
Doing this will ensure no important parts of the experiment are missed. If you decide to use the true size (*use_perceived_distance* set to false), this is not needed as the program will simply start the next block in the experiment.

It's important to ensure that the resolution you set for the experiment also needs to be smaller than the resolution of the screen you are developing on. You can mess around with different settings, but it is recommended to not use a size bigger than 29cm, as this will likely not fit properly on a 13.3 inch screen. To make development easier we recommend to use the resizer class during development to scale the images etc to be the desired size.

If the experiment gets too large for the screen it's being displayed on, it shall resize itself to match with the biggest supported size possible. This can be seen in the results as well, using the `resizer.squeeze` variable, which represents the squeeze factor (this should be higher than 1 if there is no squeeze).

#### Current Hiccups
As of right now, the functionality is all in place. There is however a slight issue when you do decide to use the perceived distance functionality. This makes the program skip over the next item in the OpenSesame experiment, rather than moving to that item. We are currently working hard on diagnosing what's causing this and fixing it.

### Variables
The `Resizer` class saves a few variables as well. These variables can be used in the opensesame experiment. The following variables can be accessed: 
- scaling_factor: The scaling factor that is used to resize the canvas to match either true size or perceived size.
- view_distance: The calculated distance to the screen.
- calculated_dpi: The calculated DPI of the screen.
- px2mm: The pixels to millimeter ratio, which can be used to convert between the two sizes.
- runner: The OSWeb runner.
- squeeze: the squeeze factor (if the resizing made the canvas bigger than the screen.)

These variables can be accessed by typing in the object name (in our case `resizer` see [Initialization](#initialization)), and adding the variable name with a `.` between them like so:
```
let scaling_factor = resizer.scaling_factor;
```
## Example
In this repository, there is an example experiment added that demonstrates the workings of the `Resizer` class. This example shows how to import the class, how to initialize it with some arbitrary numbers and demonstrates the setup of the overall experiment. Run it a few times to get a feel for what the participants will experience.

## References
[^1]: de Leeuw, J.R., Gilbert, R.A., & Luchterhandt, B. (2023). jsPsych: Enabling an open-source collaborative ecosystem of behavioral experiments. Journal of Open Source Software, 8(85), 5351, https://joss.theoj.org/papers/10.21105/joss.05351.
[^2]: Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. doi: 10.1038/s41598-019-57204-1.
