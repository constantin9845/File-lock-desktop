const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileList = document.getElementById('fileList');

const selectDirBtn = document.getElementById('selectDirsBtn');
const dirList = document.getElementById('dirList');

let fileCollection = [];
var dirCollection = [];

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

encBtn.addEventListener('click',async ()=>{

    // Parameter selection
    let paramCollection = [];

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

    paramCollection.push(document.getElementById('direction').value);
    paramCollection.push(document.getElementById('mode').value);
    paramCollection.push(document.getElementById('keySize').value);
    paramCollection.push(document.getElementById('replaceFlag').checked);

    ipcRenderer.send('path-collection', [[...fileCollection, ...dirCollection], paramCollection, keyPath]);

    keyList.innerHTML = "";
    keyPath = 'n';
})




