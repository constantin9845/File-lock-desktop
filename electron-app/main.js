const { app, BrowserWindow, ipcMain, dialog } = require('electron');

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
