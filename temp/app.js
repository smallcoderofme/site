"use strict";

if(navigator.mediaDevices.getUserMedia === undefined){
	navigator.mediaDevices.getUserMedia = function(constraints){
		var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (!getUserMedia) {
			return Promise.reject(new Error("getUserMedia is not implemented in this brower"));
		}

		return new Promise(function(resolve, reject) {
			getUserMedia.call(navigator, constraints, resolve, reject);
		});
	}
}

var audioCtx =  new (window.AudioContext || window.webkitAudioContext)();
var sourceNode = null,
	theBuffer = null,
	analyser = null,
	buflen = 1024,
	rafID,
	buf = new Float32Array( buflen );

function ajaxRequest(url){
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.responseType = "arraybuffer";
		xhr.onload = (e) => resolve(xhr.response);
		xhr.onerror = (e) => reject(xhr.statusText);
		xhr.send();
	});
} 

function getAudio(url){
	ajaxRequest(url).then((audioData)=>{
		audioCtx.decodeAudioData(audioData, 
		function(buffer){
			theBuffer = buffer;
			console.log(theBuffer);
			playAudio();
		}, (e)=>{

		});
	})
}
var canvas, 
	rndColor,
	ctx,
	num = -1;
function initCanvas(){
	canvas = document.getElementById("canvas");
}

function onChangeHandle(e){
	num++;
	var rndColor = 'rgb(' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255) + ',0)';
	var files = document.getElementById('mp3').files;
	var file = files[0];
	// var file1 = files[1];
	// console.log(file);
	var reader = new FileReader();
    reader.onload = function(e){
        var data = e.target.result;
        var viewBuffer = new DataView(data, 0, data.byteLength);
		var count = viewBuffer.byteLength;
		for (var i = 0; i < count; i++) {
			var d = viewBuffer.getInt8(i);
			if(d == 0 || d == -1){
				continue;
			}
	    	if(num == 0){
				stand.push(d);
			}else{
				compa.push(d);
			}
		}
		if(stand.length && compa.length){
        	cosineDistance(stand, compa);
        }
        console.log(data);
     	viewBuffer = new DataView(data, 0, data.byteLength);
		audioCtx.decodeAudioData( data, function(buffer) {
			theBuffer = buffer;
			playAudio(file.name);
    	});
	}
	if(file){
		reader.readAsArrayBuffer(file);
	}else{
		alert("请选择一个mp3文件");
	}
}
initCanvas();
function playAudio(fileName){
	sourceNode = audioCtx.createBufferSource();
	sourceNode.buffer = theBuffer;
	sourceNode.loop = false;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioCtx.destination );
    sourceNode.onended = function(){
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        console.log("ended");
        if(stand.length && compa.length){
        	cosineDistance(stand, compa);
        }
        rndColor = 'rgb(' + Math.floor(Math.random()*255) + ',' + Math.floor(Math.random()*255) + ',0)';
        ctx = canvas.getContext("2d");
		ctx.fillStyle = "red";

		ctx.fillStyle = rndColor;
     	ctx.fillRect(2, num*22, 20, 20);
	  	ctx.font = "22 Aria";
		ctx.fillText(fileName, 26, num*22+14, 60);


		ctx.strokeStyle = "green";
		ctx.beginPath();
		ctx.moveTo(0, 360);
		ctx.lineTo(1280, 360);
		ctx.stroke();

	  	ctx.font = "22 Aria";
		ctx.fillText(fileName, 26, num*22+14, 60);

		ctx.strokeStyle = rndColor;
		ctx.beginPath();
		ctx.moveTo(0, pitchArr[0]);
		var count = pitchArr.length,
			offsetX = 1280/count;
		for(var i = 0; i < count; i++){
			// var c = new Circle(i, 360-viewBuffer.getInt8(i));
			// ctx.fill(c);
			ctx.lineTo(i*offsetX, 700-pitchArr[i]);
		}
		ctx.stroke();
    }
	sourceNode.start( 0 );
	// if(pitchArr.length){
	// 	pitchArr.splice(0, pitchArr.length);
	// }
	updatePitch();
}
var stand = new Array(), compa = new Array();
function cosineDistance(standard, compare){
	var dot = 0,
		normStandard = 0,
		normCompare = 0;
	var stdLen = standard.length,
		comLen = compare.length;
	var count = Math.min(stdLen, comLen);
	for (var i = 0; i<count;i++) {
		dot += Math.abs(standard[i]) * Math.abs(compare[i]);
		normStandard += Math.abs(standard[i]) * Math.abs(standard[i]);
		normCompare += Math.abs(compare[i]) * Math.abs(compare[i]);
	}
	var distance = dot / (Math.sqrt(normStandard) * Math.sqrt(normCompare));
	console.log("distance: ",distance*100+"%", distance*10*distance*10+"%");
	stand.splice(0, stand.length);
	compa.splice(0, compa.length);
	num = -1;
}

var pitchArr = new Array();
function updatePitch(time){
	analyser.getFloatTimeDomainData( buf );
	var ac = autoCorrelate( buf, audioCtx.sampleRate );
	console.log(ac);
	if(num == 0){
		stand.push(ac);
	}else{
		compa.push(ac);
	}
	pitchArr.push(ac);
	console.log(ac);
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}
var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be
function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}
// getAudio("sounds/1.mp3");