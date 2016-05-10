// 文件拖拽
var holder = document.getElementsByTagName('body')[0];
var filename = undefined;

holder.ondragover = function () {
  return false;
};
holder.ondragleave = holder.ondragend = function () {
  return false;
};
holder.ondrop = function (e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];

  filename = file.path;
  
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
var ipc = require("electron").ipcRenderer;
ipc.on('load-file', function (event, data, fname) {
  filename = fname;
  editor.minder.importJson(data);
});

// 向 console 输出数据，调试用
ipc.on('console', function (event, data) {
  var i = 1;
  while (i < arguments.length) {
    console.log(arguments[i]);
    i += 1;
  }
});

// 用于保存/另存为
ipc.on('save-file', function (event, fname) {
  if (!Object.is(fname, undefined)) {
    filename = fname;
  }
  ipc.send('file-content', editor.minder.exportJson(), filename);
});

ipc.on('set-filename', function (event, fname) {
  filename = fname;
});

ipc.on('export-file', function (event, format) {
  editor.minder.exportData(format).then(function (data) {
    ipc.send('file-content', data);
  })
});
