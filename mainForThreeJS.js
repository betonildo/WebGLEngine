'use strict';

const TestingScene = function(){

	// set the scene size
	const WIDTH = 320;
	const HEIGHT = 240;

	// set some camera attributes
	const VIEW_ANGLE = 45;
	const ASPECT = WIDTH / HEIGHT;
	const NEAR = 0.1;
	const FAR = 10000;


	// create a WebGL renderer, camera
	// and a scene
	const renderer = new THREE.WebGLRenderer();
	const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	const scene = new THREE.Scene();
	
	scene.add(camera);

	renderer.setSize(WIDTH, HEIGHT);
	
	document.body.appendChild(renderer.domElement);

	// renderer 
	TestingScene.prototype.renderTestingScene = function(){
		renderer.render(scene, camera);
		requestAnimationFrame(this.renderTestingScene.bind(this));
	};

	TestingScene.prototype.setRenderSize = function(newRendererWidth, newRendererHeight){
		renderer.setSize(newRendererWidth, newRendererHeight);
	};
};

function initThreeJSWithOrthographicView(){

	const testingSceneObject = new TestingScene();
	testingSceneObject.renderTestingScene();
}