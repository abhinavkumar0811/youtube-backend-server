import jwt from "jsonwebtoken";
import { ApiResponse } from "../../utilis/apiResponse.js";
import { ApiErrors} from "../../utilis/apiError.js";
import {User}  from '../../model/users.model.js';

 export const jwtVarify = async (req , res , next) => {
 
try {
    
  // Debug logs
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.header('authorization'));
  
  let token = null;
  
  // Check if accessToken cookie exists and is a string
  if (req.cookies?.accessToken && typeof req.cookies.accessToken === 'string') {
    token = req.cookies.accessToken;
  }
  // Check authorization header
  else if (req.header('authorization') && req.header('authorization').startsWith('Bearer ')) {
    token = req.header('authorization').substring(7);
  }
  
  console.log('Token received:', token); // debug log
  
  if(!token){
    return res.status(401).json(
      new ApiErrors(401, 'Access token is required')
    )
  }

  // if token then return next
  const decodeJwt = jwt.verify(token, process.env.ACCESS_TOKEN_SECURE);
  if(!decodeJwt){
    throw new ApiErrors(401, 'Unauthorized access token');
  }
   
  // if it found then return next 
  const user =await User.findById(decodeJwt._id);
  if(!user){
    throw new ApiErrors(404, 'user not found')
  }

  // if it found then return next 
  // - making a user object 
  req.user = user;

  return next();

            
} catch (error) {
    console.log('Invalid access token::', error)
    return res.status(500).json(
      new ApiErrors(500, 'Invalid access token', [error.message])
    )
}

}






            //  req.header('authorization')?.('Bearer').split('' [1]) - pending the split concept

  // req.header('authorization')?.replace("Bearer " , '')
  // if someone send the request with the multiple space then it will fail silently
 