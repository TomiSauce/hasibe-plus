/**
 * Activating the scanner
 */
let scanner;
$(document).ready(() => {
	scanner = new ScannerController();
	scanner.startCamera();
});