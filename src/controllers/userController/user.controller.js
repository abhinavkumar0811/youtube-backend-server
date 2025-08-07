import { User } from "../../model/users.model.js";
import { ApiErrors } from "../../utilis/apiError.js";
import { ApiResponse } from "../../utilis/apiResponse.js";
import {uploadFileOnCloundinary} from '../../utilis/cloudnary.js'



// register
 const registerController = async (req, res, next) => {
  // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
 
    const {userName, email, password, fullName} = req.body;

    const avatarUpload = req.files?.avatar[0].path;
    const coverImage = req.files?.coverImage[0].path;

    const isAnyFieldEmpty = [userName, email, password, fullName].some((field)=> field==="");
    if(!isAnyFieldEmpty){
        throw new ApiErrors(409, 'All fields are required', [error.message]);
    }
    
 };
export default {registerController}