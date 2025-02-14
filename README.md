# :lock: **file-lock Desktop**  
*Cross-platform AES encryption for individual files and directories*  
*CLI Version -> https://github.com/constantin9845/file-lock*

---

<br>
<br>


### 🔆 **Encryption Made Simple**
*Terminal Commands No More!*
<p align="center">
  <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnJpdjd5a2E3ZGJ0aW04cXF6bWtkMHBjOG1wc2I2NmZvcGNiNGVnMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/TxYTQZtxqwlRRbYd5E/giphy.gif"  />
</p>

---
<br>
<br>


### 🏗️ **Build**
The following is required to build the application:
- Node Js
- npm
- g++
  
<br>
Clone repo

```bash
git clone git@github.com:constantin9845/File-lock-desktop.git
cd File-lock-desktop/electron-app/
```

<br>
Build

```bash
npm run build 

# Stores executable in resources/output/

# Windows -> simply move executable to Desktop or other location (Ready to use)

# Linux -> need to install .deb file -> can use dpkg or other tools
sudo dpkg -i .deb file
```


<br>
<br>

### :page_with_curl: **Program Description**

The **file-lock** desktop application allows you to **encrypt** or **decrypt** a **single file** or a **full directory** on your machine.  
This version is available for **Windows**, **Linux**, and **macOS**.

- **Encryption** can be performed using a **user-provided key**, or a new key can be generated automatically.
  - The key should be stored in a file, with **only the first 16 bytes** being used.
  - If a new key is generated, it will be saved in the `Downloads/` folder.


<br>
<br>



### :memo: **Notes**

- **Hidden files** are skipped during encryption and decryption.
- **In CBC mode**, the file size will increase by **16 bytes** after encryption due to the inclusion of the **Initialization Vector (IV)**.


<br>
<br>

### :white_check_mark: **Verified File Types**

The program supports encryption and decryption for all common file types, including:

- **PDF**
- **PNG**
- **DOCX**
- **MP4**


<br>
<br>

## :warning: **Caution**

> ⚠️ **Important**  
> Keep the following in mind while using **file-lock Desktop**:

- **Decrypted files will replace the original files**.  
  Ensure that you have backups of any important data before performing decryption.
  
- **No recovery is possible** without the key used for encryption.  
  **Do not modify or lose your key file**.
  
- **Do not open** the key file directly.  
  It is recommended to set the key file to **read-only mode** for added security.

- **Do not** run system Files through the program.
  System will be damaged and potentially not recoverable.


<br>
<br>

### :key: **Key Generation**

The key generation process is **cryptographically secure**, ensuring that the generated key is strong and unpredictable.

- However, there are **limits** to how many keys can be generated within a short period. For **large requests** for new keys in a short timeframe, the process may time out.


<br>
<br>

### :book: **Guide**
  
- **Key Size Matching**: Ensure the key size matches the expected size.
  - If the chosen key size is **larger** than the key file size, the program will throw an error.
  - If the chosen key size is **smaller** than the key file size, the program will use only **part of the key**.
 
- **Test Before Using**:
  - Run multiple rounds of tests to encrypt and decrypt some files to verify the program.
  - First, choose **not to replace files during encryption!**


<br>
<br>

### :warning: **Important Security Advice**

- Always **backup your encrypted files** before attempting decryption.
- Keep your **key file secure** and **do not share** it with untrusted parties. It is vital to maintain control of the key to ensure the security of your encrypted data.


<br>
<br>

## :warning: **Disclaimer**

By using this program, you acknowledge and agree to the following:

- The author is **not responsible** for any **damaged files** or **data loss** that may occur during encryption or decryption.
- It is **your responsibility** to ensure that all files and directories are correctly backed up before performing encryption.
- The program is provided **as-is**, and the author makes no warranties regarding its functionality or safety.
- **Use at your own risk**. The author is not liable for any loss, damage, or other consequences arising from the use of this program.

<br>
<br>
For support or feedback, feel free to open an issue https://github.com/constantin9845/File-lock-desktop/issues.
<br>
<br>

