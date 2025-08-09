import { User } from "../../model/users.model.js";
import { ApiErrors } from "../../utilis/apiError.js";
import { ApiResponse } from "../../utilis/apiResponse.js";
import { uploadFileOnCloundinary } from "../../utilis/cloudnary.js";
import bcrypt from "bcrypt";

// generate accessToken & refresh token
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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
    console.log('user::', user)
    if (!user) {
      throw new ApiErrors(404, 'user does not exsited')
    }

    const passwordValidation = await user.isCorrectPassword(password);
    if(!passwordValidation){
      throw new ApiErrors(409, 'Invalid password')
    }

    // make a refresh and access token
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    //cookies send the access and refresh
    const options = {
      httpOnly: true,
      secure: true,
    };

    // send to the server and the user
    return res.status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
       new ApiResponse(
         200,
      {
        loggedInUser , accessToken, refreshToken
      },
       'user logged in successfully'
       )

    )


  } catch (error) {
    console.log("Error::", error)
    return res.status(500)
    .json(
      new ApiErrors(500, "internal server error", [error.message])
    )
  }
};

// signOut


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
export default { registerController, testController, logIn };
