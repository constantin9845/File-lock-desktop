
<h1 align="center">
  <br>
  <img src="https://github.com/constantin9845/File-lock-desktop/blob/main/electron-app/build/6801_1024x1024x32.png?raw=true" alt="Filelock logo" width="200"></a>
  <br>
  Filelock
  <br>
</h1>

<h4 align="center">An application to encrypt files & directories.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#important">Important</a> •
  <a href="#usage">Usage</a> •
  <a href="#feedback">Feedback</a> •
  <a href="#you-may-also-like">Extra</a>
</p>

![Demo animation](filelock-demo.gif)


## Key Features

* Encryption of Files & Directories
* Auto detection for AES-NI
  - Sky-rocket encryption speed
* AES-GCM for max security
* Cryptographically secure key generation
* User friendly UI
* Cross platform
  - Windows, macOS and Linux ready.

## How To Use

Use installer (see Downloads section) to skip installation of various tools needed to build the application. To build the application yourself => From your command line:

```bash
# Clone this repository
$ git clone git@github.com:constantin9845/File-lock-desktop.git

# Go into app directory
$ cd electron-app

# Install dependencies
$ npm install

# Run the app
$ npm run build
```

> **Tools needed (if building) :**
> npm / NodeJs / C++ compiler 


## Download

You can [download](https://github.com/constantin9845/File-lock-desktop/releases/tag/v2.0.0) the latest installable version of Filelock for Windows, macOS and Linux.

## Important

- Test usage to get fimiliar with the app before using on important data!
- Wrong usage will destroy data **irreversibly**
- Linux/MAC : Key generation can be exhausted when done too much in short period of time. (`/dev/urandom`)
- Do not try to open Key/Tag files.

## Usage

- Authemtication tags and Additional messages have default naming convention that is required! (Auth: `<file_name>_TAG` | AD: `<file_name>_Additional_Message.txt`)
- For decryption, both the Authentication tag and additional message file must be located in same location as the file.
- When Replace option not set => A new directory in Downloads folder will store resulting files/tags.
- New Key files can be found in the Downloads directory.
- Decryption always removes the input files!
- Multiple files can be selected at once, but only 1 directory at a time.

## Feedback

If you liked using this app and/or it has helped you in any way, send me an email with any of your comments, questions, and concerns!


## You may also like

- [Filelock-CLI](https://github.com/constantin9845/file-lock) - The CLI-version of this application


## License

MIT

---



