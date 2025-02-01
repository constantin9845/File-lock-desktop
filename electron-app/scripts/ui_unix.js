const { ipcRenderer } = require('electron');

const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileList = document.getElementById('fileList');

const selectDirBtn = document.getElementById('selectDirsBtn');
const dirList = document.getElementById('dirList');

var fileCollection = [];

// File Seletion 
selectFilesBtn.addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('select-files'); // Request file selection

    fileList.innerHTML = ""; // Clear previous file list
    fileCollection = [];

    if (filePaths && filePaths.length > 0) {
        filePaths.forEach(path => {
            const listItem = document.createElement('li');
            listItem.textContent = path; // Display each selected file path
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
let keyPath;

keyFileBtn.addEventListener('click', async ()=>{

    const filePath = await ipcRenderer.invoke('select-key');

    if(filePath && filePath.length == 1){
        keyPath = filePath[0];
    }
    else{
        alert('Error selecting key');
    }
});




// send file paths
const encBtn = document.getElementById('encBtn');

encBtn.addEventListener('click',async ()=>{

    // Parameter selection
    var paramCollection = [];

    paramCollection.push(document.getElementById('direction').value);
    paramCollection.push(document.getElementById('mode').value);
    paramCollection.push(document.getElementById('keySize').value);

    ipcRenderer.send('path-collection', [fileCollection, paramCollection]);
})




