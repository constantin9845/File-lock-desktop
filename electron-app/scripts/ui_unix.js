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



// send file paths
const encBtn = document.getElementById('encBtn');
const summaryContainer = document.getElementById('summary_container');
const func = document.getElementById('summ_function');
const mode = document.getElementById('summ_mode');
const keyS = document.getElementById('summ_keySize');
const keyFile = document.getElementById('summ_keyFilePath');
const replace = document.getElementById('summ_replaceFiles');

const summ_list = document.getElementById('summ_list');

encBtn.addEventListener('click',async ()=>{

    // Parameter selection
    paramCollection = [];

    // Check if files selected
    if(fileCollection.length == 0 && dirCollection.length == 0){
        alert('Select a file.');
        return;
    }

    // Check if new key selected
    if(document.getElementById('newKeyBtn').checked){
        keyPath = 'n';
    }

    // Check if any key choice was made
    if(!document.getElementById('newKeyBtn').checked && keyPath == 'n'){
        alert('Add key file or select new key checkbox.');
        return;
    }

    // Check if key entered for decryption
    if(document.getElementById('direction').value == 'Decryption' && keyPath == 'n'){
        alert("Need Key for decryption.");
        return;
    }


    // If encryption w/ no R FLAG 
    //  if both files + directory -> reject
    //  directory will overwrite files
    if(!document.getElementById('replaceFlag').checked && (dirCollection.length == 1 && fileCollection.length > 1)){
        alert("When not replacing original files: Encrypt files and directories separately.");
        return;
    }

    paramCollection.push(document.getElementById('direction').value);
    paramCollection.push(document.getElementById('mode').value);
    paramCollection.push(document.getElementById('keySize').value);
    paramCollection.push(document.getElementById('replaceFlag').checked);


    // Summary window
    summaryContainer.style.transitionDuration = '1s'
    summaryContainer.style.transform = 'translate(-50%, -50%)';

    for(var e of [...fileCollection, ...dirCollection]){
        const listItem = document.createElement('li');
        listItem.textContent = e; 
        summ_list.appendChild(listItem);
    }

    func.innerText = document.getElementById('direction').value;
    mode.innerText = document.getElementById('mode').value;
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
})



const confirm = document.getElementById('confirm');
const deny = document.getElementById('deny');

confirm.addEventListener('click', async()=>{

    ipcRenderer.send('path-collection', [[...fileCollection, ...dirCollection], paramCollection, keyPath]);

    ipcRenderer.removeListener('encryption-logs', handleEncryptionLogs);

    ipcRenderer.on('encryption-logs', handleEncryptionLogs)

    // Empty data
    keyList.innerHTML = "";
    keyPath = 'n';

    func.innerText = '';
    mode.innerText = '';
    keyS.innerText = '';
    replace.innerText = '';
    dirList.innerHTML = '';
    fileList.innerHTML = '';
    keyList.innerHTML = '';
    summ_list.innerHTML = '';
    summaryContainer.style.transform = 'translate(-50%, 100%)';

    fileCollection = [];
    dirCollection = [];
    paramCollection = [];
});

deny.addEventListener('click', ()=>{
    // Empty data
    func.innerText = '';
    mode.innerText = '';
    keyS.innerText = '';
    replace.innerText = '';
    summ_list.innerHTML = '';
    summaryContainer.style.transform = 'translate(-50%, 100%)';
})


// Logging response
function handleEncryptionLogs(event, logs) {
    let message = '';
    for (let i = 0; i < logs.length; i++) {
        message += logs[i];
        message += '\n';
    }
    alert(message);
}