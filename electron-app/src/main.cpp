#include "../include/fileHandler.h"

void guide(){
	std::cout<<"GUIDE";
}

void menu(std::string& file, bool& directionFlag, bool& mode, int& keySize, std::string& keyPath, bool& replaceFlag){

	// PATH
	std::cout<<"\nEnter <absolute> file/directory path: ";
	std::getline(std::cin, file);

	// ENC / DEC
	std::string direction;
	while(direction != "enc" && direction != "dec"){
		std::cout<<"\nEncryption / Decryption (enter enc or dec): ";
		std::cin>>direction;
	}
	if(direction == "enc"){ directionFlag = true; }
	else{ directionFlag = false; }

	// MODE
	std::string temp;
	while(temp != "ecb" && temp != "cbc"){
		std::cout<<"\nMode (ecb or cbc): ";
		std::cin>>temp;
	}
	if(temp == "ecb"){ mode = false; }
	else{ mode = true; }

	// KEY SIZE
	std::string k = "";
	while(k != "128" && k != "192" && k != "256"){
		std::cout<<"\nKey size (128/192/256): ";
		std::cin>>k;
	}
	if(k == "128"){ keySize = 128; }
	else if(k == "192"){ keySize = 192; }
	else{ keySize = 256; }

	// KEY FILE
	if(directionFlag){
		std::string t;
		std::cout<<"\nEnter path key file (enter n for none): ";
		std::cin>>t;

		if(t == "n"){
			keyPath = "";
		}
		else{
			keyPath = t;
		}
	}
	else{
		while(keyPath == ""){
			std::cout<<"\nNeed Key file for Decryption: ";
			std::cin>>keyPath;
		}
	}

	// REPLACE FLAG
	char replace;
	if(!directionFlag){
		replace = 'y';
	}
	else{
		while(replace != 'y' && replace != 'n'){
			std::cout<<"\nReplace existing file(s)? (y or n): ";
			std::cin>>replace;
		}
	}
	
	if(replace == 'y'){ replaceFlag = true;}
	else{ replaceFlag = false;}


	// SUMMARY + WARNING
	std::string summary = "";
	summary += "\n\tSUMMARY\nFile(s)        : "+file;
	
	if(directionFlag){ summary += "\nType           : Encryption"; }
	else{ summary += "\nType           : Decryption"; }

	if(mode){ summary += "\nAES Mode       : CBC"; }
	else{ summary += "\nAES Mode       : ECB"; }

	if(keySize == 128){ summary += "\nKey Size       : 128"; }
	else if(keySize == 192){ summary += "\nKey Size       : 192"; }
	else{ summary += "\nKey Size       : 256"; }

	if(keyPath != ""){ summary += "\nKey File       : "+keyPath; }
	else{ summary += "\nKey File       : New key to be generated"; }

	if(replaceFlag){ summary += "\nReplace file(s): TRUE"; }
	else{ summary += "\nReplace file(s): FALSE"; }

	summary += "\n\n\tNOTE\n";
	summary += "*****************************************************";
	summary += "\n* Decrypting files with the wrong key damages files *";
	summary += "\n* If files broken after decryption:                 *";
	summary += "\n*\t1) Encrypt with same params and key.        *";
	summary += "\n*\t2) This returns files to initial state.     *";
	summary += "\n* Then retry with correct key.                      *";
	summary += "\n*****************************************************";

	std::cout<<summary<<std::endl;

	std::string confirm = "";
	while(confirm != "y" && confirm != "n"){
		std::cout<<"Confirm (y or n): ";
		std::cin>>confirm;
	}
	std::cout<<std::endl;

	if(confirm == "n"){
		std::cout<<"Exiting\n";
		exit(99);
	}
	
}


int main(int argc, char const *argv[]){

	/*
		LOGIC
		argc == 7 : R flag => on / User key => yes and no

		argc == 6 : R flag => off / User key => yes and no
	*/

	if(argc > 7 || argc < 6){
		std::cout<<"Wrong parameters: "<<argc<<std::endl;

		for(int i = 0; i < argc; i++){
			std::string temp = argv[i];
			std::cout<<temp<<std::endl;
		}

		exit(3);
	}

	// replace flag
	bool replaceFlag = (argc == 7);


	// target path
	std::string path = argv[1];

	// check for directory or file
	std::string temp = argv[2];
	bool directionFlag = (temp == "Encryption"); // Encryption = 1 / Decryption = 0

	// Mode
	temp = argv[3];
	bool mode = (temp == "CBC"); // Mode: ECB = 0 / CBC = 1

	// Key size
	temp = argv[4];
	int keySize = (temp == "128") ? 128 : (temp == "192") ? 192 : 256;

	// key path
	std::string keyPath = argv[5];

	bool dirFlag;
	bool ownKey; 

	if(keyPath == "n"){
		ownKey = false;
	}
	else{
		ownKey = true;
	}

#ifdef _WIN32
	// Check if single file or directory - WIN
	std::string star = fileHandler::getFileName(path);

	// set directory flag
	if(star.size() == 0){ dirFlag = true; }else{ dirFlag = false; }
#else
	// Check if single file or directory - UNIX
	std::string star = fileHandler::getFileName(path);

	// set directory flag
	if(star == "*"){ dirFlag = true; }else{ dirFlag = false; }
#endif

	std::string message = "\n\n";

	// SINGLE FILE ENCRYPTION
	if(directionFlag && !dirFlag){
		// With user key 
		if(ownKey){
			fileHandler::encryptFile(path, keyPath, replaceFlag, mode, keySize);
			if(replaceFlag){
				message += "\n"+fileHandler::getFileName(path)+" has been encrypted.\n";
				std::cout<<message;
			}
			else{
				message += "\n"+fileHandler::getFileName(path)+" has been encrypted.\n";
				message += "Find encrypted file in Downloads/target/\n";
				std::cout<<message;
			}
		}
		// New key
		else{
			fileHandler::encryptFile(path, replaceFlag, mode, keySize);
			if(replaceFlag){
				message += "\n"+fileHandler::getFileName(path)+" has been encrypted.\n";
				message += "Find encryption key (_key) in Downloads/target/\n";
				std::cout<<message;
			}
			else{
				message += "\n"+fileHandler::getFileName(path)+" has been encrypted.\n";
				message += "Find encrypted file + encryption key (_key) in Downloads/target/\n";
				std::cout<<message;
			}
		}

		return 0;
	}

	// SINGLE FILE DECRYPTION
	else if(!directionFlag && !dirFlag){
		fileHandler::decryptFile(path, keyPath, mode, keySize);
		message += "\n"+fileHandler::getFileName(path)+" has been decrypted.\n";
		std::cout<<message;
		return 0;
	}

	// DIRECTORY ENCRYPTION
	else if(directionFlag && dirFlag){

		//  construct relative root directory
		std::string parentDir = path.substr(0, path.size()-1);

		unsigned char* key;
		if(!ownKey){
			key = fileHandler::genKey(keySize);
		}
		else{
			key = fileHandler::readKey(keyPath, keySize);
		}

		// create new root dir / REPLACES EXISTING ONE (target dir in Downloads)
		if(!fileHandler::createRootDir()){
			std::cout<<"Could not create target Directory.";
			exit(3);
		}
		
		// check if dir exists and if valid
		if(std::filesystem::exists(parentDir) && std::filesystem::is_directory(parentDir)){

			// iterate each file/dir
			for(const auto& entry : std::filesystem::recursive_directory_iterator(parentDir)){

				// skip hidden files
				if(std::filesystem::is_regular_file(entry) && entry.path().filename().string().front() != '.'){

					std::string newPath;

					if(!replaceFlag){
						// construct path inside target directory
						newPath = fileHandler::parsePath(entry.path().string(), path);

						// construct the path
						fileHandler::constructPath(newPath);
					}

					std::cout<<entry.path().string()<<std::endl;

					// encrypt file
					fileHandler::encryptFile(entry.path().string(), newPath, dirFlag, key, replaceFlag, mode, keySize);
				}
			}
		}
		if(!ownKey){
			if(replaceFlag){
				message += "\nEncryption Finished.";
				message += "\nFind encryption key (_key) in Downloads/target/\n";
				std::cout<<message;
			}
			else{
				message += "\nEncryption Finished.";
				message += "\nFind files and encryption key (_key) in Downloads/target/\n";
				std::cout<<message;
			}
			fileHandler::storeKey(key, keySize); // store the new key
		}
		else{
			if(replaceFlag){
				message += "\nEncryption Finished.\n";
				std::cout<<message;
			}
			else{
				message += "\nEncryption Finished.";
				message += "\nFind files in Downloads/target/\n";
				std::cout<<message;
			}
			
		}
		delete[] key;

	}

	// DIRECTORY DECRYPTION
	else if(!directionFlag && dirFlag){
		
		//  construct relative root directory
		std::string parentDir = path.substr(0, path.size()-1);


		// check if dir exists and if valid dir
		if(std::filesystem::exists(parentDir) && std::filesystem::is_directory(parentDir)){

			// iterate each file/dir
			for(const auto& entry : std::filesystem::recursive_directory_iterator(parentDir)){

				// skip hidden files
				if(std::filesystem::is_regular_file(entry) && entry.path().filename().string().front() != '.' && entry.path().filename().string() != "_key"){
					
					std::cout<<entry.path().string()<<std::endl;

					// decrypt file
					fileHandler::decryptFile(entry.path().string(), keyPath, mode, keySize);
				}
			}
		}

		message += "\nDecryption Finished.\n";
		std::cout<<message;
	}

	else{
		return 0;
	}
}
