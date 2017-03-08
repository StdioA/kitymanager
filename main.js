'use strict';

const electron = require('electron');
const {dialog, Menu, BrowserWindow,ipcMain} = require('electron');
const {export_file, open_file, save_as, save_file} = require('./file_operation');
// Module to control application life.
const app = electron.app;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let activateWindows = [mainWindow];

// 初始化菜单
var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CommandOrControl+N',
        click: function (){
          var newWindow = createWindow();
        }
      },
      {
        label: 'Open file',
        accelerator: 'CommandOrControl+O',
        click: open_file
      },
      {
        label: 'Save',
        accelerator: "CommandOrControl+S",
        click: save_file
      },
      {
        label: 'Save As',
        accelerator: "CommandOrControl+Shift+S",
        click: save_as
      },
      {
        type: 'separator'
      },
      {
        label: 'Export',
        submenu: [
          {
            label: 'JSON',
            click: export_file
          },
          {
            label: 'Plain Text',
            click: export_file
          },
          {
            label: 'Markdown',
            click: export_file
          },
          {
            label: 'SVG',
            click: export_file
          },
          {
            label: 'PNG',
            click: export_file
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: 'Exit',
        accelerator: 'CommandOrControl+W',
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
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
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

function createWindow () {
  Menu.setApplicationMenu(menu);

  var newWindow = new BrowserWindow({width: 800, height: 600});
  activateWindows.push(newWindow);

  newWindow.loadURL('file://' + __dirname + '/kityminder/index.html');

  // popUp the message box when closed
  newWindow.on('close', function (e) {
    let response = dialog.showMessageBox({
      type: 'question',
      title: '关闭窗口',
      message: '将修改保存到文件？',
      buttons: ['是', '否', '取消'],
      cancelId: 2
    });

    if (response == 0) {
      e.preventDefault();
      save_file(null, newWindow, () => {
        newWindow.destroy();
      });
    } else if (response == 2) {
      e.preventDefault();
    }
  });

  // Emitted when the window is closed.
  newWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    newWindow = null;
    var index = activateWindows.indexOf(newWindow);
    if (index > -1) {
      activateWindows.splice(index, 1);
    }
  });
  return newWindow;
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
