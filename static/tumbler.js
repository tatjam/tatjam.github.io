document.addEventListener('DOMContentLoaded', function () {
	var canvas = document.getElementById('tumbler-canvas');
	if (!canvas) return;
	var ctx = canvas.getContext('2d');
	if (!ctx) return;

	var reduce = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	var colors = {};
	function readColors() {
		var style = getComputedStyle(document.documentElement);
		colors.accent = style.getPropertyValue('--amber').trim();
		colors.secondary = style.getPropertyValue('--blue').trim();
		colors.rule = style.getPropertyValue('--rule').trim();
	}
	readColors();
	document.addEventListener('themechange', readColors);

	var parts = [
		{ mass: 3.0, size: [0.7, 0.8, 0.4], center: [0, 0, 0], kind: 'bus' },
		{ mass: 0.45, size: [1.2, 1.0, 0.04], center: [1.05, 0, 0], kind: 'panel' },
		{ mass: 0.45, size: [1.2, 1.0, 0.04], center: [-1.05, 0, 0], kind: 'panel' },
		{ mass: 0.1, size: [0.05, 0.05, 0.35], center: [0, 0, 0.42], kind: 'mast' },
		{ mass: 0.15, size: [0.44, 0.44, 0.02], center: [0, 0, 0.62], kind: 'dish' }
	];

	var totalMass = 0;
	var com = [0, 0, 0];
	for (var p = 0; p < parts.length; p++) {
		totalMass += parts[p].mass;
		for (var k = 0; k < 3; k++) com[k] += parts[p].mass * parts[p].center[k] / totalMass;
	}

	var inertia = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
	for (var q = 0; q < parts.length; q++) {
		var part = parts[q];
		var s = part.size;
		var r = [part.center[0] - com[0], part.center[1] - com[1], part.center[2] - com[2]];
		var own = [
			part.mass * (s[1] * s[1] + s[2] * s[2]) / 12,
			part.mass * (s[0] * s[0] + s[2] * s[2]) / 12,
			part.mass * (s[0] * s[0] + s[1] * s[1]) / 12
		];
		var r2 = r[0] * r[0] + r[1] * r[1] + r[2] * r[2];
		for (var i = 0; i < 3; i++) {
			inertia[i][i] += own[i] + part.mass * (r2 - r[i] * r[i]);
			for (var j = i + 1; j < 3; j++) inertia[i][j] -= part.mass * r[i] * r[j];
		}
	}
	for (var a = 0; a < 3; a++) {
		for (var b = 0; b < 3; b++) if (a !== b) inertia[b][a] = inertia[a][b];
	}

	function invert(m) {
		var a = m[0][0], b = m[0][1], c = m[0][2];
		var d = m[1][0], e = m[1][1], f = m[1][2];
		var g = m[2][0], h = m[2][1], i = m[2][2];
		var A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
		var D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g);
		var G = b * f - c * e, H = -(a * f - c * d), I = a * e - b * d;
		var det = a * A + b * B + c * C;
		return [
			[A / det, D / det, G / det],
			[B / det, E / det, H / det],
			[C / det, F / det, I / det]
		];
	}

	var inverseInertia = invert(inertia);
	var omega = [0.12, 2.35, 0.08];
	var quat = [0, 0, 0, 1];

	function matVec(m, v) {
		return [
			m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
			m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
			m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
		];
	}

	function derivative(w) {
		var spin = matVec(inertia, w);
		var cross = [
			w[1] * spin[2] - w[2] * spin[1],
			w[2] * spin[0] - w[0] * spin[2],
			w[0] * spin[1] - w[1] * spin[0]
		];
		return matVec(inverseInertia, [-cross[0], -cross[1], -cross[2]]);
	}

	function multiply(a, b) {
		return [
			a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
			a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2],
			a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0],
			a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
		];
	}

	function normalize(q) {
		var length = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
		for (var i = 0; i < 4; i++) q[i] /= length;
	}

	function step(dt) {
		var k1 = derivative(omega);
		var w2 = [omega[0] + k1[0] * dt / 2, omega[1] + k1[1] * dt / 2, omega[2] + k1[2] * dt / 2];
		var k2 = derivative(w2);
		var w3 = [omega[0] + k2[0] * dt / 2, omega[1] + k2[1] * dt / 2, omega[2] + k2[2] * dt / 2];
		var k3 = derivative(w3);
		var w4 = [omega[0] + k3[0] * dt, omega[1] + k3[1] * dt, omega[2] + k3[2] * dt];
		var k4 = derivative(w4);

		var average = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			omega[i] += dt * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6;
			average[i] = (omega[i] + w4[i]) / 2;
		}

		var spin = multiply(quat, [average[0], average[1], average[2], 0]);
		for (var j = 0; j < 4; j++) quat[j] += 0.5 * spin[j] * dt;
		normalize(quat);
	}

	function rotate(v) {
		var result = multiply(multiply(quat, [v[0], v[1], v[2], 0]), [-quat[0], -quat[1], -quat[2], quat[3]]);
		return [result[0], result[1], result[2]];
	}

	var edges = [];
	function addEdge(a, b, kind) {
		edges.push({ a: a, b: b, kind: kind });
	}

	function addBox(part) {
		var s = part.size;
		var c = [part.center[0] - com[0], part.center[1] - com[1], part.center[2] - com[2]];
		var hx = s[0] / 2, hy = s[1] / 2, hz = s[2] / 2;
		var v = [];
		for (var z = -1; z <= 1; z += 2) {
			for (var y = -1; y <= 1; y += 2) {
				for (var x = -1; x <= 1; x += 2) {
					v.push([c[0] + x * hx, c[1] + y * hy, c[2] + z * hz]);
				}
			}
		}
		var pairs = [[0, 1], [1, 3], [3, 2], [2, 0], [4, 5], [5, 7], [7, 6], [6, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
		for (var i = 0; i < pairs.length; i++) {
			addEdge(v[pairs[i][0]], v[pairs[i][1]], part.kind);
		}
		if (part.kind === 'panel') {
			for (var gx = 1; gx < 4; gx++) {
				var px = c[0] - hx + gx * s[0] / 4;
				addEdge([px, c[1] - hy, c[2] + hz], [px, c[1] + hy, c[2] + hz], 'cell');
			}
			for (var gy = 1; gy < 2; gy++) {
				var py = c[1] - hy + gy * s[1] / 2;
				addEdge([c[0] - hx, py, c[2] + hz], [c[0] + hx, py, c[2] + hz], 'cell');
			}
		}
	}

	for (var partIndex = 0; partIndex < parts.length; partIndex++) {
		if (parts[partIndex].kind !== 'dish') addBox(parts[partIndex]);
	}

	var dish = parts[4];
	var dishZ = dish.center[2] - com[2];
	var dishRim = [];
	for (var n = 0; n < 12; n++) {
		var angle = n * Math.PI / 6;
		dishRim.push([Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, dishZ]);
	}
	for (var e = 0; e < dishRim.length; e++) {
		addEdge(dishRim[e], dishRim[(e + 1) % dishRim.length], 'dish');
		if (e % 3 === 0) addEdge([0, 0, dishZ], dishRim[e], 'dish');
	}
	addEdge([0, 0, dishZ], [0, 0, dishZ + 0.12], 'dish');
	addEdge([0, 0, dishZ + 0.12], [0.1, 0, dishZ], 'dish');
	addEdge([0, 0, dishZ + 0.12], [-0.1, 0, dishZ], 'dish');

	var size = 0;
	function resize() {
		var rect = canvas.getBoundingClientRect();
		var ratio = window.devicePixelRatio || 1;
		size = Math.min(rect.width, rect.height);
		canvas.width = Math.max(1, Math.round(rect.width * ratio));
		canvas.height = Math.max(1, Math.round(rect.height * ratio));
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		draw();
	}

	function project(v, cx, cy, scale) {
		var depth = 1 / (1 - v[2] * 0.1);
		return [cx + v[0] * scale * depth, cy - v[1] * scale * depth, v[2]];
	}

	function draw() {
		if (!size) return;
		var width = canvas.width / (window.devicePixelRatio || 1);
		var height = canvas.height / (window.devicePixelRatio || 1);
		var cx = width / 2;
		var cy = height / 2;
		var scale = size * 0.24;

		ctx.clearRect(0, 0, width, height);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.strokeStyle = colors.rule;
		ctx.globalAlpha = 0.55;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(cx, cy, size * 0.43, 0, Math.PI * 2);
		ctx.moveTo(cx - size * 0.46, cy);
		ctx.lineTo(cx + size * 0.46, cy);
		ctx.moveTo(cx, cy - size * 0.46);
		ctx.lineTo(cx, cy + size * 0.46);
		ctx.stroke();

		for (var i = 0; i < edges.length; i++) {
			var edge = edges[i];
			var a = project(rotate(edge.a), cx, cy, scale);
			var b = project(rotate(edge.b), cx, cy, scale);
			var depth = (a[2] + b[2]) / 2;
			var alpha = Math.max(0.18, Math.min(1, 0.45 + depth * 0.7));
			if (edge.kind === 'cell') alpha *= 0.55;

			ctx.globalAlpha = alpha;
			ctx.lineWidth = edge.kind === 'bus' ? 1.7 : edge.kind === 'panel' ? 1.4 : edge.kind === 'cell' ? 0.7 : 1;
			ctx.strokeStyle = edge.kind === 'panel' || edge.kind === 'cell' ? colors.secondary : colors.accent;
			ctx.beginPath();
			ctx.moveTo(a[0], a[1]);
			ctx.lineTo(b[0], b[1]);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}

	window.addEventListener('resize', resize);
	document.addEventListener('themechange', draw);
	resize();

	var previous = 0;
	function frame(time) {
		var dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
		dt *= 0.25
		previous = time;
		if (dt > 0) {
			var steps = Math.max(1, Math.ceil(dt / (1 / 240)));
			for (var i = 0; i < steps; i++) step(dt / steps);
		}
		draw();
		requestAnimationFrame(frame);
	}

	if (reduce) {
		draw();
	} else {
		requestAnimationFrame(frame);
	}
});
