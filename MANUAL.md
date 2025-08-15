# User Manual

## Overview
This application encrypts and decrypts individual files or entire directory trees using **AES-GCM** for authenticated encryption, with **AES-NI** (Intel/AMD) and **ARM AES** hardware acceleration for maximum performance.

---

## 1. Installation

### Option 1 – Download Ready-to-Run Installer
1. Go to the [Releases](https://github.com/constantin9845/File-lock-desktop/releases) page.
2. Download the installer for your OS:
   - Windows: `.exe`
   - Linux: `.deb`
   - macOS: `.dmg` (ARM only! --> M1,M2,...)
3. Run & install.

### Option 2 – Build from Source
Requirements:
- C++17 compiler
- Node.js + npm (for Electron GUI)

```bash
# clone repo
git clone git@github.com:constantin9845/File-lock-desktop.git

# enter app folder
cd File-lock-desktop && cd electron-app

# install dependencies
npm install

# Compile + build installer
npm run build

# Installer stored in : resources folder

```

## 2. Encryption

### 2.1 Parameters

- `Select Files` : Select one or more files to be encrypted/decrypted
- `Select Directory` : Select **one** directory to be encrypted/decrypted (Can contain subdirectories)
- `Select Key File` : Select a file containing the key. (Optional for encryption, required for decryption)
- `Function` : Encryption / Decryption
- `Key Size` : 128 - 192 - 256 => **Must specify key size when using a key file!**
- `Additional Message` : (Optional) add additional message to authentication tag (Dont include new line char: `\n`)
- `New Key` : Will create a new key (Stored in Downloads folder)
- `Replace Files` : Will replace intput files, **Original files will be lost!** (By default when decrypting)
- `Generate/Verify Authentication Tag` :
  - (Encryption) Generates an Authentication tag for each file.
  - (Decryption) Authenticates tags for files.
- `Additional Message` :
  - (Encryption) Adds Additional message to authentication tag & creates a message file for each file.
  - (Decryption) Searches for additional message files when authenticating authentication tags.


### 2.2 Encryption Process

#### 1. Select one/multiple files or single directory

  - **Important**: Select either files or a directory (not together)
  - Directory can contain sub directories

#### 2. Minimum parameters:

  - `Function` : Encryption
  - `New Key` or key file
  - `Key Size` : enter key size (of new key or key file)

#### 3. Optional Parameters:

  - `Replace Files` : Will replace input files, otherwise files will be stored in a new directory in the Downloads folder.
  - `Generate/Verify Authentication Tag` : Will Create an Authentication Tag for each file
  - `Additional Message` : Will create an additional message with text entered in Additional message section.

#### 4. The output

- The encrypted files replace the original files or are stored in a new folder in the Downloads directory.
- (If selected) Authentiaction tags and Additional mesage tags are stored together with their files.
- A newly created key is stored in the Downloads directory.


### 2.3 Decryption Process

#### 1. Select one/multiple files or single directory

  - **Important**: Select either files or a directory (not together)
  - Directory can contain sub directories

#### 2. Minimum parameters:

  - `Function` : Decryption
  - Key File
  - `Key Size` : enter key size (of new key or key file)


#### 3. Optional Parameters:

  - `Generate/Verify Authentication Tag` : Will authenticate the Authentication Tag for each file
  - `Additional Message` : Will search for additional message files when calculating the authentication tags.

#### 4. Important

  - Authentication tag/Additional message files must be stored in the same location as the files they belong to.
  - The input files/authentication tags/additional message files are always deleted after decryption.


#### 5. The output

- The decrypted replace the encrypted files


## 3. Troubleshooting

- **Slow encryption/decryption?** : Make sure AES-NI is enabled on your CPU.

## 4. Safety Tips

- Don't try to open the Tag files and key files, as this can damage them.



