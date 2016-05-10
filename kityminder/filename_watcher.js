function filename_watcher (fname) {
  this.filename = fname;
  if (!Object.is(this.filename, undefined)) {
    fname_l = this.filename.split(/[\\/]/);
    document.title = fname_l[fname_l.length-1]+' - KityManager';
  }
  else {
   document.title = 'Untitled.km - KityManager';
  }
}

filename_watcher.prototype.setFilename = function (fname) {
  if (this.filename != fname) {
    this.filename = fname;
    fname_l = this.filename.split(/[\\/]/);
    document.title = fname_l[fname_l.length-1]+' - KityManager';
  }
}

filename_watcher.prototype.getFilename = function (fname) {
  return this.filename;
}

module.exports = filename_watcher;
