'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;


// 初始化菜单
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CommandOrControl+N',
        click: function (){
          var newWindow = createNewWindow();
        }
      },
      {
        label: 'Open file',
        accelerator: 'CommandOrControl+O',
        click: function (item, focusedWindow) {
          // 打开文件
          const dialog = require('electron').dialog;
          dialog.showOpenDialog (focusedWindow, { 
                          title: "Open Mindmap",
                          properties: [ 'openFile' ],
                          filters: [
                            { name: 'KityMinder File', extensions: ['km'] },
                            { name: 'All Files', extensions: ['*'] }
                          ]
                        }, function (filenames) {
                          var fs = require('fs');
                          if (!Object.is(filenames, undefined)) {
                            var filename = filenames[0];
                            fs.readFile(filename, 'utf8', function (err, data) {
                              focusedWindow.webContents.send('load-file', JSON.parse(data), filename);
                            });
                          }
                        });
        }
      },
      {
        label: 'Save',
        accelerator: "CommandOrControl+S",
        click: function (item, focusedWindow) {
          focusedWindow.webContents.executeJavaScript("editor.minder.exportJson()", true, function (data) {
            // focusedWindow.webContents.send('console', data);
            focusedWindow.webContents.executeJavaScript("filename", true, function (fname) {
              var fs = require('fs');
              fs.writeFile(fname, JSON.stringify(data), 'utf8', function (err) {
                if (err) throw err;
                focusedWindow.webContents.send('console', 'saved!');
              });

            });
          });
        }
      },
      {
        label: 'Save As',
        accelerator: "CommandOrControl+Shift+S",
        click: function (item, focusedWindow) {
          const dialog = require('electron').dialog;
          dialog.showSaveDialog (focusedWindow, { 
                          title: "Save As",
                          dafaultPath: "",
                          filters: [
                            { name: 'KityMinder File', extensions: ['km'] },
                            { name: 'All Files', extensions: ['*'] }
                          ]
                        }, function (filename) {
                          var fs = require('fs');

                          if (!Object.is(filename, undefined)) {
                            focusedWindow.webContents.executeJavaScript("editor.minder.exportJson()", true, function (data) {
                              var fs = require('fs');

                              focusedWindow.webContents.send('console', filename);

                              fs.writeFile(filename, JSON.stringify(data), 'utf8', function (err) {
                                if (err) throw err;
                                focusedWindow.webContents.send('console', filename+'saved!');
                              });

                            });
                          }
                        });
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Exit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'Command+Z',
        selector: 'undo:'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Command+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'Command+X',
        selector: 'cut:'
      },
      {
        label: 'Copy',
        accelerator: 'Command+C',
        selector: 'copy:'
      },
      {
        label: 'Paste',
        accelerator: 'Command+V',
        selector: 'paste:'
      },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CommandOrControl+R',
        click: function() { BrowserWindow.getFocusedWindow().reloadIgnoringCache(); }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'F12',
        click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); }
      },
    ]
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:'
      },
      {
        label: 'Close',
        accelerator: 'Command+W',
        selector: 'performClose:'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        selector: 'arrangeInFront:'
      },
    ]
  },
];

var menu = Menu.buildFromTemplate(template);

function createNewWindow () {
  Menu.setApplicationMenu(menu); // Must be called within app.on('ready', function(){ ... });

  // Create the browser window.
  var newWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  newWindow.loadURL('file://' + __dirname + '/kityminder/index.html');

  // Open the DevTools.
  // newWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  newWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    newWindow = null;
  });
  return newWindow;
}

function createWindow () {
  Menu.setApplicationMenu(menu); // Must be called within app.on('ready', function(){ ... });

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/kityminder/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
