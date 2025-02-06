const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');

const os = require('os');
const { exit, stderr, stdout } = require('process');
const { exec } = require('child_process');
const { error } = require('console');


const platform = os.platform();

let mainWindow;

const winEXEC = 'g++ .\\src\\main.cpp .\\src\\fileHandler.cpp .\\src\\AES.cpp';
const unixEXEC = 'g++ src/main.cpp src/fileHandler.cpp src/AES.cpp -o enc'

const winRUN = '.\\a.exe';
const unixRUN = './enc';

app.on('ready', ()=>{
    if(platform == 'win32'){
      mainWindow = new BrowserWindow({

        height: 800,
        width: 1100,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        },
      });
    }
    else{
      mainWindow = new BrowserWindow({

        height: 800,
        width: 1200,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        },
      });
    }
    

    mainWindow.loadFile('index.html');
    

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

// Handle directory selection
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
ipcMain.on('path-collection', async(event,data)=>{

  // parameters
  // parameters
  let KEY_FILE;

  let DIRECTION;
  let MODE;
  let KEY_SIZE;
  let R_FLAG;

  KEY_FILE = data[2];

  DIRECTION = data[1][0];
  MODE = data[1][1];
  KEY_SIZE = data[1][2];
  R_FLAG = (data[1][3]);




  let parameters = [DIRECTION, MODE, KEY_SIZE, KEY_FILE, R_FLAG];

  var logs = [];

  await Promise.all(
    data[0].map(async (path) => {
      try {
        const stdout = await encrypt(path, parameters);
        logs.push(stdout);
      } catch (err) {
        logs.push(err);
      }
    })
  );


  event.reply('encryption-logs', logs);

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


// Encrypt Files
function encrypt(path, parameters){

  return new Promise((resolve, reject)=>{
    let command;

    if(platform == 'linux' || platform == 'darwin'){
      command = `./enc "${path}" ${parameters[0]} ${parameters[1]} ${parameters[2]} "${parameters[3]}"`;
    
      if(parameters[4]){
        command += ` -r`
      }
    }
    else if(platform == 'win32'){
      command = `.\\a.exe "${path}" ${parameters[0]} ${parameters[1]} ${parameters[2]} "${parameters[3]}"`;
    
      if(parameters[4]){
        command += ` -r`
      }
    }
    else{
      return reject("Unsupported platform")
    }

    exec(command, (error, stdout, stderr) =>{

      console.log(stdout);

      if(error){ reject(error); }
      else{ resolve(stdout) }
    })
  })

}