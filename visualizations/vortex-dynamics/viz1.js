const s = (s) => {

	imgsize = [200, 200];
	camera = defaultcamera(imgsize);
	camera.zoom = 10;

	vortices = [
		makevortex([-1, 1], -1),
		makevortex([1, 1], -1),
		makevortex([-1, -1], 1),
		makevortex([1, -1], 1),
	]

	s.setup = () => {
		s.createCanvas(imgsize[0], imgsize[1]);
	};

	s.draw = () => {
		s.background(0xde);


		simulate(vortices, 0.1);


		s.stroke(0x8e);
		axes(s, 1.0, camera);

		s.stroke('red')
		s.strokeWeight(5);
		for (let vortexi = 0; vortexi < vortices.length; vortexi++) {
			let vortex = vortices[vortexi];
			let pos = v2screen(vortex.p, camera);
			s.point(pos[0], pos[1]);
		}
	};

};

let myp5 = new p5(s, 'viz1');