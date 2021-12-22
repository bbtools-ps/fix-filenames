const path = require("path");
const fs = require("fs");

const listDir = (dir, fileList = []) => {
  let files = fs.readdirSync(dir);

  // Find and prepare files for renaming
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      try {
        fileList = listDir(path.join(dir, file), fileList);
      } catch (e) {}
    } else {
      // get file extension and store it
      let fileExtension = file.trim().match(/(.psd|.psb)$/);
      if (fileExtension.length) {
        let name = file
          .trim()
          .replace(/(.psd|.psb)$/, "")
          .replace(/[()-.:,'"\!\?]+/g, "")
          .replace(/\s+/g, "_")
          .replace(/_+/g, "_")
          .replace(/copy[_\(0-9\)]*$/gi, "")
          .replace(/modif[_]*([0-9])[_]*/gi, "Modif$1")
          .replace(/modif$/gi, "Modif1")
          .replace(/^_+/, "")
          .replace(/_+$/g, "");
        let src = path.join(dir, file);
        let newSrc = path.join(dir, name + fileExtension[0]);
        if (src !== newSrc) {
          fileList.push({
            oldSrc: src,
            newSrc: newSrc,
          });
        }
      }
    }
  });

  return fileList;
};

console.log("BBTools Fix Filenames v1.0.0\n\nLooking for files...");

let foundFiles = listDir("u:\\2021\\");
if (foundFiles.length) {
  foundFiles.forEach((f) => {
    console.log(`Renaming file: ${f.oldSrc} => ${f.newSrc}`);
    try {
      if (fs.existsSync(f.newSrc)) {
        console.log("File already exists");
      } else {
        fs.renameSync(f.oldSrc, f.newSrc);
      }
    } catch (err) {
      console.error(err);
    }
  });
}

console.log("All done.");
