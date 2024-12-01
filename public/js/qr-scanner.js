const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
let qrScannerActive = false;

async function startCamera() {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		video.play();
		scanQRCode();
	} catch (err) {
		// todo handle error
		console.error('Camera access denied:', err);
	}
}

function scanQRCode() {
	if (qrScannerActive) return;
	qrScannerActive = true;

	const interval = setInterval(() => {
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		const code = jsQR(imageData.data, imageData.width, imageData.height);

		if (code) {
			let id = code.data.substring(code.data.indexOf('/') + 1);
			
			console.log(id);
			// clearInterval(interval);
		}
	}, 100);
}

// Start the process
startCamera();
