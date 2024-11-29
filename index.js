const { app, BrowserWindow, session } = require('electron');

const conf = {
    dev: true
}

let mainWindow;

const createMainWindow = () => {
    try {
        mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            webPreferences: {
                contextIsolation: true, // Recommended for security
                devTools: conf.dev,
                // Disable Autofill related features if they are causing issues
                disableBlinkFeatures: 'Autofill',
            }
        });
        mainWindow.maximize();

        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            const responseHeaders = {
              ...details.responseHeaders,
              'Content-Security-Policy': [
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
              ],
            };
            // callback(false);                 // Block all permissions for enhanced security
            callback({ responseHeaders });      // Allows only the listed permissions
        });
        
        // Load HTML file
        mainWindow.loadFile('public/index.html');

    } catch (e) {
        console.error('Error: could not create main window', e);
        app.quit();
    }

    // Open DevTools (optional)
    if (conf.dev) mainWindow.webContents.openDevTools();

}

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});