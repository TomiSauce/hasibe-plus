class ScannerController {

    constructor() {}

    isScannerActive = false;
    interval = null;
    video = null;
    canvas = null;
    context = null;
    scannedUIDs = [];

    async startCamera() {
        this.video = document.getElementById('camera');
        this.canvas = document.getElementById('camera-canvas');
        this.context = this.canvas.getContext('2d', { willReadFrequently: true });
        this.isScannerActive = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.video.play();
            this.scanQRCode();
        } catch (err) {  
            switch (err.name) {
                
                case 'NotReadableError':
                    try {
                        if (View.confirm('Kamera wird bereits genutzt. Soll die Kamera für "Häsibe+" übernommen werden?')) {
                            await this.stopCamera(); // Wait until the camera is stopped
                            await this.startCamera(); // Start the camera after it's stopped
                        }
                    } catch (err) {
                        console.log('Error stopping camera:', err);
                    }
                    break;

                case 'NotAllowedError':
                    View.alert('Kamera-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browsereinstellungen. #C5');
                    break;

                case 'NotFoundError' || 'DevicesNotFoundError':
                    View.alert('Keine Kamera gefunden. Bitte verbinden Sie eine Kamera und versuchen Sie es erneut. #C130');
                    break;

                case 'OverconstrainedError':
                    View.alert('Kamera-Einstellungen nicht unterstützt. Bitte versuchen Sie es mit anderen Einstellungen. #C17');
                    console.log('Unsatisfied constraints:', err.constraint);
                    break;

                case 'SecurityError':
                    View.alert('Kamera-Zugriff wurde aus Sicherheitsgründen blockiert. Stellen Sie sicher, dass die Website über HTTPS ausgeführt wird. #C2');
                    break;

                case 'AbortError':
                    View.alert('Kamera-Zugriff wurde abgebrochen. Bitte versuchen Sie es erneut. #C47');
                    break;

                case 'TypeError':
                    View.alert('Ungültige Kamera-Anfrage. Bitte kontaktieren Sie den Support. #C390');
                    break;
                    
                default:
                    View.alert('Kamera nicht verfügbar, QR-Codes werden nicht gelesen. #C0')
                    console.log(err.name, err);
                    break;
            }          
            
        }
    }

    /**
     * (use with CAUTION or USER confirmation) STOPPING ALL CAMERA FEEDS ON THE ENTIRE DEVICE
     */
    stopCamera() {
        return new Promise((resolve, reject) => {
            if (this.video && this.video.srcObject) {
                console.log('Stopping camera...');
                const tracks = this.video.srcObject.getTracks();
                tracks.forEach(track => track.stop()); // Stop the camera
                this.video.srcObject = null;
                resolve(); // Resolve the promise when done
            } else {
                console.log('No camera stream found to stop.');
                reject('No camera to stop.');
            }
        });
    }

    scanQRCode() {
        if (this.isScannerActive) return;
        this.isScannerActive = true;
    
        this.interval = setInterval(() => {
            if (!this.isScannerActive) clearInterval(this.interval)
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                let id = code.data.substring(code.data.indexOf('/') + 1);
                if (!id.toString().length) return;

                let user = new User(id);
                id = user.get('id');
                if (isNaN(id)) return;

                let time = new Date().getTime();
                if (this.scannedUIDs[id] !== undefined && time - this.scannedUIDs[id] < 5000) return;

                // Set task of user to default task
                user.set('taskID', DefaultTask.getAll()[0].get('taskID')).save();
                // set user to be listed in the search list
                SearchController.searchByID(id);

                View.playSound('charge.mp3');
                this.scannedUIDs[user.get('id')] = time;
            }
        }, 200);
    }
}
