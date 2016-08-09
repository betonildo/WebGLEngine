'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;

const WebcamStream = function(){

	// private 
	let internal_webcamDomElement = null;


	// public function
	WebcamStream.prototype.getVideoStream = function(videoStream){
		
		internal_createDomElement();

		if (window.URL){
			internal_webcamDomElement.src = window.URL.createObjectURL(videoStream);
		} 
		else{
			internal_webcamDomElement.src = videoStream;
		}

		internal_webcamDomElement.onerror = function(streamError){
			videoStream.stop();
		};

		videoStream.onended = internal_handleStreamErrorEvent;
	}

	WebcamStream.prototype.getVideoDomElement = function(){
		return internal_webcamDomElement;
	}

	// private function
	function internal_createDomElement(){
		internal_webcamDomElement = document.createElement("video");
		internal_webcamDomElement.setAttribute("style","display: none; width: 320px; height: 240px;");
	}




	if (!navigator.getUserMedia) 
	{
		alert("navigator.getUserMedia() =",navigator.getUserMedia);
	}

	navigator.getUserMedia({video: true}, this.getVideoStream.bind(this), internal_handleStreamErrorEvent);

	function internal_handleStreamErrorEvent(streamError) 
	{
		var msg = "No camera available.";
		if (streamError.code == 1)
			msg = "User denied access to use camera.";

		alert(msg);
	}
}


window.onload = function(){
	const webcamStreamObject = new WebcamStream();

	const videoCanvas = document.createElement("canvas");
	videoCanvas.style = "float: left;";
	videoCanvas.width = 320;
	videoCanvas.height = 240;

	document.body.appendChild(videoCanvas);

	const videoContext = videoCanvas.getContext("2d");

	const postProcessingVideoCanvas = document.createElement("canvas");
	postProcessingVideoCanvas.style = "float: left;";
	postProcessingVideoCanvas.width = 320;
	postProcessingVideoCanvas.height = 240;

	document.body.appendChild(postProcessingVideoCanvas);

	const postProcessingVideoContext = postProcessingVideoCanvas.getContext("2d");


	let lastFrameImage = null;
	let currentFrameImage = null;
	let resultingPostPrecessedFrameImage = null;

	function updateAndRender(){
		requestAnimationFrame(updateAndRender);

		renderVideoToVideoCanvas();
	}

	function renderVideoToVideoCanvas() 
	{	
		const videoDomElement = webcamStreamObject.getVideoDomElement();
		if (videoDomElement && videoDomElement.readyState === videoDomElement.HAVE_ENOUGH_DATA)
		{
			// mirror video
			videoContext.drawImage(videoDomElement, 0, 0, videoCanvas.width, videoCanvas.height);

			// Working precess

			// draw new element
			postProcessingVideoContext.drawImage(videoDomElement, 0, 0, postProcessingVideoCanvas.width, postProcessingVideoCanvas.height);

			// get current draw frame image data
			currentFrameImage = postProcessingVideoContext.getImageData(0, 0, postProcessingVideoCanvas.width, postProcessingVideoCanvas.height);

			// calculate the difference between frames
			resultingPostPrecessedFrameImage = getVectorDiffBetweenImage(lastFrameImage, currentFrameImage);

			//differenceAccuracy(resultingPostPrecessedFrameImage.data, currentFrameImage.data, lastFrameImage.data);

			// put the resulting frame image to the context
			postProcessingVideoContext.putImageData(resultingPostPrecessedFrameImage, 0, 0);

			// get last image data from post processing video context
			lastFrameImage = postProcessingVideoContext.getImageData(0, 0, postProcessingVideoCanvas.width, postProcessingVideoCanvas.height);
		}
	}

	updateAndRender();


	function getVectorDiffBetweenImage(lastFrameBlobData, currentFrameBlobData){

		let processingFrameBlobData = postProcessingVideoContext.createImageData(postProcessingVideoCanvas.width, postProcessingVideoCanvas.height);

		if (!lastFrameBlobData) return processingFrameBlobData;

		if (lastFrameBlobData.data.length !== currentFrameBlobData.data.length) return processingFrameBlobData;
			
		let threshold = document.getElementById("threshold").value;
		let midThreshold = document.getElementById("midThreshold").value;

		for(let blobIndex = 0; blobIndex < lastFrameBlobData.data.length / 4; blobIndex++){
			let redDiff = currentFrameBlobData.data[blobIndex * 4 + 0] - lastFrameBlobData.data[blobIndex * 4 + 0];//red
			let greenDiff = currentFrameBlobData.data[blobIndex * 4 + 1] - lastFrameBlobData.data[blobIndex * 4 + 1];//green
			let blueDiff = currentFrameBlobData.data[blobIndex * 4 + 2] - lastFrameBlobData.data[blobIndex * 4 + 2];//blue
			let alphaDiff = currentFrameBlobData.data[blobIndex * 4 + 3] - lastFrameBlobData.data[blobIndex * 4 + 3];//alpha
			
			let meanDiffBetweenChannels = (redDiff + greenDiff + blueDiff) / 3;
			let resultingChannelPixelForAll = meanDiffBetweenChannels < threshold ? 0 : (meanDiffBetweenChannels < midThreshold ? 128 : 255);

			let currentUseingColorForExperiment = redDiff > 5 ? 0 : 255;

			let meanPixelColorOfCurrentFrame = (currentFrameBlobData.data[blobIndex * 4 + 0] +
												currentFrameBlobData.data[blobIndex * 4 + 1] +
												currentFrameBlobData.data[blobIndex * 4 + 2]) / 3;

			let pixelColorSelectionByThreshold = meanPixelColorOfCurrentFrame < threshold ? 0 : (meanPixelColorOfCurrentFrame < midThreshold ? 128 : 255);

			processingFrameBlobData.data[blobIndex * 4 + 0] = pixelColorSelectionByThreshold;
			processingFrameBlobData.data[blobIndex * 4 + 1] = pixelColorSelectionByThreshold;
			processingFrameBlobData.data[blobIndex * 4 + 2] = pixelColorSelectionByThreshold;
			processingFrameBlobData.data[blobIndex * 4 + 3] = 255;
		}

		return processingFrameBlobData;
	}

	// reference="mainForThreeJS.js"
	//initThreeJSWithOrthographicView();

	InitGL();
};

function differenceAccuracy(target, data1, data2) 
{
	if (data1.length != data2.length) return null;
	var i = 0;
	while (i < (data1.length * 0.25)) 
	{
		var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
		var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
		var diff = threshold(fastAbs(average1 - average2));
		target[4*i]   = diff;
		target[4*i+1] = diff;
		target[4*i+2] = diff;
		target[4*i+3] = 0xFF;
		++i;
	}
}
function fastAbs(value) 
{
	return (value ^ (value >> 31)) - (value >> 31);
}
function threshold(value) 
{
	return (value > 0x15) ? 0xFF : 0;
}