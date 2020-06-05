Enter the Editor
2020-06-03
The last two months of progress feature the beginnings of the editor, among other changes

Since the last blogpost a lot of stuff has happened, the quarantine has given me a lot of free time, which has been reflected on a lot of work on OSPGL. Over 50 commits have been pushed since the last post. 

---

# The Editor

The most important feature written in the past few days is the editor scene. It requires both a GUI and some vehicle metadata to work.

## GUI System

After searching for an appropiate GUI toolkit, I decided to roll my own. We only need relatively simple GUI, so something as big as QT was overkill, and lightweight OpenGL GUI libraries such as GiGi (Used in [FreeOrion](https://github.com/freeorion/freeorion)) were complicated to integrate. We already have ImGui in the project, but customizing it for our purposes is too complicated, too. I decided to roll my own GUI library at the end of the day, here's how it works:

GUIs are built by attaching `GUIWidgets` to a `GUILayout`. Layouts are responsible for placing the widgets in the correct position. For example, as of now we have a `GUIListLayout`, which simply puts widgets left-to-right, top-to-bottom (used in the part list) and a `GUIVerticalLayout`, which puts widgets top-to-bottom (used in the part category list). Layouts are also responsible for drawing scrollbars.

`GUILayouts` are then placed inside a `GUICanvas`, which is simply a binary partition of a rectangular region, allowing for complex window designs which are correctly displayed at all screen sizes.

## Vehicle Editing

In order for the editor to be "LEGO-like", attachment points are needed. I have decided to make it a bit more complex than KSP to fix a few of the big issues that users face when editing vehicles. 

There are three attachment types, `stack` (a ball), `radial` (a spike) and `stack_radial` (a ball with a spike). A piece may have any ammount of attachment points, and can toggle whether parts can attach radially to it or not.
These attachment points are defined with a marker (A Blender empty) on the model file, and a small entry on the part config file.

While placing pieces, the user can decide which attachment point to use, and also change which piece to use for attachment, allowing very easy building of relatively complex structures. It's easier to understand by watching a video (or trying it yourself by downloading and building the code):


<div style="text-align: center">
<video width="50%" style="margin: 0 auto" controls>
	<source src="img/editor.mp4" type="video/mp4">
	Your browser does not support the video tag
</video>
</div>

The keybindings used are placeholders, the final editor will probably have some kind of visual interface for selecting attachment pieces and points.

The next objectives are creating new parts, removing existing parts, and starting to work on wiring or some way to connect machines together.
Also, we certainly need some way to keep parts aligned after messing with them. On the video you can clearly see that, after having messed a lot with the vehicle, one fuel tank is slightly rotated relative to the other fuel tank.

# Package Manager

Another feature which is really important for a game like OSP is some kind of way to obtain content for the game. KSP has CKAN, which completely changed the modding scene by automating the mod installing process. Inspired by CKAN is the OSPM, the OSP Manager, which will handle download and installing of resource packages from a public repository.

Currently only the code to obtain a package from a URL and install it is present, it does not only download a file over HTTPS, but it also extracts the package and checks the package meta-data. This will be used later on by the more advanced and smart `install` command, which can check meta-data before downloading a mod, but it needs a remote repository. 

Currently, to run the game you need two packages, `debug_system` and `test_parts`, which contain some data required by the engine during its development. Later on only `core` will be needed to start the game, but some content packages will be neccesary to play it (otherwise you would have no parts, no planetary system, etc...).

Here are the commands used to install the packages as of now, we are using github releases to host these files:

```
./ospm fetch https://github.com/TheOpenSpaceProgram/new-ospgl/releases/download/ospm-test/debug_system.zip
./ospm fetch https://github.com/TheOpenSpaceProgram/new-ospgl/releases/download/ospm-test/test_parts.zip
```

Only the `fetch` and `help` commands are implemented, but the usage of the final package manager could look like this:

```
./ospm connect https://github.com/TheOpenSpaceProgram/new-ospgl-pkg/packages.toml
./ospm update
./ospm install real-solar-system
...
```

The repository is nothing more than a toml file which contains all the `package.toml` files for all versions of all packages. These files will contain an extra field (not read at all by OSP, but used by the package manager) which is the link to where the package is hosted, so the package manager can download them automatically.


# Input System

Another big feature which is still on progress is the input system. It's meant to be used by Machines during flight, and it does not neccesarly handle input from the player, but it could come from a replay file, or even multiplayer commands.

Machines which can be controlled need to expose an `InputContext`, which defines the axes and actions that can be used to control said machine. Then, these inputs can be updated externally.

As of now it supports both keyboard and joystick input.

Keybindings / Joystick bindings can be changed by modifying a text file, but it will later on get a dedicated GUI where the `InputContext`s can define descriptions for the inputs, allowing all keybindings for all mods to be accessed from a single interface.

Stuff like the editor and GUIs don't use this system, as they cannot be controlled by anything other than a real player. If a GUI needs to interact with a real vehicle, it needs to be linked to a machine, with which it can interact. Some thought needs to go into how to make these GUIs work nicely with replays / multiplayer, maybe we could force them to interact with machines via an `InputContext`. 

# Other Changes

A small shader preprocessor was written, it allows sharing code between shaders in the same way that C++ handles it, using the #include directive. It works fine, but needs some kind of way to fix the line numbers.

Also, a screen door transparency effect was written:

<video width="30%" controls>
	<source src="img/sdoor.mp4" type="video/mp4">
	Your browser does not support the video tag
</video>

It allows easy and correct transparency on the deferred pass for stuff like fairing look-through, but it's not appropiate for more realistic effects, where a forward transparency pass is required (stuff like engine exhaust and capsule windows).

A small CI (Continuous Integration) script was also written, but it requires more work. As of now it simply checks if the program compiles on linux.

## Bugfixes

Barycenters were totally broken, but, due to the relatively small scale of the error, I had not been able to notice it until the vehicles actually were placed in the world. Unexpectedly, when they collided with the terrain, they bounced all over the place. Thanksfully it was as easy to fix as properly calculating the velocity of the primary in the barycenter pair!

We also had precision errors related to time. Turns out that even a double is too small for storing a date! The planet orbit calculator was being too imprecise, which showed up as jittering while on the surface. It's now fixed by storing an epoch date and a relative date, so the potentially huge floating point number of the epoch date does not reduce the precision of the small time-steps.[^1] 

[^1]: Keep in mind, the year 2020 is roughly 31536000 seconds after J2000, our epoch date. That number is big enough as for some jittering to start becoming apparent, but stuff really started breaking around the year 2060 (or 1940). It may seem really far away but it could easily be reached on interplanetary missions.

 The reason for this jittering is that the orbit calculator amplifies floating point errors really easily, so the planets end up jittering a few meters back and forward. Nothing on the planetary scale, but enough as to fully ruin your day on a more human scale.

 The jittering is now impossible to notice even as far away as Pluto, but you will certainly meet floating point errors if you go really far away. Stuff like interstellar travel needs to change the origin of coordinates. 


The model loader also had plenty of bugs related to matrix multiplications... The order is always tricky to get right. 

## Planet generator perfomance improvements

Some changes have been done to the planet rendering system to make it slightly faster.
First of all, a badly written mutex lock was blocking the generator threads, allowing only one to work at a time. Now all threads can work at the same time, allowing really fast terrain generation.

A few changes were done too to the PlanetTile code, instead of allocating stack arrays on every tile they are now allocated only once per thread, and, in order to exploit the high speed of the LuaJIT trace compiler, the `generate` function is called only once per tile. It's now the responsability of the script to loop over all the vertices.

Sadly, the perfomance improvement is not that spectacular (on my PC, from 0.12s per tile to 0.11s with optimizations disabled, once optimizations are enabled the difference is very small), but it paves the way for further improvement. For example, rewriting `FreeNoise` (the noise library we are using) in C and calling it directly from lua using LuaJIT's `ffi` module could really speed up the generation, as the `ffi` function calls have almost zero overhead.


<div style="text-align: center">
<video width="50%" style="margin: 0 auto" controls>
	<source src="img/fly.mp4" type="video/mp4">
	Your browser does not support the video tag
</video>
<br>
(Footage is spedup by a factor of 2)
</div>
