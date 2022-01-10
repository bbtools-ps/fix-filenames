const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

// Change this Object to include or exclude directories that will be used for file search.
let settings = {
  locations: [
    "x:\\2018\\",
    "x:\\2019\\",
    "x:\\2020\\",
    "x:\\2021\\",
    "u:\\2021\\",
  ],
};

/**
 *
 * @param {string} errorMessage = message to be displayed as error message.
 */
const showError = (errorMessage) => {
  const errorChoices = ["Main Menu", "Exit"];
  console.log("\n" + errorMessage + "\n");
  inquirer
    .prompt([
      {
        type: "list",
        name: "option",
        message: "Go back?",
        choices: errorChoices,
      },
    ])
    .then((answer) => {
      if (answer.option === "Main Menu") {
        mainMenu();
      } else if (answer.option === "Exit") {
        console.log("\nExiting...");
      }
    });
};

/**
 *
 * @param {string} file = item from files array.
 * @param {string} dir = root dir for performing file search.
 * @param {regex} dirName = regular expression of the directory name that is used for testing with the current root directory.
 * @param {regex} extensionNames = regular expression of valid file extensions that is used for matching the the regex with current file extension.
 * @returns {(Object|undefined)} = if match is found when testing directory name and file extensions it returns an object with the oldSrc and newSrc properties, otherwise it returns undefined.
 */
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

/**
 *
 * @param {string} dir = root dir for performing file search.
 * @param {Object[]} fileList = array of valid files.
 * @returns {Object[]} fileList = array of valid and prepared files for renaming.
 */
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

/**
 *
 * @param {string} projectDir = root directory for perfoming file search.
 */
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

const mainMenu = () => {
  console.clear();
  console.log("BBTools Fix Filenames v1.0.0\n");
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

mainMenu();
