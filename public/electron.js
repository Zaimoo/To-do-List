const { app, BrowserWindow, Menu, shell, ipcMain, Notification} = require('electron');
const path = require("path");
const url = require("url");

require('@electron/remote/main').initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
      eanbleRemoteModule: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "icon.ico")
  });

  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000";
  win.loadURL(appURL);
 
  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }
    
      Menu.setApplicationMenu(null);

}

const sendNotification = (title, message) => {
  const notification = new Notification({
    title: title,
    body: message,
    icon: path.join(__dirname, "icon.ico")
  });

  notification.show();
};

ipcMain.on('trigger-notification', (event, title, message) => {
  sendNotification(title, message);
});

ipcMain.on('toggle-auto-start', (event, bool) => {
  app.setLoginItemSettings({
    openAtLogin: bool,
  });
});

ipcMain.on('run-about', (event, link) => {
  shell.openExternal(link);
});

app.whenReady().then(createWindow);

// Quit the app when all windows are closed (unless on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});