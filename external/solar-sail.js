import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';


var GUI = lil.GUI;

const canvas = document.querySelector("#c")
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, 2, 0.1, 500);
camera.position.z = 20;

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(10, 0, 0);
light.target.position.set(0, 0, 0);
scene.add(light);
scene.add(light.target);

const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

const earth = create_earth();

const controls = new OrbitControls(camera, renderer.domElement);

const μ = 3.986004418e14;

// Every 1000km on real world equals to one unit of our graphics
const GRAPHICS_SCALE = 1e-6;

// Elements, but not resolved to a single position
// (taken from new-ospgl)
class KeplerElements {
	constructor(e, a, i, Ω, ω) {
		this.e = e;
		this.a = a;
		this.i = i;
		this.Ω = Ω;
		this.ω = ω;
	}

	get_pos_from_eccentric_anomaly(E) {
		const flat = [0, 0];
		
		const sinE = Math.sin(E);
		const cosE = Math.cos(E);
		const e2 = this.e * this.e;
		const sqrt1me2 = Math.sqrt(1.0 - e2);
		
		flat[0] = this.a * (cosE - this.e);
		flat[1] = this.a * sqrt1me2 * sinE;

		// Matrix to rotate flat to 3D space
		const xx =  Math.cos(this.ω) * Math.cos(this.Ω) - Math.sin(this.ω) * Math.sin(this.Ω) * Math.cos(this.i);
		const xy = -Math.sin(this.ω) * Math.cos(this.Ω) - Math.cos(this.ω) * Math.sin(this.Ω) * Math.cos(this.i);
		const yx = Math.sin(this.ω) * Math.sin(this.i);
		const yy = Math.cos(this.ω) * Math.sin(this.i);
		const zx =  Math.cos(this.ω) * Math.sin(this.Ω) + Math.sin(this.ω) * Math.cos(this.Ω) * Math.cos(this.i);
		const zy = -Math.sin(this.ω) * Math.sin(this.Ω) + Math.cos(this.ω) * Math.cos(this.Ω) * Math.cos(this.i); 

		return [
			-(xx * flat[0] + xy * flat[1]),
			yx * flat[0] + yy * flat[1],
			zx * flat[0] + zy * flat[1]
		]
	}

	get_pos_from_mean_anomaly(M) {
		const Mnorm = M % (2.0 * Math.PI);

		// Estimate initial value

		const t34 = this.e * this.e;
		const t35 = this.e * t34;
		const t33 = Math.cos(Mnorm)

		const tol = 0.0001;

		var Eprev = Mnorm + (-0.5 * t35 + this.e + (t34 + 1.5 * t33 * t35) * t33) * Math.sin(Mnorm)
		var de = tol + 1.0;
		var count = 0;

		var E = 0.0;

		while(de > tol) 
		{
			const t1 = Math.cos(Eprev);
			const t2 = this.e * t1 - 1.0;
			const t3 = Math.sin(Eprev);
			const t4 = this.e * t3;
			const t5 = t4 + Mnorm - Eprev;
			const t6 = t5 / (0.5 * t5 * t4 / t2 + t2);
			const eps3 = t5/((0.5 * t3 - 1.0 / 6.0 * t1 * t6) * this.e * t6 + t2);

			E = Eprev - eps3 
			de = Math.abs(E - Eprev);
			Eprev = E;
			count++;

			// To not hog up user's browser if stuff is going wrong
			if(count > 20)
			{
				break;
			}

		}
		
		return this.get_pos_from_eccentric_anomaly(E);

	}

	get_pos_from_t(t) {
		const T = 2.0 * Math.PI / Math.sqrt(μ) * Math.pow(this.a, 1.5);
		const M = 2.0 * Math.PI * t / T;	

		return this.get_pos_from_mean_anomaly(M);
	}
}


const orbit_mat = new LineMaterial({linewidth: 5.0, vertexColors: true});
const nominal_orbit = new KeplerElements(0.1, 10000e3, 0, 0, 0);
var orbit_geom = create_orbit_geometry(nominal_orbit, orbit_mat);

var gui_state = {
	orbit_e: 0.1,
	orbit_a: 10000,
	orbit_i: 0,
	orbit_ω: 0,
	orbit_Ω: 0
}

var gui = new GUI( {container: document.querySelector("#canvas-cont")});
gui.domElement.style.position = 'absolute';
gui.domElement.style.top = '10px';
gui.domElement.style.right = '10px';
gui.domElement.style.zIndex = '1000';


gui.add(gui_state, 'orbit_e', 0, 0.99).name("e");
gui.add(gui_state, 'orbit_a').name("a (km)");
gui.add(gui_state, 'orbit_i', 0, 360).name("i (deg)");
gui.add(gui_state, 'orbit_ω', 0, 360).name("ω (deg)");
gui.add(gui_state, 'orbit_Ω', 0, 360).name("Ω (deg)");

gui.onChange ( event => {
	if(event.property == "orbit_e") 
	{
		nominal_orbit.e = event.value;
	}
	else if(event.property == "orbit_a") 
	{
		nominal_orbit.a = event.value * 1000;
	}
	else if(event.property == "orbit_i") 
	{
		nominal_orbit.i = event.value * Math.PI / 180.0;
	}
	else if(event.property == "orbit_ω") 
	{
		nominal_orbit.ω = event.value * Math.PI / 180.0;
	}
	else if(event.property == "orbit_Ω") 
	{
		nominal_orbit.Ω = event.value * Math.PI / 180.0;
	}
	scene.remove(orbit_geom);
	orbit_geom = create_orbit_geometry(nominal_orbit, orbit_mat);
	scene.add(orbit_geom);
})

function is_eclipsed(pos) {
	// We project on yz plane, and there eclipse check is as simple as r < earth radius
	const len = Math.sqrt(pos[1]*pos[1] + pos[2] * pos[2]);
	return len < 6371e3 && pos[0] < 0;
}

function resize_renderer(renderer) {
	const canvas = renderer.domElement;
	const pixel_ratio = window.devicePixelRatio;
	const width = Math.floor(canvas.clientWidth * pixel_ratio);
	const height = Math.floor(canvas.clientHeight * pixel_ratio);
	const need_resize = canvas.width !== width || canvas.height !== height;
	if ( need_resize ) {
		renderer.setSize(width, height, false);
	}

	return need_resize;
}

function animate(time) {
	controls.update();

	const nominal_satellite_pos = nominal_orbit.get_pos_from_t(time);

}

function render(time) {
	if (resize_renderer(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

	animate(time);

	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

function create_earth() {
	const colors = new Uint8Array(2);
	colors[0] = 120;
	colors[1] = 255;

	const gradientMap = new THREE.DataTexture( colors, colors.length, 1, THREE.RedFormat );
	gradientMap.needsUpdate = true;

	const geometry = new THREE.SphereGeometry(6.371, 64, 64);
	const material = new THREE.MeshToonMaterial({color:'#acf', gradientMap: gradientMap});

	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

/** 
 * @param {KeplerElements} orbit
 */
function create_orbit_geometry(orbit, mat) {
	const points = [];
	const colors = [];

	for(var E = 0.0; E < 2.0 * Math.PI; E += 0.01) 
	{
		const pos = orbit.get_pos_from_eccentric_anomaly(E);
		points.push(pos[0] * GRAPHICS_SCALE, pos[1] * GRAPHICS_SCALE, pos[2] * GRAPHICS_SCALE);
		const eclipsed = is_eclipsed(pos);
		if(eclipsed) 
		{
			colors.push(0.2, 0.2, 0.2);
		}
		else 
		{
			colors.push(0.7, 0.7, 0.7);
		}
	}
	
	// Close the orbit
	points.push(points[0]);
	colors.push(colors[0]);

	console.log(points);

	const geom = new LineGeometry();
	geom.setPositions(points);
	geom.setColors(colors);
	const line = new Line2(geom, mat);
	

	return line;
}

function main() {
	scene.add(earth);
	scene.add(orbit_geom);

	requestAnimationFrame(render);
}

main();

