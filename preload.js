const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose APIs to the renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    printDocument:    () => ipcRenderer.send('printDocument'),
    savePageAsPDF:    () => ipcRenderer.send('savePageAsPDF'),
    onStatusUpdate:   (callback) => ipcRenderer.on('log', (event, message) => callback(message)),
});
