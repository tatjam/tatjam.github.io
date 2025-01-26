function vperp(v) {
	return [v[1], -v[0]];
}

function vadd(x, y) {
	return [x[0] + y[0], x[1] + y[1]];
}

function vsub(x, y) {
	return [x[0] - y[0], x[1] - y[1]];
}

function vscaleby(v, scalar) {
	return [v[0] * scalar, v[1] * scalar];
}

function vnorm(v) {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}


// zoomfactor refers to the factor that converts from simulation coordinates to 
// zero-centered screen coordinates. czoom represents how many "simulation" units
// are seen by the camera in its largest dimension
function zoomfactor(camera) {
	// We use the largest dimension for isotropic scale
	let largedim = Math.max(camera.imgsize[0], camera.imgsize[1]);

	return largedim / camera.zoom;
}

function defaultcamera(imgsize) {
	return {
		center: [0, 0],
		zoom: 1,
		imgsize: imgsize
	};
}

// Returns [[minx,miny], [maxx,maxy]] in simulation coordinates
function camerabounds(camera) {
	let zf = zoomfactor(camera);
	let min = vsub(camera.center, vscaleby(camera.imgsize, 1.0 / zf));
	let max = vadd(camera.center, vscaleby(camera.imgsize, 1.0 / zf));
	return [min, max];
}

// Screen coordinates range from 0 to imgsize, while simulation coordinates 
// ar arbitrary. After substracting the camera center (ccenter), they are around (0, 0),
// and zoom convers them from -imgsize/2 to imgsize/2
function v2screen(v, camera) {
	let zf = zoomfactor(camera);
	let vscreen = vscaleby(vsub(v, camera.center), zf);
	return vadd(vscreen, vscaleby(camera.imgsize, 0.5));
}

// Draws zero-centered euclidean axes and grid, we draw a relatively solid grid 
// at integer multiples, and thinner grid at quarter points
function axes(sk, scale, camera, mainWeight = 2, tickWeight = 1, subtickWeight = 0.1) {
	let mult = 5;
	let sc = scale / mult;
	// Euclidean axes flow at every integer multiple of scale / 4
	// We draw some lines outside of view but we don't care
	let bounds = camerabounds(camera);

	let minkx = Math.floor(bounds[0][0] / sc);
	let maxkx = Math.ceil(bounds[1][0] / sc);
	let minky = Math.floor(bounds[0][1] / sc);
	let maxky = Math.ceil(bounds[1][1] / sc);

	for (let kx = minkx; kx < maxkx; kx++) {
		xsc = v2screen([kx * sc, 0], camera)[0];
		if (kx == 0) {
			sk.strokeWeight(mainWeight);
		} else if (kx % mult == 0) {
			sk.strokeWeight(tickWeight);
		} else {
			sk.strokeWeight(subtickWeight);
		}
		sk.line(xsc, 0, xsc, camera.imgsize[1]);
	}
	for (let ky = minky; ky < maxky; ky++) {
		ysc = v2screen([0, ky * sc], camera)[1];
		if (ky == 0) {
			sk.strokeWeight(mainWeight);
		} else if (ky % mult == 0) {
			sk.strokeWeight(tickWeight);
		} else {
			sk.strokeWeight(subtickWeight);
		}
		sk.line(0, ysc, camera.imgsize[0], ysc);
	}
}

// We integrate dx/dt = f(x, t) for each vortex
// f will get called with x and partial dt used (0, 1/2, 1)
// (any time information must be obtained by f by other means)
// f must return a 2-vector
function rk4(x, f, dt, metadata) {
	let k1 = vscaleby(f(x, 0, metadata), dt);
	let k2 = vscaleby(f(vadd(x, vscaleby(k1, 0.5)), dt * 0.5, metadata), dt);
	let k3 = vscaleby(f(vadd(x, vscaleby(k2, 0.5)), dt * 0.5, metadata), dt);
	let k4 = vscaleby(f(vadd(x, k3), dt, metadata), dt);

	return vadd(x,
		vadd(
			vscaleby(k1, 1.0 / 6.0),
			vadd(
				vscaleby(k2, 1.0 / 3.0),
				vadd(
					vscaleby(k3, 1.0 / 3.0),
					vscaleby(k4, 1.0 / 6.0)
				)
			)));
}

function makevortex(p, Gamma) {
	return { p: p, Gamma: Gamma };
}

// Unitary vortex intensity
function indvelat(x, vortex) {
	let p = vperp(vsub(x, vortex.p));
	return vscaleby(p, -vortex.Gamma / Math.PI / vnorm(p));
}

// f returns the velocity induced by all vortices at given point
function simulationf(vortices) {
	return function (x, dt, effecti) {
		let totalv = [0, 0];
		for (let causei = 0; causei < vortices.length; causei++) {
			if (causei != effecti) {
				let nvel = indvelat(x, vortices[causei]);
				totalv = vadd(totalv, nvel);
			}
		}
		return totalv
	}
}

function simulate(vortices, dt) {
	let nextvortp = [];;
	let f = simulationf(vortices);

	// Compute new positions
	for (let effecti = 0; effecti < vortices.length; effecti++) {
		let p = vortices[effecti].p;
		let nextp = rk4(p, f, dt, effecti);
		nextvortp.push(nextp);
	}

	// Assign new positions
	for (let effecti = 0; effecti < vortices.length; effecti++) {
		vortices[effecti].p = nextvortp[effecti];
	}
}