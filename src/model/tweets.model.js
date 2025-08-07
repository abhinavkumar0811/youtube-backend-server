import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({}, {timestamps: true}, {strict: true})


export const Tweets = mongoose.model('Tweets', tweetSchema);
