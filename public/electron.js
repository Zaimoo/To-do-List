const { app, BrowserWindow, Menu, shell} = require('electron');
const path = require("path");
const url = require("url");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
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
    
      let autoRunOnStart = false; // Initialize autoRunOnStart as false
      const loginItemSettings = app.getLoginItemSettings();
      autoRunOnStart = loginItemSettings.openAtLogin;
    
      // Create a custom menu
      const menuTemplate = [
        {
          label: 'Settings',
          submenu: [
            {
              label: 'Auto Run on Start',
              type: 'checkbox',
              checked: autoRunOnStart,
              click: async (menuItem) => {
                // Toggle the "Auto Run on Start" setting
                autoRunOnStart = !autoRunOnStart;
    
                // Update the app's login settings
                app.setLoginItemSettings({
                  openAtLogin: autoRunOnStart,
                });
    
                // Update the checkbox state
                menuItem.checked = autoRunOnStart;
              },
            },
          ],
        },
        {
          label: 'About',
          click: () => {
            // Handle the "About" menu item here (open a dialog or show information)
            // For example, you can use the shell module to open an external URL or show a dialog
            shell.openExternal('https://github.com/Zaimoo/to-do-list');
          },
        },
      ];
    
      const menu = Menu.buildFromTemplate(menuTemplate);
      Menu.setApplicationMenu(menu);

}

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