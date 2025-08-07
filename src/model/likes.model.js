import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({}, {timestamps: true}, {strict: true})


export const Like = mongoose.model('Like', likesSchema);
