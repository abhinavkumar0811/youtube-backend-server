import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from 'fs';


//function for the cloudinary
export const uploadFileOnCloundinary = async (localFilePath) => {
    
    // configure the cloudinary from the local server 
    cloudinary.config({
        
        cloud_name: process.env.CLOUDNARY_NAME,
        api_key: process.env.CLOUDNARY_API_KEY,
        api_secret: process.env.CLOUDNARY_API_SECRET,
  
    });


    // upload the file on the cloudinary.js
    try {
        // validate the localPathStorage
        if (localFilePath) {
            
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",  // image/audio/pdf/jpg/png etc...
                // folder: cloudinary folderSeclect
                // chunk_size: it allow to fix the file upload size it devide it in part
            });

            // log the message
            console.log(`file has been uploaded on the cloudinary server !!`)

            // delete the file after saving on the cloudinary server
           fs.unlink(localFilePath, (error) => {

            if (error) {
                throw new Error('file has been not deleted from the local server');
                console.log(`Error in file deleting: ${error}`);
            } else {
                console.log('Congrats your file has been removed from the local server ')
            }
           });

           return response;
        }
    } catch (error) {
        // fs for removing the file
        fs.unlink(localFilePath, (error) =>{
            if (error) {
                throw new Error('file  has not been removed from the local storage file');
                console.log('file not removed Error:', error);
            } else {
                console.log('file has been successfully removed from the local storage')
            }
        });

        console.log(`file has not been saved to the cloudinary server`, error);

    };

    

};