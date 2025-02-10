const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const platform = process.platform;
const outputDir = path.join(__dirname, 'bin', platform);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const compileCommand = platform === 'win32'
  ? 'g++ .\\src\\main.cpp .\\src\\fileHandler.cpp .\\src\\AES.cpp -o bin\\win\\enc.exe'
  : `g++ src/main.cpp src/fileHandler.cpp src/AES.cpp -o bin/${platform}/enc`;

exec(compileCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Compilation failed:', error.message);
    process.exit(1);
  }
  if (stderr) {
    console.error('Compilation stderr:', stderr);
    process.exit(1);
  }
  console.log('Compilation successful');
});