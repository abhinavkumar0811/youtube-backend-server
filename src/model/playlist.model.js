import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({}, {timestamps: true}, {strict: true})


export const Playlist = mongoose.model('Playlist', playlistSchema);
