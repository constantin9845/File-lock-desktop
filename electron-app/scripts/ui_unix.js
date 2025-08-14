const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileList = document.getElementById('fileList');

const selectDirBtn = document.getElementById('selectDirsBtn');
const dirList = document.getElementById('dirList');

let fileCollection = [];
var dirCollection = [];
let paramCollection = [];

// File Seletion 
selectFilesBtn.addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('select-files'); // Request file selection

    fileList.innerHTML = ""; // Clear previous file list
    fileCollection = [];

    if (filePaths && filePaths.length > 0) {
        filePaths.forEach(path => {
            const listItem = document.createElement('li');
            listItem.textContent = path; 
            fileList.appendChild(listItem);
            fileCollection.push(path);
        });
    } 
    else {
        const noFiles = document.createElement('li');
        noFiles.textContent = 'No files selected.';
        fileList.appendChild(noFiles);
    }
});

// Key file selection
const keyFileBtn = document.getElementById('selectKeyBtn');
const keyList = document.getElementById('keyList');
let keyPath = "n";

keyFileBtn.addEventListener('click', async ()=>{

    keyList.innerHTML = "";
    keyPath = "n";

    const filePath = await ipcRenderer.invoke('select-key');

    if(filePath && filePath.length == 1){
        keyPath = filePath[0];

        const listItem = document.createElement('li');
        listItem.textContent = keyPath; 
        keyList.appendChild(listItem);
    }
    else{
        alert('Error selecting key');
    }
});

// Directory selection
selectDirBtn.addEventListener('click', async ()=>{
    const dirPaths = await ipcRenderer.invoke('select-dirs');

    dirList.innerHTML = ""; // Clear previous file list
    dirCollection = [];

    if(dirPaths && dirPaths.length > 0){
        dirPaths.forEach(path =>{
            const listItem = document.createElement('li');
            listItem.textContent = path; // Display each selected file path
            dirList.appendChild(listItem);
            dirCollection.push(path);
        })
    }
})

// CHECK & SEND COLLECTED DATA
const encBtn = document.getElementById('encBtn');
const summaryContainer = document.getElementById('summary_container');
const func = document.getElementById('summ_function');
const keyS = document.getElementById('summ_keySize');
const keyFile = document.getElementById('summ_keyFilePath');
const auth = document.getElementById('summ_auth');
const AD = document.getElementById('summ_AD');
const replace = document.getElementById('summ_replaceFiles');

const summ_list = document.getElementById('summ_list');

let AD_message = '';

encBtn.addEventListener('click',async ()=>{

    encryption = document.getElementById('direction').value == 'Encryption';

    // Parameter selection
    paramCollection = [];

    // FILE / DIRECTORY SELECTION
    if(fileCollection.length == 0 && dirCollection.length == 0){
        alert('Select a file.');
        return;
    }

    // CHECKING FOR INPUT ERRORS

    // ENCRYPTION
    if(encryption){
        /// KEY
        if(!document.getElementById('newKeyBtn').checked && keyPath == "n"){
            alert("Select a new key or provide one.");
            return;
        }

        /// AD REQUIRES AD MESSAGE + AUTH OPTION
        if(document.getElementById('ADFlag').checked){
            if(document.getElementById('AD').value.length == 0){
                alert("Enter Additional Message.");
                return;
            }

            if(!document.getElementById('authFlag').checked){
                alert("Must select Authentication Tag option to add an Additional message.");
                return;
            }
        }
    }
    // DECRYPTION
    else{
        /// KEY
        if(keyPath == "n"){
            alert("Select Key File for Decryption.");
            return;
        }

        /// AD REQUIRES AUTH OPTION
        if(document.getElementById('ADFlag').checked && !document.getElementById('authFlag').checked){
            alert("Must select Authentication Tag option to add an Additional message.");
            return;
        }
    }


    // REPLACE FLAG
    // If encryption w/ no R FLAG 
    //  if both files + directory -> reject
    //  directory will overwrite files
    if(dirCollection.length == 1 && fileCollection.length >= 1){
        alert("Encrypt files and directories separately.");
        return;
    }

    paramCollection.push(document.getElementById('direction').value);
    paramCollection.push(document.getElementById('keySize').value);
    paramCollection.push(document.getElementById('replaceFlag').checked);
    paramCollection.push(document.getElementById('authFlag').checked);
    paramCollection.push(document.getElementById('ADFlag').checked);



    // Summary window
    summaryContainer.style.transitionDuration = '1s'
    summaryContainer.style.transform = 'translate(-50%, -50%)';

    for(var e of [...fileCollection, ...dirCollection]){
        const listItem = document.createElement('li');
        listItem.textContent = e; 
        summ_list.appendChild(listItem);
    }

    func.innerText = document.getElementById('direction').value;
    keyS.innerText = document.getElementById('keySize').value;

    if(keyPath == 'n'){
        keyFile.innerText = 'New File';
    }
    else{
        keyFile.innerText = keyPath;
    }

    if(document.getElementById('replaceFlag').checked){
        replace.innerText = 'TRUE'
    }
    else{
        replace.innerText = 'FALSE'
    }

    if(document.getElementById('authFlag').checked){
        auth.innerText = 'TRUE'
    }
    else{
        auth.innerText = 'FALSE'
    }

    if(document.getElementById('ADFlag').checked){
        AD.innerText = 'TRUE'
        if(encryption){
            AD_message = document.getElementById('AD').value;
        }
        else{
            AD_message = "y";
        }
    }
    else{
        AD.innerText = 'FALSE'
    }
})

const confirm = document.getElementById('confirm');
const deny = document.getElementById('deny');

// DATA:
// [fileCollection] [ [dir collection] [params] [key path] [AD message] ]
// [fileCollection] : all file paths
// [dir collection] : directory path
// [params]         : direction | keySize | replaceFlag | authFlag | ADFlag 
// [key path]       : path of key file
// [AD message]     : empty string if none
confirm.addEventListener('click', async()=>{

    displayLoader();

    ipcRenderer.send('path-collection', [[...fileCollection, ...dirCollection], paramCollection, keyPath, AD_message]);

    ipcRenderer.removeListener('encryption-logs', handleEncryptionLogs);

    ipcRenderer.on('encryption-logs', handleEncryptionLogs)

});

deny.addEventListener('click', ()=>{
    // Empty data
    func.innerText = '';
    keyS.innerText = '';
    replace.innerText = '';
    summ_list.innerHTML = '';
    auth.innerHTML = '';
    AD.innerHTML = '';
    summaryContainer.style.transform = 'translate(-50%, 200%)';
})

// clear preview sections
const clearFiles = document.getElementById('clear_files');
const clearDir = document.getElementById('clear_dir');
const clearKey = document.getElementById('clear_key');

clearFiles.addEventListener('click', ()=>{
    fileCollection = [];
    fileList.innerHTML = '';
});

clearDir.addEventListener('click', ()=>{
    dirCollection = [];
    dirList.innerHTML = '';
});

clearKey.addEventListener('click', ()=>{
    keyPath = 'n';
    keyList.innerHTML = '';
});

// Logging response
function handleEncryptionLogs(event, logs) {
    let message = '';
    for (let i = 0; i < logs.length; i++) {
        message += logs[i];
        message += '\n';
    }

    hideLoader();
    hideSummary();

    alert(message); 

}

// Loading animation
function displayLoader(){
    const loader = document.getElementById('loader');

    loader.style.display = 'block';
}

function hideLoader(){
    const loader = document.getElementById('loader');

    loader.style.display = 'none';
}

// Summary display
function hideSummary(){
    // Empty data
    keyList.innerHTML = "";
    keyPath = 'n';
    AD_message = '';

    func.innerText = '';
    keyS.innerText = '';
    replace.innerText = '';
    dirList.innerHTML = '';
    fileList.innerHTML = '';
    keyList.innerHTML = '';
    summ_list.innerHTML = '';
    AD.innerHTML = '';
    auth.innerHTML = '';
    summaryContainer.style.transform = 'translate(-50%, 100%)';

    fileCollection = [];
    dirCollection = [];
    paramCollection = [];
}