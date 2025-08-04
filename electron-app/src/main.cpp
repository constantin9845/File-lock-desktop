#include "../include/fileHandler.h"
#include <chrono>

#ifdef _WIN32
	#include <intrin.h>  
#endif

#ifdef __APPLE__
	#include <sys/types.h>
	#include <sys/sysctl.h>
#endif


#ifdef _WIN32
	bool check_cpu_win(){
		int cpu_info[4];
		__cpuid(cpu_info, 1);
		
		return (cpu_info[2] & (1 << 25)) != 0; // check bit 25
	}
#endif

#if defined(__aarch64__) || defined(__arm64__)
	bool check_AES_ARM(){
		int aes = 0;
		size_t size = sizeof(aes);
		
		if (sysctlbyname("hw.optional.arm.FEAT_AES", &aes, &size, nullptr, 0) == 0) {
			return aes == 1;
		}
		return false;
	}
#endif

int main(int argc, char const *argv[]){

	// argv input
	// [execpath] [path] [enc/dec] [keySize] "[keyfile/n]" [r/n] [auth/n] [AD/n] "[AD message]" "[output dir/n]" "[create = create key with this name]"

	std::ios_base::sync_with_stdio(false);

	std::string path = argv[1];

	std::string temp = argv[2];
	bool directionFlag = (temp == "enc");

	temp = argv[3];
	int keySize = (temp == "128" ? 128 : (temp == "192" ? 192 : 256));

	std::string keyPath = argv[4];

	temp = argv[5];
	bool replaceFlag = (temp == "true");

	temp = argv[6];
	bool authTag = (temp == "true");

	temp = argv[7];
	bool AD_tag = (temp == "true");
	std::string AD;

	if(!AD_tag){
		AD = "n";
	}
	else{
		temp = argv[8];
		AD = temp;
	}

	
	bool create_custom_key = false;
	std::string custom_output = argv[9];

	temp = argv[10];
	create_custom_key = (temp == "create");

	bool dirFlag;


	// CHeck for AES hardware support
	bool hw_available = false;
#ifdef _WIN32
	hw_available = check_cpu_win();

#elif defined(__x86_64__) || defined(__i386__)
	hw_available = __builtin_cpu_supports("aes");

#elif defined(__aarch64__) || defined(__arm64__)
	hw_available = check_AES_ARM();
#endif


	// Check if single file or directory
	std::filesystem::path t(path);
	std::string star = t.filename().string();
	std::string outputFilePath = "";

#ifdef _WIN32

	// set directory flag
	dirFlag = (star.size() == 0);

	if(!dirFlag && !replaceFlag){

		if(custom_output == "n"){
			const char* homeDir = std::getenv("USERPROFILE");

			if(homeDir == nullptr){
				std::cerr << "Failed to get USERPROFILE environment variable." << std::endl;
				exit(1);
			}

			outputFilePath = std::string(homeDir) + "\\Downloads\\target\\"+star;
		}	
		else{
			outputFilePath = custom_output+star;
		}

		
			
	}

#else

	// set directory flag
	dirFlag = (star == "*");

	if(!dirFlag && !replaceFlag){

		if(custom_output == "n"){
			// get username
			const char* homeDir = std::getenv("HOME");

			if(homeDir == nullptr){
				std::cerr << "Failed to get HOME environment variable." << std::endl;
				exit(1);
			}

			outputFilePath = std::string(homeDir) + "/Downloads/target/"+star;
		}
		else{
			outputFilePath = custom_output+star;
		}
		
	}

#endif

	std::string message = "\n\n";

	// ENCRYPTION
	if(directionFlag){

		std::cout<<"Encryption:"<<std::endl;
		std::cout<<std::endl;

		unsigned char* key;

		if(keyPath == "n"){
			key = fileHandler::genKey(keySize);
			fileHandler::storeKey(key, keySize);
		}
		else if(create_custom_key){
			key = fileHandler::genKey(keySize);
			fileHandler::storeKey(key, keySize, keyPath);
		}
		else{
			key = fileHandler::readKey(keyPath, keySize);

			std::cout<<std::endl;
			std::cout<<"Key used: "<<keyPath<<std::endl;
			std::cout<<std::endl;
		}

		std::string newDirName;

		// Create target directory in Downloads if no replace flag set
		if(!replaceFlag && custom_output == "n"){
			if(!fileHandler::createRootDir(newDirName)){
				std::cout<<"Could not create target Directory.";
				exit(3);
			}
		}

		// SINGLE FILE
		if(!dirFlag){

			auto start = std::chrono::high_resolution_clock::now();

			std::cout<<std::endl;
			std::cout<<"-- "<<path<<std::endl;

			if(hw_available){
				fileHandler::HW_AES_GCM(path, key, replaceFlag, keySize, outputFilePath, authTag, AD);
			}
			else{
				fileHandler::AES_GCM(path, key, replaceFlag, keySize, outputFilePath, authTag, AD);
			}


			auto end = std::chrono::high_resolution_clock::now();

			auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

			if(!replaceFlag){
				std::cout<<std::endl;
				std::cout<<"Saved in : "<<outputFilePath<<std::endl;
				std::cout<<std::endl;
			}

			std::cout<<std::endl;
			std::cout<<"Finished in : "<<duration.count() << " ms"<<std::endl;
			std::cout<<std::endl;

		}
		// DIRECTORY
		else{

			// Top direcotry
			std::string topDir = path.substr(0, path.size()-1);

			// Check if top directory exists and valid
			if(std::filesystem::exists(topDir) && std::filesystem::is_directory(topDir)){

				auto start = std::chrono::high_resolution_clock::now();

				// Iterate each file in sub directories
				for(const auto& entry : std::filesystem::recursive_directory_iterator(topDir)){

					// Skip hidden files
					if(std::filesystem::is_regular_file(entry) && entry.path().filename().string().front() != '.'){

						std::string outputPath;

						if(!replaceFlag){
							// Create relative path inside target directory
							outputPath = fileHandler::parsePath(entry.path().string(), path, newDirName);

							// construct the path
							fileHandler::constructPath(outputPath);
						}

						// logs
						std::cout<<std::endl;
						std::cout<<"-- "<<entry.path().string()<<std::endl;

						// encrypt entry
						if(hw_available){
							fileHandler::HW_AES_GCM(entry.path().string(), key, replaceFlag, keySize, outputPath, authTag, AD);
						}
						else{
							fileHandler::AES_GCM(entry.path().string(), key, replaceFlag, keySize, outputPath, authTag, AD);
						}
					}
				}

				auto end = std::chrono::high_resolution_clock::now();

				auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

				if(!replaceFlag){
					std::cout<<std::endl;
					std::cout<<"Saved in : "<<newDirName<<std::endl;
					std::cout<<std::endl;
				}

				std::cout<<std::endl;

				std::cout<<"Finished in : "<<duration.count() << " ms"<<std::endl;
			}
			delete[] key;
		}
		
	}
	// DECRYPTION
	else{

		std::cout<<"Decryption:"<<std::endl;
		std::cout<<std::endl;

		unsigned char* k = fileHandler::readKey(keyPath, keySize);

		// SINGLE FILE
		if(!dirFlag){

			std::cout<<std::endl;
			std::cout<<"-- "<<path<<std::endl;

			auto start = std::chrono::high_resolution_clock::now();
			

			if(hw_available){
				fileHandler::HW_AES_GCM_DECRYPTION(path, k, keySize, authTag, AD=="y");
			}
			else{
				fileHandler::AES_GCM_DECRYPTION(path, k, keySize, authTag, AD=="y");
			}

			
			auto end = std::chrono::high_resolution_clock::now();
			
			auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

			std::cout<<std::endl;
			std::cout<<"Finished in : "<<duration.count() << " ms"<<std::endl;

			return 0;
		}
		// DIRECTORY
		else{
			// Top direcotry
			std::string topDir = path.substr(0, path.size()-1);

			// Check if directory exists
			if(std::filesystem::exists(topDir) && std::filesystem::is_directory(topDir)){

				auto start = std::chrono::high_resolution_clock::now();

				// iterate each file/dir
				for(const auto& entry : std::filesystem::recursive_directory_iterator(topDir)){

					// skip hidden files, AUTH tags, and AD text files
					if(
						std::filesystem::is_regular_file(entry) && 
						entry.path().filename().string().front() != '.' && 
						entry.path().filename().string() != "_key" &&
						entry.path().filename().string().find("_Additional_Message.txt") == std::string::npos &&
						entry.path().filename().string().find("_TAG") == std::string::npos
					){
						
						// logs
						std::cout<<std::endl;
						std::cout<<"-- "<<entry.path().string()<<std::endl;
						
						if(hw_available){
							fileHandler::HW_AES_GCM_DECRYPTION(entry.path().string(), k, keySize, authTag, (AD == "y"));
						}
						else{
							fileHandler::AES_GCM_DECRYPTION(entry.path().string(), k, keySize, authTag, (AD == "y"));
						}
					}
				}


				auto end = std::chrono::high_resolution_clock::now();

				auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

				std::cout<<std::endl;
				std::cout<<"Finished in : "<<duration.count() << " ms"<<std::endl;

			}
		}
		return 0;
	}
}
