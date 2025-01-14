Interactive point vortex dynamics
2025-01-20
An interactive and visual exploration of point vortex dynamics.

The mathematics of planetary orbits are beautifully simple, and the complexity that arises from 
them is immense. The n-body problem can lead to incredibly beautiful systems, such as the 
universe (for the most part...). This kind of behavior is very common in mathematics, and is usually
referred to as "emergent". In this blog post, we will explore what I consider to be the fluid 
mechanics equivalent of the n-body problem. All dynamic visualizations in this post are interactive! 

---

# Introduction

A system of $N$ point vortices evolves according to the following equation, particularized for each 
$i \in [1, N]$:

$$
	\dv{\vb{x}_i}{t} = \vb{v}(\vb{x}_i) = 
		\frac{-1}{2 \pi} 
		\sum_{j \ne i}^N 
		\frac
			{\Gamma_j \left( \begin{smallmatrix}
				0 & 1 \\ 
				-1 & 0
			\end{smallmatrix} \right) (\vb{x}_i - \vb{x}_j)}
			{\norm{\vb{x}_i - \vb{x}_j}}.
$$

Each 2D vector $ \vb{x}_i $ represents the position of a vortex and $ \Gamma_j $ each strength. 
The anti-diagonal matrix has the job of rotating the vector by 90 degrees.

It's important to note that, unlike Newton's law of gravity, this equation directly relates 
the velocity of the vortices with the system configuration (position of the vortices). 

## Rotation... or is it?

Intuitively, a single vortex point induces around itself a kind of "rotating flow":

<div id="viz1">
</div>

Regardless of appearances,
the vector field induced is irrotational everywhere, except precisely at the location of the 
vortex point.

In two dimensions[^1] this concept is straightforward to define from the previous "paddle-wheel" 
conception. Consider the surface $A$ delimited by a non-self-crossing closed curve $\delta A$. The 
curl is defined as:

$$
	\curl \vb{v} = \lim_{A -> 0} \frac{1}{A} \int_{\delta A} \vb{v} \cdot \vb{dl}.
$$

[^1]: In three dimensions, the situation becomes a bit more tricky, as our imaginary paddle-wheel would be able to rotate in any direction. Don't fear, for we may stay in our idillic two-dimensional vortex world.

Where $\vb{dl}$ is the parallel vector to the curve at each point. If you imagine the 
curve $\delta A$ to be the circular path that defines the paddle-wheel, the integrated 
term can be visualized as the force on each of the paddles:



# The dynamics of the system

So far we have concerned ourselves with a single vortex, which will (by definition) not 
induce any velocity upon itself, and thus will remain stationary. We will not consider the 
system of two vortices:

This system is remarkably simple. In the 2-body problem, even two bodies give a rich set of 
possible orbits, but we must remember that in this vortex-problem, we are inducing velocities 
and not accelerations!

The situation changes if more vortices are added:

<script src="/external/p5.min.js"></script>
<script src="/visualizations/vortex-dynamics/base.js"></script>
<script src="/visualizations/vortex-dynamics/viz1.js"></script>
