const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

const os = require('os');
const { exit } = require('process');
const { exec } = require('child_process');


const platform = os.platform();

let mainWindow;

const winEXEC = 'g++ .\\src\\main.cpp .\\src\\fileHandler.cpp .\\src\\AES.cpp';
const unixEXEC = 'g++ src/main.cpp src/fileHandler.cpp src/AES.cpp -o enc'

const winRUN = '.\\a.exe';
const unixRUN = './enc';

app.on('ready', ()=>{
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    if(platform == 'win32'){
      mainWindow.loadFile('index2.html');
    }
    else{
      mainWindow.loadFile('index.html');
    }
    

    // compile c++ files
    if(platform == 'darwin' || platform == 'linux'){
      exec(unixEXEC, (error, stdout,stderr)=>{
        if(error){
          console.log(error.message);
          return;
        }

        if(stderr){
          console.log(stderr);
          return
        }
      });
    }
    else if(platform == 'win32'){
      exec(winEXEC, (error, stdout,stderr)=>{
        if(error){
          console.log(error.message);
          return;
        }

        if(stderr){
          console.log(stderr);
          return
        }
      })
    }
    else{
      process.exit();
    }
})


// Handle file selection
ipcMain.handle('select-files', async () => {
    var result;
    if(platform == 'darwin' || platform == 'linux' || platform == 'win32'){
      result = await dialog.showOpenDialog(mainWindow, {
      
        properties: ['openFile', 'multiSelections'], // Allow multiple file selection
      });
    }
    else{
      process.exit();
    }
    

    if (result.canceled) {
      return null; // User canceled the dialog
    }
  
    return result.filePaths; // Return the selected file paths
});

// Handle directory selection WIN
ipcMain.handle('select-dirs', async ()=>{
  var result;
  result = await dialog.showOpenDialog(mainWindow, {
      
    properties: ['openDirectory', 'multiSelections'], // Allow multiple file selection
  });

  if (result.canceled) {
    return null; // User canceled the dialog
  }

  return result.filePaths; // Return the selected file paths
})

// Handle key file selection
ipcMain.handle('select-key', async ()=>{
  let result = await dialog.showOpenDialog(mainWindow, {

    properties: ['openFile'],
  })

  if(result.canceled){
    return null;
  }

  return result.filePaths;
})

// parse paths and submit to file lock
ipcMain.on('path-collection', (event,data)=>{

  // parameters
  let KEY_FILE = data[2];
  let DIRECTION = data[1][0];
  let MODE = data[1][1];
  let KEY_SIZE = data[1][2];

  console.log(KEY_FILE);
  console.log(DIRECTION);
  console.log(MODE);
  console.log(KEY_SIZE);

  // Clean data
  for(var e of data[0]){
    
    if(checkFile(e) == 0){
      
      //WIN
      if(platform == 'win32'){
        e = e + '\\';
      }
      else{
        e = e + '/*';
      }
    }
  }


})

function checkFile(path){
  try {
    const stats = fs.statSync(path);

    if (stats.isDirectory()) {
        return 0;
    } else if (stats.isFile()) {
        return 1;
    } else {
        return 2;
    }
} catch (error) {
    console.error(`Error checking path: ${error.message}`);
}
}