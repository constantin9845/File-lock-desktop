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
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

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
ipcMain.on('path-collection', (event,data)=>{

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

  // Clean data
  index = 0;
  for(var e of data[0]){
    
    if(checkFile(e) == 0){
      
      //WIN
      if(platform == 'win32'){
        e = e + '\\';
      }
      else{
        e = e + '/\\*';
      }
    }

    // White spaces in file paths cause problems on WIN
    // replace with _

    let arr = [...e];
    for(let i = 0; i < arr.length; i++){
      if(arr[i] == ' '){
        arr[i] = '_';
      }
    }

    data[0][index++] = arr.join("");

  }

  // Clean key file path
  let arr = [...KEY_FILE];
  for(let i = 0; i < arr.length; i++){
    if(arr[i] == ' '){
      arr[i] = '_';
    }
  }
  KEY_FILE = arr.join("");


  let parameters = [DIRECTION, MODE, KEY_SIZE, KEY_FILE, R_FLAG];

  for(var path of data[0]){
    encrypt(path, parameters);
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


// Encrypt Files
function encrypt(path, parameters){

  console.log("Command: ");
  
  if(platform == 'linux' || platform == 'darwin'){

    // With User Key
    if(parameters[3] != 'n'){

      // Replace flag
      // ARGS = 7
      if(parameters[4]){

        console.log(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]} -r`)

        exec(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]} -r`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
      // Without R flag
      // ARGS = 6
      else{

        console.log(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]}`)

        exec(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]}`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
    }
    // No user Key
    else{

      // Replace flag
      // ARGS = 7
      if(parameters[4]){

        console.log(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n -r`)

        exec(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n -r`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
      // Without R flag
      // ARGS = 6
      else{

        console.log(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n`)

        exec(`./enc ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
    }
  }
  else if(platform == 'win32'){
    // With User Key
    if(parameters[3] != 'n'){

      // Replace flag
      // ARGS = 7
      if(parameters[4]){

        console.log(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]} -r`)

        exec(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]} -r`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
      // Without R flag
      // ARGS = 6
      else{

        console.log(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]}`)

        exec(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} ${parameters[3]}`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
    }
    // No user Key
    else{

      // Replace flag
      // ARGS = 7
      if(parameters[4]){

        console.log(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n -r`)

        exec(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n -r`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
      // Without R flag
      // ARGS = 6
      else{

        console.log(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n`)

        exec(`.\a.exe ${path} ${parameters[0]} ${parameters[1]} ${parameters[2]} n`, (error, stderr, stdout)=>{
          console.log(stderr);
        });
      }
    }
  }
  else{
    return;
  }
}