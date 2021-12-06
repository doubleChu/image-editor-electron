const {
    app,
    BrowserWindow
} = require('electron')

win = null

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // 是否集成 Nodejs
            contextIsolation: false,
        }
    })
    
    //win.removeMenu()
    win.loadFile('src/index.html')
    win.on('close', () => {
        win = null
    })
}

app.whenReady().then(() => {
    createWindow()
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit()
    })
})