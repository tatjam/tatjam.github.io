Models and Vehicles
2019-12-22
An introduction to Vehicles and Model loading in OSPGL

My current development focus are vehicles. They are almost the most important part of KSP, the player can build anything they imagine
using simple, intuitive tools, by combining multiple parts.

---

# Model Loading

[Assimp](http://www.assimp.org/) is an awesome library that allows the integration of a huge number of 3D model formats into a program
with a shared interface. It's very straightforward to implement, you just need to copy the assimp data to your own 3D data format.

I decided to structure Models into a tree of Nodes. Nodes can contain an arbitrary ammount of Meshes, each with its own Material.

This structure is really similar to that used by Assimp, and is actually quite comfortable to use, specially for part making where
some nodes of the model may need to have some custom behaviour, for example, the nozzle of a rocket engine.

## Materials

Materials are always tricky to implement. Copying the material system from, say, Blender (not Cycles), could work, but would make editing models
with other software weird and cumbersome.

Instead, I have decided to have two types of materials:

### Custom Materials

They are defined by a TOML file and a shader. They can define constant uniforms that are set for said shaders and define the names in the shader
of the different core uniforms (projection matrix, camera position, lights, etc...). They also define what vertex data is loaded into each mesh,
as needed by the shader.

The 3D artist, in order to assign a material, simply sets the name of the material in the modelling software to the package path to the material file.
For example, in blender, to assign the material ``my_mod:materials/metallic.toml`` to a mesh, I would set its material to be named like that.

This COULD change in the future to use an attribute in the material instead, allowing material names to stay fully readable.

Here's an example material file for a model that displays a texture (in this case the navball texture), and has a uniform vec3, ``color``.
The mesh that gets loaded only contains position, normal and texture data.


```toml
shader = "shader/simple.vs"

[uniforms]
	diffuse = "navball:navball.png"
	[uniforms.color]
		x = 1.0
		y = 0.0
		z = 0.0

[config]
	has_pos = true
	has_nrm = true
	has_tex = true
```

Here's an overview of this configuration file format:

* ``shader``: A string that represents the path to a valid shader
* ``uniforms``: Contains any uniforms to be set in the shader. They must be constant. The type of the uniform can be:
	* **INT**, a number without decimals
	* **FLOAT**, a number with decimals
	* **VEC2**, two floats (x, y)
	* **VEC3**, three floats (x, y, z)
	* **VEC4**, four floats (x, y, z, w)
	* **TEX**, a path to a texture (string)
* ``core_uniforms``: Contains the name for the uniforms that are set by the renderer. I'm not writing them here because they may change in the near future. Check ``CoreUniforms`` in the code to see what is implemented right now.
* ``config``: Contains information about the mesh data.


#### About ``config``

Attributes are always loaded in the same order, but their ``location`` will be different depending on what attributes are enabled.

Attributes appear in this order:

* **pos** (``vec3``): Position
* **nrm** (``vec3``): Normal
* **tex** (``vec2``): Texture coordinate
* **tgt** (``2⨯vec3``): Tangent and Bitangent (in that order)
* **cl3** (``vec3``): Vertex color as RGB
* **cl4** (``vec4``): Vertex color as RGBA

As an example for the attribute ordering, if your config contains:

```toml
# Keep in mind these are not ordered!
has_tgt = true
has_pos = true
has_cl4 = true
has_nrm = true
```

then your attributes, in the shader, should be, following the ordering shown at the top:

```glsl
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNrm;
layout (location = 2) in vec3 aTangent;
layout (location = 3) in vec3 aBiTangent;
layout (location = 4) in vec4 aColor;
```

You are encouraged to actually write every attribute in order and set unused attributes to false
so it's clearer what attributes (and what order) are expected by the shader.

There is another flag, ``flip_uv``, that flips the UVs vertically (y axis) during model loading.
It only makes sense if you have texture coordinates, but the loader won't complain if the flag is
enabled while UVs are disabled.

### PBR Materials

(These are not yet implemented, they will come later on).

When a material's name is not a valid path to a material TOML file, it will be interpreted as a PBR material. This is specially
appropiate for gltf files, which are designed with PBR in mind.

It will load textures from relative paths, adjusting them to be a package path, so the artist has to do very little tweaking to get
stuff to work.

---

# Vehicles

Vehicles are currently implemented as a tree of pieces. While this simplifies a lot of stuff, it could go away further in development
as it introduces some weird problems such as multiple port docking being impossible to do correctly [^1].

Parts are the functional units of a vehicle, they can have Machines attached which do some kind of action.

These parts are built of one or many pieces, but only one of those pieces is linked directly to the part.
If said piece is gone, then the part is no longer in the vehicle. It could be said that the root piece actually
carries the part.

Meanwhile, if a secondary piece separates, the part remains.

A great example is a radial decoupler in KSP (but KSP's implementation may be totally different).
It's made out of two pieces, the first one, the root piece, is what you attach to the vehicle.
Meanwhile, the second piece is where you attach whatever is decoupled. This secondary piece
could perfectly be invisible and just a collider, but it must be present (otherwise the decoupler couldn't
know what link to separate [^2]).
Upon decoupling, the secondary piece becomes a dummy piece as it's no longer linked to the root piece, and the
part has lost the reference to it.

Here's an example implementation for a decoupler machine. Keep in mind that the API is not final at all, it's just an example.
Imagine it's pseudocode, but in lua!

```lua
-- core:machines/decoupler.lua

function activate()

	-- The 3D artist needs to name the node that decouples
	-- properly, in this case, 'p2'
	-- If "p2" is not present RIGHT NOW in the part, it returns nil
	-- If "p2" was never present (the model file doesn't have it)
	-- then this will crash. This avoids confusion.
	local p2 = get_piece("p2")

	if p2 ~= nil then

		local p2_mstate = p2.get_motion_state()

		spawn_effect("effects/decouple.toml", p2_mstate)

		p2.unweld()
		p2.unlink()

	end

end

```

## Welding

A known problem of KSP is how laggy the game can get when you have a vehicle made of hundreds of parts.
A big portion of this lag comes from the physics engine, every single part is a rigid body that has to
be fully simulated.

Welding solves this issue, and also makes rockets less wobbly.

The technique consists on creating single rigidbodies for a set of linked pieces,
using a ``btCompoundShape`` for the collision mesh.

It's important to keep in mind that welding can exist alongside other links, parts can be unwelded and still
be joined by a physics constraint, but that will not usually be the case, welded pieces
will most of the time have no other link.

An example of a piece which may need a link after unwelding is a winch. If it's fully retracted then the
winch head will be welded and locked in place. But after extending the cable, the weld will be broken and
a soft-body rope link will be spawned between the pieces.

---

Not much more can be said for now as stuff will likely change, I hope to have a working vehicle demo coming soon!

[^1]: Another option, which can be found on [Capital-Asterisk's Urho OSP](https://github.com/TheOpenSpaceProgram/urho-osp),
 is to avoid the tree structure. This fixes the big problem of multi-port docking, but introduces user experience challenges, how will
 parts be joined together? How can the user create complex relations between parts?

 The code changes required are actually not that big, pieces need to allow multiple links instead of just one, and all tree traversing code
 needs to be adjusted to keep that in mind.

 A good example of ignoring the tree structure are KSP's struts and fuel lines, but they, as far as I know, are not conventional
 parts, and are implemented separately. If we don't implement a tree style vehicle, then fuel lines will be conventional parts.

[^2]: Parts may or may not know what is linked to them, this is one of the important decisions that are needed.
 It makes sense for part code to only have access to the pieces that are inside that part, after all,
 all multi-part interactions that I can think of will be handled by external systems (resource flow, for example).
 On the other hand, making pieces be aware of what is connected to them, even if it makes the code structures more complex, allows decouplers
 made of a single piece.
 This needs some thinking before any hard to change code is written.

