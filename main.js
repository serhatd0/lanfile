const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "LAN File Sharer",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Menü çubuğunu gizle
  mainWindow.setMenuBarVisibility(false);

  // Linklerin varsayılan tarayıcıda açılmasını sağla
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Kullanıcı veri yolunu (AppData) sunucuya bildir
  process.env.LANFILE_USER_DATA = app.getPath('userData');

  // Sunucuyu başlat ve pencerede göster
  // require burada yapılmalı ki LANFILE_USER_DATA ayarlandıktan sonra okunsun
  const serverStart = require('./server');
  
  serverStart()
    .then((port) => {
      console.log('Sunucu başlatıldı, pencere yükleniyor...');
      mainWindow.loadURL(`http://localhost:${port}`);
    })
    .catch((err) => {
      console.error('Sunucu hatası:', err);
    });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
