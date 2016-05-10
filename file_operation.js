var export_file = function (menuItem, focusedWindow) {
  var ipc = focusedWindow.webContents;
  const dialog = require('electron').dialog;
  const ipcMain = require('electron').ipcMain;
  const fs = require('fs');

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
      if (!fname) {
        return;
      }
      fs.writeFile(fname, data, 'utf8', function (err) {
      if (err) throw err;
      event.sender.send('console', 'exported, '+fname);
    });
  });
  })
}

module.exports = {
	export_file: export_file
}
