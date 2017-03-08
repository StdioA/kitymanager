const {ipcRenderer} = require("electron");
var fname_wather = require('./filename_watcher');
// 文件拖拽
var holder = document.getElementsByTagName('body')[0];
var filename = new fname_wather();

holder.ondragover = holder.ondragleave = holder.ondragend = () => {
  return false;
};

holder.ondrop = function (e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];

  // filename = file.path;
  filename.setFilename(file.path);
  
  var reader = new FileReader();
  reader.onload = (function (file) {
    return function (e) {
      editor.minder.importJson(JSON.parse(this.result));
    }
  })(file);

  reader.readAsText(file);
  return false;
};

// 打开文件
ipcRenderer.on('load-file', function (event, data, fname) {
  filename.setFilename(fname);
  editor.minder.importJson(data);
});

// 向 console 输出数据，调试用
ipcRenderer.on('console', function (event, data) {
  var i = 1;
  while (i < arguments.length) {
    console.log(arguments[i]);
    i += 1;
  }
});

// 保存/另存为
ipcRenderer.on('save-file', function (event, fname) {
  if (!Object.is(fname, undefined)) {
    filename.setFilename(fname);
  }
  ipcRenderer.send('file-content', editor.minder.exportJson(), filename.getFilename());
});

// 另存为后设置文件名
ipcRenderer.on('set-filename', function (event, fname) {
  filename.setFilename(fname);
});

// 按格式导出文件
ipcRenderer.on('export-file', function (event, format) {
  editor.minder.exportData(format).then(function (data) {
    ipcRenderer.send('file-content', data);
  })
});


const keyListener = () => {
  setTimeout(() => {
    if (editor.history.hasUndo()) {
      console.log('File Changed!');
      ipcRenderer.send('file-changed', true);
      removeEventListener('keydown', keyListener);
    }
  }, 100);
}

$(document).ready(() => {
  addEventListener('keydown', keyListener);
});
