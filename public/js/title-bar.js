document.getElementById('close').addEventListener('click', () => {
    window.windowControls.close();
});

document.getElementById('minimize').addEventListener('click', () => {
    window.windowControls.minimize();
});

document.getElementById('maximize').addEventListener('click', async () => {
    const isMaximized = await window.windowControls.isMaximized();
    if (isMaximized) {
        window.windowControls.unmaximize();
    } else {
        window.windowControls.maximize();
    }
});