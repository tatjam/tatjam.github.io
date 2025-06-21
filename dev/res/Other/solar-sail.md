Where can a solar sail go?
2025-06-18
An interactive tool to understand solar sails
#
<script type="importmap">
	{
		"imports": {
			"three": "https://cdn.jsdelivr.net/npm/three@0.177.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.177.0/examples/jsm/"
		}
	}
</script>
<script src="https://cdn.jsdelivr.net/npm/lil-gui@0.20"></script>
#
---

A solar sail is a spacecraft that purposefully exploits radiation pressure on its surface to change its velocity. Radiation pressure is typically extremely small (unless you happen to be in the immediate vicinity of an exploding nuclear bomb), and thus the forces generated are really only noticeable on space, where even tiny accelerations are useful.

The origin of this force is the fact that light carries momentum. It's useful, but not really correct physically, to just imagine light as a lot of tiny billboard balls, colliding with our spacecraft. The collision may be:

- Elastic (equivalent to a perfectly reflective surface), where the balls bounce off the surface of our spacecraft.
- Inelastic (equivalent to a perfectly black surface), where the balls stick to our spacecraft.
- A mix between the two.

For simplicity, we may consider our solar sail to be a perfectly flat rectangle of area \\(A\\) with its normal vector pointing in direction \\(𝐧\\). We will assume that only solar radiation is meaningful, and it comes from a fixed direction \\(𝐬\\). The reflectivity of the sail is given by \\( ϵ ∈ [0, 1] \\), with 0 meaning the sail is perfectly black, and 1 meaning it's perfectly reflective.

The first component of the solar radiation force is that given by absorption of the light. The total quantity of light absorbed is 

$$
    ϕ_a = A |𝐧 ⋅𝐬|, 
$$

noting that the dot product represents the projected area of the rectangle on the \\( 𝐬 \\) direction. The absolute value is taken because it doesn't really matter what side of our rectangle does the absorption.

The second component is given by the reflection of light, which is equivalent to emission of a quantity of light proportional to the absorbed quantity,   

$$
    ϕ_r = ϵ ϕ_a.
$$

Now, the momentum transfer is proportional to the quantity of light absorbed / reflected, and the momentum it carries. We may write the quantity of momentum per unit light as \\(p\\). Then, by Newton's second law, the force acting on our body due to absorption is

$$
    𝐅_a = ϕ_a p 𝐬,
$$

similarly, for reflection

$$
    𝐅_r = ϕ_r p 𝐧.
$$

Adding both terms together, we find the total force on the sail is

$$
    𝐅 = p (ϕ_a 𝐬 + ϕ_r 𝐧) = p A |𝐧 ⋅ 𝐬| (𝐬 + ϵ 𝐧).
$$

Note that, by increasing the reflectivity of the object, we can achieve some "thrust-vectoring" by means of rotating the sail. With a totally absorptive sail, the force will instead always push us away from the sun. Either way, the most efficient way to use the sail is to point it straight at the sun.

This interesting constraint makes the design of solar sail spacecraft missions trickier than conventional means of propulsion, not only due to the very reduced forces involved, but also due to this constraint on thrust direction. Ideally, we would always maneouver away from the sun! To explore what this implies for an spacecraft in Earth's orbit, I've built a simulation that allows you to see what kind of acceleration a solar sail can achieve on every point of its orbit, and also to simulate the maximum envelope of achievable orbits given some maneouver time.

<p id="canvas-cont" style="position: relative; width: 100%; height: 500px;">
<canvas id="c" style="width:100%"></canvas>
</p>

<script type="module" src="/external/solar-sail.js"></script>

