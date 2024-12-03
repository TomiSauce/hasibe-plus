/**
 * Activating the scanner
 */
let scanner;
$(document).ready(() => {
	scanner = new ScannerController();
	scanner.startCamera();
});

function stopCamera() {
	scanner.stopCamera();
}

function startCamera() {
	scanner.startCamera();
}