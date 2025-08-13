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
        executablePath = path.join(process.resourcesPath, 'bin', 'enc.exe');
      }
      else{
        executablePath = path.join(process.resourcesPath, 'bin', 'enc');
      }
      
    } 
    else{
      if(platform == 'win32'){
        executablePath = path.join(__dirname, 'resources', 'bin', 'win', 'enc.exe');
      }
      else if(platform == 'darwin'){
        executablePath = path.join(__dirname, 'resources', 'bin', 'mac', 'enc');
      }
      else if(platform == 'linux'){
        executablePath = path.join(__dirname, 'resources', 'bin', 'linux', 'enc');
      }
      else{
        alert("Unknown OS");
        exit(2);
      }
    }

    //console.log("Executeable path: " +executablePath);

    mainWindow = new BrowserWindow({

      webPreferences:{
          nodeIntegration: true,
          contextIsolation: false,
          devTools: false,
      },
    });
    
    mainWindow.maximize();
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

// DATA:
// [fileCollection] [ [dir collection] [params] [key path] [AD message] ]
// [fileCollection] data[0] : all file paths
// [dir collection] data[0] : directory path
// [params]         data[1] : direction [0] | keySize [1] | replaceFlag [2] | authFlag [3] | ADFlag [4] 
// [key path]       data[2] : path of key file
// [AD message]     data[3] : empty string if none

  // parameters
  let KEY_FILE;

  let DIRECTION;
  let KEY_SIZE;
  let R_FLAG;

  KEY_FILE = data[2];

  DIRECTION = (data[1][0] == "Encryption" ? "enc" : "dec");
  KEY_SIZE = data[1][1];
  R_FLAG = data[1][2];
  AUTH_FLAG = data[1][3];
  AD_FLAG = data[1][4];

  AD = data[3];


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


  var parameters = [DIRECTION, KEY_SIZE, KEY_FILE, R_FLAG, AUTH_FLAG, AD_FLAG, AD, "n", "false"];

  var logs = [];
  var keyPath;

  // create output directory
  if(!R_FLAG && DIRECTION == "enc" && files > 1){
    outputPath = getNewDirectory();
    parameters[7] = outputPath; // tells fileHandler where to store files
  }
  else{
    parameters[7] = "n";
  }


  // Handle List of files
  // Ensure key reused
  if(files > 1){

    // encryption
    if(DIRECTION == "enc"){
      // Create new key path
      if(KEY_FILE == 'n'){

        // create new key file path
        if(platform == 'darwin' || platform == 'linux'){
          keyPath = app.getPath('downloads');
          keyPath += `/_key_`;
        }
        else if(platform == 'win32'){
          keyPath = app.getPath('downloads');
          keyPath += `\\_key_`;
        }

        keyPath += ((KEY_SIZE == "128") ? "128_" : (KEY_SIZE == "192") ? "192_" : "256_");
        keyPath += fileName();

        parameters[2] = keyPath;
        KEY_FILE = keyPath;
        parameters[8] = 'create'; // tells fileHandler to create a new key with path provided

        temp = true;
        for(const path of data[0]){
          try{
            let stdout = await encrypt(path, parameters);
            if (temp) {
              parameters[8] = "false";
              temp = false;
            }
            logs.push(stdout);
          }
          catch(err){
            logs.push(err);
          }
        }

      }
      else{
        parameters[2] = KEY_FILE;

        await Promise.all(
          data[0].slice(0).map(async (path) => {
            try {
              let stdout = await encrypt(path, parameters);
              logs.push(stdout);
            } catch (err) {
              logs.push(err);
            }
          })
        );
      }

    }
    else{
      /*
      await Promise.all(
        data[0].slice(0).map(async (path) => {
          try {
            let stdout = await encrypt(path, parameters);
            logs.push(stdout);
          } catch (err) {
            logs.push(err);
          }
        })
      );
      */
      for(const path of data[0]){
          try{
            let stdout = await encrypt(path, parameters);
            logs.push(stdout);
          }
          catch(err){
            logs.push(err);
          }
      }
    }
    
  }

  // 1 file / 1 dir
  else{
    /*
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
    */
    for(const path of data[0]){
      try{
        let stdout = await encrypt(path, parameters);
        logs.push(stdout);
      }
      catch(err){
        logs.push(err);
      }
    }
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
    dir += `/target_${fileName()}/`;
  }
  else if(platform == 'win32'){
    dir = app.getPath('downloads');
    dir += `\\target_${fileName()}\\`;
  }
  else{
    exit(3);
  }

  // create the new directory
  fs.mkdirSync(dir);

  return dir;

}

function fileName(length = 5){
  const alph = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let res = '';

  for (let i = 0; i < length; i++) {
    res += alph.charAt(Math.floor(Math.random() * alph.length));
  }

  return res;
}

// Encrypt Files
function encrypt(path, parameters){

    // [DIRECTION, KEY_SIZE, KEY_FILE, R_FLAG, AUTH_FLAG, AD_FLAG, AD, [optional output dir] [create = create key with this name]]

    // ADJUST command -> dont omit any params, just add all in different ways.

    // [execpath] [path] [enc/dec] [keySize] "[keyfile/n]" [r/n] [auth/n] [AD/n] "[AD message]" "[output dir/n]" [create = create key with this name]

  return new Promise((resolve, reject)=>{
    let command;

    if(platform == 'linux' || platform == 'darwin'){

      command = `${executablePath} "${path}" ${parameters[0]} ${parameters[1]} "${parameters[2]}" ${parameters[3]} ${parameters[4]} ${parameters[5]} "${parameters[6]}" "${parameters[7]}" "${parameters[8]}"`;
    }
    else if(platform == 'win32'){

      if(checkFile(path) == 0){
        command = `${executablePath} "${path}\\" ${parameters[0]} ${parameters[1]} "${parameters[2]}" ${parameters[3]} ${parameters[4]} ${parameters[5]} "${parameters[6]}" "${parameters[7]}" ${parameters[8]}`;
      }
      else{
        command = `${executablePath} "${path}" ${parameters[0]} ${parameters[1]} "${parameters[2]}" ${parameters[3]} ${parameters[4]} ${parameters[5]} "${parameters[6]}" "${(parameters[7] != "n" ? parameters[7].slice(0,-1) : "n")}" ${parameters[8]}`;
      }

    }
    else{
      return reject("Unsupported platform")
    }

    /*
    console.log("Parameters:")
    console.log(`File: ${path}`);
    console.log(`Direction: ${parameters[0]}`);
    console.log(`Key Size: ${parameters[1]}`);
    console.log(`Key File: ${parameters[2]}`);
    console.log(`Replace Flag: ${parameters[3]}`);
    console.log(`Auth Tag: ${parameters[4]}`);
    console.log(`AD flag: ${parameters[5]}`);
    console.log(`AD Message: ${parameters[6]}`);
    console.log(`optional output Path: ${parameters[7]}`);
    console.log(`Create key?: ${parameters[8]}`);
    console.log("*******************************");
    */

    exec(command, (error, stdout, stderr) =>{

      console.log(stdout);

      if(error){ 

        if(error.code == 40){
          dialog.showErrorBox("Error: ","Error / No Authnetication Tag found.");
        }
        else if(error.code == 2){
          dialog.showErrorBox("Error: ","Could not read Authnetication Tag.");
        }

        reject(error);
      }
      else{ 
        resolve(stdout);
      }
    })
  })

}