# FIX FILENAMES

Fix Filenames is a Node.js CLI script that is used to fix the names of all supported files from the selected directory.

## Development

### Requirements

1. [Node.js](https://nodejs.org/en/)
2. [Visual Studio Code (optional)](https://code.visualstudio.com/)

If Node.js is installed type

```
npm install
```

inside the Terminal to install all the dependencies required for this project.

### Testing

Run the script by running the **devStart.bat** file (only available on Windows) or type

```
node app.js
```

inside the Terminal from the VSCode.

### Build

Type

```
npm run build
```

inside the Terminal to make executable files for Windows, Linux and MacOS.
All executables are stored inside the _dist_ folder.

## Usage

1. Run the executable of the script (from the _dist_ folder).
2. Select the folder to be processed.
3. Press "Enter" and let the script do it's magic.

## Example of usage

**Input**

```
My file modif.psd
```

**Output**

```
My_file_Modif1.psd
```

## Supported file types

- .psd
- .psb
- .tif
- .tiff
- .jpg
