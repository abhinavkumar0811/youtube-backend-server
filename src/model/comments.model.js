import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({}, {timestamps: true}, {strict: true})


export const Comment = mongoose.model('Comment', commentSchema);
