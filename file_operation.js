const dialog = require('electron').dialog;
const ipcMain = require('electron').ipcMain;
const fs = require('fs');

var open_file = function (item, focusedWindow) {
  // 打开文件
  dialog.showOpenDialog (focusedWindow, { 
                  title: "Open Mindmap",
                  properties: [ 'openFile' ],
                  filters: [
                    { name: 'KityMinder File', extensions: ['km'] },
                    { name: 'All Files', extensions: ['*'] }
                  ]
                }, function (filenames) {
                  if (!Object.is(filenames, undefined)) {
                    var filename = filenames[0];
                    fs.readFile(filename, 'utf8', function (err, data) {
                      focusedWindow.webContents.send('load-file', JSON.parse(data), filename);
                    });
                  }
                });
}

var save_as = function (item, focusedWindow) {
  var ipc = focusedWindow.webContents;

  dialog.showSaveDialog (focusedWindow, {
                  title: "Save As",
                  dafaultPath: "",
                  filters: [
                    { name: 'KityMinder File', extensions: ['km'] },
                    { name: 'All Files', extensions: ['*'] }
                  ]
                }, function (filename) {
                    ipc.send('save-file', filename);
                    ipcMain.once('file-content', function (event, content, fname) {
                      event.sender.send('console', fname, content);

                      fs.writeFile(fname, JSON.stringify(content), 'utf8', function (err) {
                        if (err) throw err;
                        event.sender.send('console', 'saved!');
                      });
                    });
                  });
}

var save_file = function (item, focusedWindow) {
  var ipc = focusedWindow.webContents;

  ipc.send('save-file');
  ipcMain.once('file-content', function (event, content, fname) {
    if (Object.is(fname, null)) {
      fname = dialog.showSaveDialog (focusedWindow, { 
                  title: "Save Mindmap",
                  properties: [ 'openFile' ],
                  filters: [
                    { name: 'KityMinder File', extensions: ['km'] },
                    { name: 'All Files', extensions: ['*'] }
                  ]
                });
      if (!fname) return;
      else ipc.send('set-filename', fname);
    }

    fs.writeFile(fname, JSON.stringify(content), 'utf8', function (err) {
      if (err) throw err;
      event.sender.send('console', 'saved, '+fname);
    });
  });
}

var export_file = function (menuItem, focusedWindow) {
  var ipc = focusedWindow.webContents;

  var formats = {
    'JSON': 'json',
    'Plain Text': 'text',
    'Markdown': 'markdown',
    'SVG': 'svg',
    'PNG': 'png'
  }

  var filters = {
    'JSON': { name: 'JSON', extensions: ['json'] },
    'Markdown': { name: 'Markdown', extensions: ['md']},
    'Plain Text': { name: 'Plain Text', extensions: ['txt']},
    'SVG': { name: 'SVG', extensions: ['svg']},
    'PNG': { name: 'PNG', extensions: ['png']},
  }
  var format = formats[menuItem.label];

  ipc.send('export-file', format);
  ipcMain.once('file-content', function (event, data) {
    event.sender.send('console', 'data: '+data);
    if (format == 'png') {
      data = data.slice(22);
      data = new Buffer(data, 'base64');
    }
    
    var fname = dialog.showSaveDialog(focusedWindow, {
                          title: "Export",
                          dafaultPath: "",
                          filters: [filters[menuItem.label]]
    }, function (fname) {
      if (!fname) return;

      fs.writeFile(fname, data, 'utf8', function (err) {
        if (err) throw err;
        event.sender.send('console', 'exported, '+fname);
      });
    });
  })
}

module.exports = {
  open_file: open_file,
  save_file: save_file,
  save_as: save_as,
	export_file: export_file,
}
