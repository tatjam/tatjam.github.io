import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector("#c")
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, 2, 0.01, 10);
camera.position.z = 1;

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

// Elements, but not resolved to a single position
class KeplerElements {
	constructor(e, a, i, Ω, ω) {
		this.e = e;
		this.a = a;
		this.i = i;
		this.Ω = Ω;
		this.ω = ω;
	}

	get_pos_from_true_anomaly(θ) {
		
	}
	
	get_pos_from_eccentric_anomaly(E) {

	}

	get_pos_from_mean_anomaly(M) {
		
	}

	get_pos_from_t(t) {

	}
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

	const geometry = new THREE.SphereGeometry(0.6371, 64, 64);
	const material = new THREE.MeshToonMaterial({color:'#acf', gradientMap: gradientMap});

	const mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

function main() {
	scene.add(earth);

	requestAnimationFrame(render);
}

main();

