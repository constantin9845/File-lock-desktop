const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const os = require('os');
const { exit, stderr, stdout } = require('process');
const { exec } = require('child_process');
const { error } = require('console');


const platform = os.platform();

let mainWindow;


var outputPath;
let executablePath;

app.on('ready', ()=>{
    if(app.isPackaged){
      if(process.platform === 'win32'){
        executablePath = path.join(process.resourcesPath, 'bin', 'win', 'enc.exe');
      }
      else{
        executablePath = path.join(app.getAppPath(), 'resources', 'bin', 'win', 'enc.exe');
      }
      
    }
    else{
      executablePath = path.join(__dirname, 'bin', 'enc');
    }

    console.log(executablePath);

    if(platform == 'win32'){
      mainWindow = new BrowserWindow({

        height: 800,
        width: 1100,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
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
    
});


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

  index = 0;
  files = 0;
  for(var e of data[0]){
    if(checkFile(e) == 0){
      if(platform == 'linux' || platform == 'darwin'){
        data[0][index] = e + '/\*';
      }
      else if(platform == 'win32'){
        data[0][index] =  e + '\\';
      }
    }

    if(checkFile(e) == 1){
      files++;
    }

    index++;
  }


  var parameters = [DIRECTION, MODE, KEY_SIZE, KEY_FILE, R_FLAG];

  var logs = [];
  var keyPath;
  let newKey = true;

  // create target directory
  if(!R_FLAG){
    outputPath = getNewDirectory();
  }


  // build keypath if multiple files and ENCRYPTING
  // ensures key is re used
  if(files > 1 && KEY_FILE == 'n' && DIRECTION == 'Encryption'){
    if(platform == 'darwin' || platform == 'linux'){
      keyPath = app.getPath('downloads');
      keyPath += '/_key';
    }
    else if(platform == 'win32'){
      keyPath = app.getPath('downloads');
      keyPath += '\\_key';
    }

    // Encrypt first file
    // adjust key path variable to re use key
    if (newKey) {
      try {
        let stdout = await encrypt(data[0][0], parameters);
        parameters[3] = keyPath;
        logs.push(stdout);
        newKey = false;
      } catch (err) {
        logs.push(err);
      }
    }
    
  
    // encrypt rest with new key file
    await Promise.all(
      data[0].slice(1).map(async (path) => {
        try {
          let stdout = await encrypt(path, parameters);
  
          logs.push(stdout);
        } catch (err) {
          logs.push(err);
        }
      })
    );
  }
  // all other cases
  // simply enc/dec all provided files
  else{
    await Promise.all(
      data[0].map(async (path) => {
        try {
          let stdout = await encrypt(path, parameters);
  
          logs.push(stdout);
        } catch (err) {
          logs.push(err);
        }
      })
    );
  }
  
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

function getNewDirectory(){
  let dir;

  if(platform == 'darwin' || platform == 'linux'){
    dir = app.getPath('downloads');
    dir += '/target/';
  }
  else if(platform == 'win32'){
    dir = app.getPath('downloads');
    dir += '\\target\\';
  }
  else{
    exit(3);
  }

  counter = 1;
  while(fs.existsSync(dir)){
    counter++;
    
    if(platform == 'darwin' || platform == 'linux'){
      if(counter == 2){
        dir = dir.substring(0, dir.length-1) + `${counter}/`; 
      }
      else{
        dir = dir.substring(0, dir.length-2) + `${counter}/`;
      }
    }
    else{
      if(counter == 2){
        dir = dir.substring(0, dir.length-1) + `${counter}\\`; 
      }
      else{
        dir = dir.substring(0, dir.length-2) + `${counter}\\`;
      }
    }
  }

  // create the new directory
  fs.mkdirSync(dir);

  return dir;

}

// Encrypt Files
function encrypt(path, parameters){

  return new Promise((resolve, reject)=>{
    let command;

    if(platform == 'linux' || platform == 'darwin'){
      command = `/${executablePath} "${path}" ${parameters[0]} ${parameters[1]} ${parameters[2]} "${parameters[3]}"`;
    
      if(parameters[4]){
        command += ` -r`
      }
      else{
        command += ` ${outputPath}`;
      }
    }
    else if(platform == 'win32'){

      if(checkFile(path) == 0){
        command = `.\\${executablePath} "${path}\\" ${parameters[0]} ${parameters[1]} ${parameters[2]} "${parameters[3]}"`;
      }
      else{
        command = `.\\${executablePath} "${path}" ${parameters[0]} ${parameters[1]} ${parameters[2]} "${parameters[3]}"`;
      }

    
      if(parameters[4]){
        command += ` -r`
      }
      else{
        command += ` ${outputPath}`;
      }
    }
    else{
      return reject("Unsupported platform")
    }

    console.log(command)

    exec(command, (error, stdout, stderr) =>{

      console.log(stdout);

      if(error){ reject(error); }
      else{ resolve(stdout) }
    })
  })

}