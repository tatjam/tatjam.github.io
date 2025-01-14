function vperp(v) {
	return [v[1], -v[0]]
}

function vadd(x, y) {
	return [x[0] + y[0], x[1] + y[1]]
}

function vsub(x, y) {
	return [x[0] - y[0], x[1] - y[1]]
}

function vscaleby(v, scalar) {
	return [v[0] * scalar, v[1] * scalar]
}

function vnorm(v) {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1])
}

// Unitary vortex intensity
function indvelat(x, vp) {
	p = vperp(vsub(x, vp))
	return vscaleby(p, -1.0 / Math.PI / vnorm(p))
}

// zoomfactor refers to the factor that converts from simulation coordinates to 
// zero-centered screen coordinates. czoom represents how many "simulation" units
// are seen by the camera in its largest dimension
function zoomfactor(camera) {
	// We use the largest dimension for isotropic scale
	largedim = Math.max(camera.imgsize[0], camera.imgsize[1])

	return largedim / camera.zoom
}

function defaultcamera(imgsize) {
	return {
		center: [0, 0],
		zoom: 1,
		imgsize: imgsize
	}
}

// Returns [[minx,miny], [maxx,maxy]] in simulation coordinates
function camerabounds(camera) {
	zf = zoomfactor(camera)
	min = vsub(camera.center, vscaleby(camera.imgsize, 1.0 / zf))
	max = vadd(camera.center, vscaleby(camera.imgsize, 1.0 / zf))
	return [min, max]
}

// Screen coordinates range from 0 to imgsize, while simulation coordinates 
// ar arbitrary. After substracting the camera center (ccenter), they are around (0, 0),
// and zoom convers them from -imgsize/2 to imgsize/2
function v2screen(v, camera) {
	zf = zoomfactor(camera)
	vscreen = vscaleby(vsub(v, camera.center), zf)
	return vadd(vscreen, vscaleby(camera.imgsize, 0.5))
}

// Draws zero-centered euclidean axes and grid, we draw a relatively solid grid 
// at integer multiples, and thinner grid at quarter points
function axes(sk, scale, camera, mainWeight = 2, tickWeight = 1, subtickWeight = 0.1) {
	mult = 5
	sc = scale / mult
	// Euclidean axes flow at every integer multiple of scale / 4
	// We draw some lines outside of view but we don't care
	bounds = camerabounds(camera)

	minkx = Math.floor(bounds[0][0] / sc)
	maxkx = Math.ceil(bounds[1][0] / sc)
	minky = Math.floor(bounds[0][1] / sc)
	maxky = Math.ceil(bounds[1][1] / sc)

	for (kx = minkx; kx < maxkx; kx++) {
		xsc = v2screen([kx * sc, 0], camera)[0]
		if (kx == 0) {
			sk.strokeWeight(mainWeight)
		} else if (kx % mult == 0) {
			sk.strokeWeight(tickWeight)
		} else {
			sk.strokeWeight(subtickWeight)
		}
		sk.line(xsc, 0, xsc, camera.imgsize[1])
	}
	for (ky = minky; ky < maxky; ky++) {
		ysc = v2screen([0, ky * sc], camera)[1]
		if (ky == 0) {
			sk.strokeWeight(mainWeight)
		} else if (ky % mult == 0) {
			sk.strokeWeight(tickWeight)
		} else {
			sk.strokeWeight(subtickWeight)
		}
		sk.line(0, ysc, camera.imgsize[0], ysc)
	}
}