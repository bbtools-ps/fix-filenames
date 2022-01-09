const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

let settings = {
  locations: [
    "x:\\2018\\",
    "x:\\2019\\",
    "x:\\2020\\",
    "x:\\2021\\",
    "u:\\2021\\",
  ],
};

const showError = (errorMessage) => {
  const errorChoices = ["Back", "Exit"];
  console.log("\n" + errorMessage + "\n");
  inquirer
    .prompt([
      {
        type: "list",
        name: "error",
        message: "Go back?",
        choices: errorChoices,
      },
    ])
    .then((answer) => {
      if (answer.error === "Back") {
        main();
      } else if (answer.error === "Exit") {
        console.log("\nExiting...");
      }
    });
};

const prepareFile = (file, dir, dirName, extensionNames) => {
  const fileExtensions = new RegExp(extensionNames, "i");
  const rootDir = new RegExp(dirName, "i");
  let fileExtension = file.trim().match(fileExtensions);
  // if valid file extension is found in valid dir proceed to rename
  if (rootDir.test(dir) && fileExtension.length) {
    let name = file
      .trim()
      .replace(fileExtensions, "")
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
      return {
        oldSrc: src,
        newSrc: newSrc,
      };
    }
  }
};

const listDir = (dir, fileList = []) => {
  let files = fs.readdirSync(dir);

  // Find and prepare files for renaming
  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      try {
        fileList = listDir(path.join(dir, file), fileList);
      } catch (e) {}
    } else {
      let validFilePSD = prepareFile(file, dir, /\\PSD\\*/, /(.psd|.psb)$/);
      let validFileJPG = prepareFile(
        file,
        dir,
        /\\RENDER\\*/,
        /(.jpg|.tif|.tiff)$/
      );
      validFilePSD ? fileList.push(validFilePSD) : null;
      validFileJPG ? fileList.push(validFileJPG) : null;
    }
  });

  return fileList;
};

const fixFilenames = (projectDir) => {
  console.log("\nLooking for files. Please wait...");
  let foundFiles = listDir(projectDir);
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
};

console.log("BBTools Fix Filenames v1.0.0\n");

const main = () => {
  console.clear();
  inquirer
    .prompt([
      {
        type: "list",
        name: "location",
        message: "Choose the location?",
        choices: settings.locations,
      },
    ])
    .then((answer) => {
      let projectDir = answer.location;

      if (fs.existsSync(projectDir)) {
        fixFilenames(projectDir);
        console.log("\nAll done.\n");
      } else {
        showError("Directory not found!");
      }
    });
};

main();
