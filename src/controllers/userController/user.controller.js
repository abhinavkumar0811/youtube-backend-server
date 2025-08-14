import { response } from "express";
import { jwtVarify } from "../../midwares/user/authorize.midware.js";
import { User } from "../../model/users.model.js";
import { ApiErrors } from "../../utilis/apiError.js";
import { ApiResponse } from "../../utilis/apiResponse.js";
import { uploadFileOnCloundinary } from "../../utilis/cloudnary.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";

// generate accessToken & refresh token
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // it will not validate directly save the refresh token

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("access and refresh token error::", error);
    throw new ApiErrors(
      500,
      "something went wrong while generating access and refresh token",
      [error.message],
    );
  }
};

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

  try {
    const { userName, email, fullName, password } = req.body;

    const isEmptyField = [userName, email, fullName, password].some(
      (field) => field?.trim() === "",
    );
    if (isEmptyField) {
      throw new ApiErrors(400, "All fields are required");
    }

    const emailExisted = await User.findOne({ email });
    if (emailExisted) {
      throw new ApiErrors(409, "Oops email already taken by another user");
    }

    const userNameExisted = await User.findOne({ userName });
    if (userNameExisted) {
      throw new ApiErrors(409, "username already taken");
    }

    const avatarPathExist = req.files?.avatar?.[0]?.path;
    let coverImagePathExist = req.files?.coverImage?.[0]?.path;

    console.log("avataerFile exsited::", avatarPathExist);
    console.log("coverImage exsited::", coverImagePathExist);

    if (!avatarPathExist) {
      throw new ApiErrors(400, "avatar file is required");
    }

    //cloudinary
    const avatar = await uploadFileOnCloundinary(avatarPathExist);
    console.log("avatar Detail::", avatar);
    const coverImage = await uploadFileOnCloundinary(coverImagePathExist);

    if (!avatar.url) {
      throw new ApiErrors(400, "failed to upload avatar on the cloud");
    }

    if (coverImage && !coverImage.url) {
      throw new ApiErrors(400, "cover image not uploaded on the cloud");
    }

    const newUser = await User.create({
      fullName,
      userName: userName.toLowerCase(),
      email,
      avatar: avatar.url,
      coverImage: coverImage?.url,
      password,
    });

    // it will not send sensative password and refresh token to the user
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      console.log([error.message]);
      throw new ApiErrors(500, "something went wrong while registring");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "you registerd successfully !!"));
  } catch (error) {
    console.log("internal server error::", error);
    return res
      .status(500)
      .json(new ApiErrors(500, "Internal server error", [error.message]));
  }
};

// logIn controller
const logIn = async (req, res) => {
  // take data from input -> req.body - done
  // validate the data [email/username] then give access to the user by email or usename
  // password validate
  // refresh and access token
  // save the logedin user
  // send access token using cookies
  // give access to enter in the system
  try {
    const { email, userName, password } = req.body;
    // console.log("email::", email);
    // console.log("password::", password);
    // console.log("username::", userName);

    if (!email && !userName) {
      throw new ApiErrors(400, "required email ya username");
    }
    if (!password) {
      throw new ApiErrors(400, "password required");
    }

    const user = await User.findOne({
      $or: [{ email }, { userName }],
    });
    console.log("user::", user);
    if (!user) {
      throw new ApiErrors(404, "user does not exsited");
    }

    const passwordValidation = await user.isCorrectPassword(password);
    if (!passwordValidation) {
      throw new ApiErrors(409, "Invalid password");
    }

    // make a refresh and access token
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    //cookies send the access and refresh
    const options = {
      httpOnly: true,
      secure: false, // set to false for local testing
    };

    // send to the server and the user
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            loggedInUser,
            accessToken,
            refreshToken,
          },
          "user logged in successfully",
        ),
      );
  } catch (error) {
    console.log("Error::", error);
    return res
      .status(500)
      .json(new ApiErrors(500, "internal server error", [error.message]));
  }
};

// signOut
const signOut = async (req, res) => {
  // remove the accessToken

  try {
    await User.findByIdAndUpdate(
      req.user._id,

      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      },
    );
    // it will remove the refresh token from the user and set it undefined
    // remove the access and refresh token from the server

    const options = {
      httpOnly: true,
      secure: false, // set to false for local testing
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user successfully logged out"));
  } catch (error) {
    console.log("some error occurs while sign out", error);
    return res
      .status(500)
      .json(
        new ApiErrors(500, "some error occurs while sign out", [error.message]),
      );
  }
};

// access token generate again using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    // get refresh token from the frontend and create a new access token using the current refresh token
    const incommingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;
    if (!incommingRefreshToken) {
      throw new ApiErrors(401, "unauthorized request");
    }
    //  if avaiable then move next
    const decodedToken = await jwtVarify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiErrors(401, "Invalid refresh token");
    }

    // compare the incomming refresh token or stored refresh token
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiErrors(400, "refresh token will expired or used");
    }

    //  if it avaible then move next
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    // move next
    const options = {
      httpOnly: true,
      secure: false, // for testing from the local server
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "accessToken refreshed",
        ),
      );
    // not tested
  } catch (error) {
    console.log("Error:: Invalid  refresh token :: ", error);
    new ApiErrors(500, "Invalid refresh token", [error.message]);
  }
};

// reset password
const changedPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new ApiErrors(404, "All fields are required");
    }

    const user = await User.findById(req.user?._id);
    const isCorrectPassword = await user.isCorrectPassword(oldPassword);
    console.log("isCorrectPassword::", isCorrectPassword);

    if (!isCorrectPassword) {
      throw new ApiErrors(401, "enter your currect password for reset");
    }

    if (newPassword !== confirmPassword) {
      throw new ApiErrors(409, "confirm password not match to new password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    //  send the response
    res
      .status(200)
      .json(new ApiResponse(200, req.user, "password changed successfully"));
  } catch (error) {
    console.log("Field to changed password ::", error);
    res
      .status(500)
      .json(new ApiErrors(500, "field to change password", [error.message]));
  }
};

// get the user
const getUser = async (req, res) => {
  try {
    const user = req.user;

    res
      .status(200)
      .json(new ApiResponse(200, user, "sucessfully fetch the user"));
  } catch (error) {
    console.log("Field to fetch the user", error);
    res
      .status(500)
      .json(new ApiResponse(500, "Field to fetch the user", [error.message]));
  }
};

// update user data
const updateUserData = async (req, res) => {
  
  //update only datas of user not the files
  // save the updated data in the database
  try {

    const { fullName,  email} = req.body;
    if(!fullName || !email){
      throw new ApiErrors(401, 'all fields are required');
    }

    //move next
    const user = await User.findByIdAndUpdate(
       req.user._id,
       {
            $set: {
              fullName: fullName,
              email: email
            },
            
       },
       {
              new: true
            }

    ).select("-password");

    //send the updated data to the user
    res.status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Successfully update the user"
      )
    )


    
  } catch (error) {
    console.log('Field to update user data ::', error);
    res.status(500).json(new ApiErrors(500, 'Field to update user data', error));
  }
}

// update avatar images
const updateAvaterImages = async (req, res) => {
  
  try {

    const avatarLocalPath = req.file?.path;
      if(!avatarLocalPath){
        throw new ApiErrors(401, 'avatar file is missing');
      }

      // upload to the cloudinary
      const avatar = await uploadFileOnCloundinary(avatarLocalPath);
       if(!avatar.url){
        throw new ApiErrors(401, 'Field to upload file on cloudinary');
       }

       const user = await User.findByIdAndUpdate(req.user?._id,
        {
             $set: {
                 avatar: avatar.url
             },
             
        },
        {
          new: true,
        }
       )

       //send response
       res.status(200)
       .json(
        new ApiResponse(200, user, 'Successfully image updated')
       )
     
  } catch (error) {
    console.log('Field to update avatar ::', error);
    res.status(500)
    .json(new ApiErrors(
      500, 
      "Field to update avatar image",
      [error.message]
    ))
  }
}
// test controller
const testController = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    console.log("full name :", fullName);
    console.log("email :", email);
  } catch (error) {
    console.log("internal server error", error);
    res.status(500).send({
      message: "internal server error",
      status: false,
    });
  }
};
export default {
  registerController,
  testController,
  logIn,
  signOut,
  refreshAccessToken,
  changedPassword,
  getUser,
  updateUserData,
  updateAvaterImages,
};
