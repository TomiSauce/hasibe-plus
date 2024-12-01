/**
 * Copyright (c) 2024 Luca Tomasi
 * Licensed under the MIT License. See LICENSE file for details.
 */

const { app, BrowserWindow, session , ipcMain, dialog, shell } = require('electron');
const fs = require('fs');

const conf = {
    dev: true,
    defaultFileSavePath: `${app.getPath('desktop')}/`
}

let mainWindow;

/**
 * Function to create the main window
 */
const createMainWindow = () => {
    try {

        /**
         * Create main window
         */
        mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            titleBarStyle: 'hidden',
            webPreferences: {
                contextIsolation: true, // Recommended for security
                devTools: conf.dev,
                // Disable Autofill related features if they are causing issues
                disableBlinkFeatures: 'Autofill',
                nodeIntegration: true,
                preload: __dirname + '/preload.js',
            }
        });
        mainWindow.maximize();

        /**
         * Set permissions on sources
         */
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            const responseHeaders = {
              ...details.responseHeaders,
              'Content-Security-Policy': [
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
              ],
            };
            // callback(false);                 // Block all permissions for enhanced security
            callback({ responseHeaders });      // Allows only the listed permissions
        });

        /**
         * Load HTML file
         */
        mainWindow.loadFile(__dirname + '/public/index.html');

        /**
         * Allows the use of the camera
         */
        app.commandLine.appendSwitch('enable-experimental-web-platform-features');

        /**
         * Print page
         */
        ipcMain.on('printDocument', () => {
            checkPrintersAndPrint();
        }); 
        
        /**
         * Save page to PDF
         */
        ipcMain.on('savePageAsPDF', () => {
            savePageAsPDF();
        })

        /**
         * Main window controlls
         */
        ipcMain.on('window-close', () => mainWindow.close());
        ipcMain.on('window-minimize', () => mainWindow.minimize());
        ipcMain.on('window-maximize', () => mainWindow.maximize());
        ipcMain.on('window-unmaximize', () => mainWindow.unmaximize());
        ipcMain.handle('window-is-maximized', () => mainWindow.isMaximized());

        /**
         * Intercept opening a new window and open domains in the default browser
         */
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            if (!url.startsWith('file://')) {
                shell.openExternal(url);
                return { action: 'deny' };
            }
            return { action: 'allow' };
        });

        /**
         * Open DevTools if in dev mode
         */
        if (conf.dev) mainWindow.webContents.openDevTools();

    } catch (e) {
        console.error('Error: could not create main window', e);
        app.quit();
    }

}

function sendLog(msg) {
    mainWindow.webContents.send('log', msg);
}

 /**
 * Save PDF file to file system
 */
 function savePDFToFileSystem(savePath) {
    mainWindow.webContents.printToPDF({}).then(data => {
        fs.writeFileSync(savePath, data);
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'PDF gespeichert',
            message: `Das Dokument wurde als PDF gespeichert unter: ${savePath}`,
        });
    }).catch(err => {
        sendLog(`Failed to save PDF: ${err}`);
        dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'PDF nicht gespeichert',
            message: 'PDF konnte nicht gespeichert werden, versuchen Sie es erneut.',
        });
    });
}

/**
 * Opens dialog to get save file path then calls function to save file to sys
 */
function savePageAsPDF() {
    dialog.showSaveDialog(mainWindow, {
        title: 'Save PDF',
        defaultPath: conf.defaultFileSavePath + '/hasibe.pdf',
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    }).then(saveDialogResult => {
        if (!saveDialogResult.canceled) {
            const savePath = saveDialogResult.filePath;
            savePDFToFileSystem(savePath);
        } else {
            sendLog('Save operation was canceled.');
        }
    }).catch(err => {
        savePDFToFileSystem(conf.defaultFileSavePath);
        sendLog(`Error showing save dialog: ${err.message}`);
    });
}

/**
 * Checks available printer and prints or falls back to generate a pdf
 */
function checkPrintersAndPrint() {
    mainWindow.webContents.getPrintersAsync().then(printers => {
        if (printers.length > 0) {
            // Printers available
            mainWindow.webContents.print({}, (success, errorType) => {
                if (!success) {
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        title: 'Fehler beim Drucken',
                        message: 'Beim Drucken ist etwas schief gelaufen, wird als PDF gespeichert.',
                    });
                    savePageAsPDF();
                    sendLog(`Printing failed: ${errorType}`);
                } else {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Wird gedruckt...',
                        message: `Drucke mit dem Standard Drucker: "${printers[0].name}"`,
                    });
                }
            });
        } else {
            // No printers available, fallback to PDF
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                title: 'Keine Drucker verfügbar',
                message: 'Es sind keine Drucker verfügbar. Wird als PDF gespeichert.',
            }).then(() => {
                savePageAsPDF();
            });
        }
    }).catch(err => {
        sendLog(`Error fetching printers: ${err.message}`);
    });
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
