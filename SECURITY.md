
## **`SECURITY.md` – Security Design & Implementation**

# Security Overview

## 1. Algorithm & Mode
- **AES-256-GCM** + **PKCS#7 Padding** 
- Provides **authenticated encryption**: confidentiality + integrity verification.

## 2. Key Derivation
- `/dev/urandom` is used on mac and linux
- `bcrypt` on Windows
- Prevents brute-force dictionary attacks.

## 3. Hardware Acceleration
- **AES-NI** used on Intel/AMD CPUs when detected.
- **ARM AES instructions** used on ARMv8+ devices.
- Automatic fallback to optimized software AES if unavailable.
- Counter mode allows for multi-threaded parallelization.

## 4. Nonce & IV Management
- 96-bit random IV per file.
- Never reused with the same key.

## 5. Authentication Tag
- 128-bit GCM authentication tag stored in file along with ciphertext file.

## 6. Implementation Details
- Core encryption in C++.
- GUI in Electron.


## 7. Security Best Practices
- Keep backups of your encryption keys.



