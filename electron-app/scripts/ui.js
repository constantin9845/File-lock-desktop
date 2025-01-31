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




// send file paths
const encBtn = document.getElementById('encBtn');

encBtn.addEventListener('click',async ()=>{
    ipcRenderer.send('path-collection', fileCollection);
})


