// 文件拖拽
var holder = document.getElementsByTagName('body')[0];
var filename = "Untitled.km";

holder.ondragover = function () {
  return false;
};
holder.ondragleave = holder.ondragend = function () {
  return false;
};
holder.ondrop = function (e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];

  console.log(file);
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

ipc.on('console', function (event, data) {
  console.log(data);
})
