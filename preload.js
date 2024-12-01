const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose APIs to the renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    printDocument: () => ipcRenderer.send('printDocument'),
    savePageAsPDF: () => ipcRenderer.send('savePageAsPDF'),
    getCurrentWindow: async () => { return await ipcRenderer.invoke('getCurrentWindow'); },
    onStatusUpdate: (callback) => ipcRenderer.on('log', (event, message) => callback(message)),
});

contextBridge.exposeInMainWorld('windowControls', {
    close: () => ipcRenderer.send('window-close'),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    unmaximize: () => ipcRenderer.send('window-unmaximize'),
    isMaximized: async () => await ipcRenderer.invoke('window-is-maximized'),
});