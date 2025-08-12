import mongoose from "mongoose";
import bcrypt, { genSalt } from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true

    },
    fullName:{
        type: String,
        required: true,
        index: true
    },
    avatar:{
        type: String,   // url stored from cloudnery service
        required: true
    },
    coverImage:{
        type: String,  // url stored from cloudnery service
    },
    password:{
        type: String,
        required: true,
        min: [8, 'password required']
    },
    refreshToken:{
        type: String,
        default: null
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vidio'
        }
    ]

}, {timestamps: true}, {strict: true})


// password hash before save (using pre-save hook)
userSchema.pre('save', async function (next) {
    try {
        
        if(this.isModified('password')){
            const salt = await bcrypt.genSalt(10); // with 10 round 
            this.password = await bcrypt.hash(this.password, salt);
        }
        return next();
    } catch (error) {
        next();
        console.error(`password hashing error: ${error.massage}`);
    }
});


// methode for compare password
userSchema.methods.isCorrectPassword = async function (password) {
    
    return await bcrypt.compare(password, this.password); // return in boolean

};

// method for access token 
userSchema.methods.generateAccessToken = async function () {
   return jwt.sign(
        {
            _id: this._id,   // change user_id to _id
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECURE,  // access token secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE   //access token expire 
        }

    )
    
};

// method for refesh token
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            user_id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET, // refresh token secret
        
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE // refresh token expire time
        }
    )
    
}





export const User = mongoose.model('User', userSchema); 