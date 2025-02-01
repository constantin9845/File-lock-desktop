const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileList = document.getElementById('fileList');

const selectDirBtn = document.getElementById('selectDirsBtn');
const dirList = document.getElementById('dirList');

let fileCollection = [];
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




// send file paths
const encBtn = document.getElementById('encBtn');

encBtn.addEventListener('click',async ()=>{

    // Parameter selection

    paramCollection.push(document.getElementById('direction').value);
    paramCollection.push(document.getElementById('mode').value);
    paramCollection.push(document.getElementById('keySize').value);
    paramCollection.push(document.getElementById('replaceFlag').value);


    ipcRenderer.send('path-collection', [fileCollection, paramCollection, keyPath]);
})




