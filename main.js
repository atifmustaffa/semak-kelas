/* eslint-disable no-unused-vars */
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('path')
const pkgJSON = require('./package.json')
require('@electron/remote/main').initialize()
const Store = require('electron-store')
// Enable live reload for Electron too
if (process.env.APP_DEV) {
  require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`),
  })
}

const isMac = process.platform === 'darwin'
let mainWindow = undefined
const menuTemplate = [
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
            },
          ]
        : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Developer',
        click: async () => {
          shell.openExternal(pkgJSON.author_link)
        },
      },
      {
        label: 'Version ' + pkgJSON.version,
      },
    ],
  },
]

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      enableRemoteModule: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: __dirname + '/assets/student.ico',
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  if (process.env.APP_DEV) {
    mainWindow.webContents.openDevTools()
    console.log('Running in development')
  }

  let menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (!isMac) app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const store = new Store()

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key)
})

ipcMain.handle('setStoreValue', (event, key, value) => {
  return store.set(key, value)
})

ipcMain.handle('deleteStoreValue', (event, key) => {
  return store.delete(key)
})
