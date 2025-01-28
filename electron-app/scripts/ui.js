const { ipcRenderer } = require('electron');

const fs = require('fs');
const path = require('path');

const selectFilesBtn = document.getElementById('selectFilesBtn');
const selectDirBtn = document.getElementById('selectDirBtn');
const fileList = document.getElementById('fileList');
const dirList = document.getElementById('dirList');

// Handle file selection 
selectFilesBtn.addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('select-files'); // Request file selection

    fileList.innerHTML = ""; // Clear previous file list

    if (filePaths && filePaths.length > 0) {
    filePaths.forEach(path => {
        const listItem = document.createElement('li');
        listItem.textContent = path; // Display each selected file path
        fileList.appendChild(listItem);
    });
    } else {
    const noFiles = document.createElement('li');
    noFiles.textContent = 'No files selected.';
    fileList.appendChild(noFiles);
    }

    
});