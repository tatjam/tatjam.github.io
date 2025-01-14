const s = (s) => {

	imgsize = [200, 200];
	camera = defaultcamera(imgsize);
	camera.zoom = 3;

	s.setup = () => {
		s.createCanvas(imgsize[0], imgsize[1]);
	};

	s.draw = () => {
		s.background(0xde);

		s.stroke(0x8e);
		axes(s, 1.0, camera);
	};

};

let myp5 = new p5(s, 'viz1');