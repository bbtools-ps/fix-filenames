const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

// Change this Object to include or exclude root directories that will be used for file search.
let settings = {
  rootDirs: [
    "x:\\2018\\",
    "x:\\2019\\",
    "x:\\2020\\",
    "x:\\2021\\",
    "u:\\2021\\",
  ],
};

/**
 *
 * @param {string} message = prompt message before User has the choice to go to "Main Menu" or to exit the app.
 */
const showPrompt = (message) => {
  const errorChoices = ["Main Menu", "Exit"];
  console.log("\n" + message + "\n");
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
        console.log("\nExiting...\n");
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
const getValidFile = (file, dir, dirName, extensionNames) => {
  const fileExtensions = new RegExp(extensionNames, "i");
  const rootDir = new RegExp(dirName, "i");
  let fileExtension = file.trim().match(fileExtensions);
  // if valid file extension is found in valid directory return that file
  if (rootDir.test(dir) && fileExtension.length) {
    const fileSrc = path.join(dir, file);
    return fileSrc;
  }
};

/**
 *
 * @param {string} fileSrc = complete path of the file including the directory, file name and file extension.
 * @returns {Object} oldSrc for the old file path, newSrc for the new file path
 */
const prepareFileForRename = (fileSrc) => {
  // get the directory from fileSrc path
  const dir = fileSrc.replace(/[^\\]+$/, "");
  // get the file from fileSrc path
  const file = fileSrc.replace(/^.+[\\]/, "");
  // regex for getting the file extension
  const extensionRegex = /\.[a-z]+$/;
  // file extension
  const fileExtension = fileSrc.trim().match(extensionRegex);
  // change file name
  let newName = file
    .trim()
    .replace(extensionRegex, "")
    .replace(/[()-.:,'"\!\?]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/copy[_\(0-9\)]*$/gi, "")
    .replace(/modif[_]*([0-9])[_]*/gi, "Modif$1")
    .replace(/modif$/gi, "Modif1")
    .replace(/^_+/, "")
    .replace(/_+$/g, "");

  newFileSrc = path.join(dir, newName + fileExtension[0]);

  // if the file name has changed, and file with the same name doesn't already exist add append it for rename
  if (fileSrc !== newFileSrc && !fs.existsSync(newFileSrc)) {
    return { oldSrc: fileSrc, newSrc: newFileSrc };
  }
};

/**
 *
 * @param {string} dir = root dir for performing file search.
 * @param {Object} filesLookup = the list of files and directories used for file/directory search.
 * @param {Object[]} validFiles = array of valid files.
 * @returns {Object[]} validFiles = array of valid and prepared files for renaming.
 */
const listDir = (dir, filesLookup = [], validFiles = []) => {
  let files = fs.readdirSync(dir);

  // find valid files
  files.forEach((file) => {
    // if item is directory look inside that directory
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      try {
        validFiles = listDir(path.join(dir, file), filesLookup, validFiles);
      } catch (err) {}
    } else {
      filesLookup.forEach((item) => {
        let foundFiles = getValidFile(
          file,
          dir,
          item.directoryName,
          item.fileNames
        );
        foundFiles ? validFiles.push(foundFiles) : null;
      });
    }
  });

  return validFiles;
};

/**
 *
 * @param {string} rootDir = root directory for perfoming file search.
 */
const fixFilenames = (rootDir) => {
  console.log("\nLooking for files. Please wait...");
  // Set the files lookup pattern
  const filesLookup = [
    {
      directoryName: /\\PSD\\*/,
      fileNames: /(.psd|.psb)$/,
    },
    {
      directoryName: /\\RENDER\\*/,
      fileNames: /(.jpg|.tif|.tiff)$/,
    },
  ];

  let foundFiles = listDir(rootDir, filesLookup);

  if (foundFiles.length) {
    foundFiles.forEach((f) => {
      let newFileName = prepareFileForRename(f);
      if (newFileName !== undefined) {
        try {
          console.log(
            `Renaming file: ${newFileName.oldSrc} > ${newFileName.newSrc}`
          );
          fs.renameSync(newFileName.oldSrc, newFileName.newSrc);
        } catch (err) {}
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
        name: "rootDir",
        message: "Choose the root directory?",
        choices: settings.rootDirs,
      },
    ])
    .then((answer) => {
      let rootDir = answer.rootDir;

      if (fs.existsSync(rootDir)) {
        fixFilenames(rootDir);
        showPrompt("All done!");
      } else {
        showPrompt("Directory not found!");
      }
    });
};

mainMenu();
