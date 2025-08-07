import mongoose, { Aggregate, plugin } from "mongoose";

const vidioSchema = new mongoose.Schema(
    {
        vidioFile:{
            type: String,   // used from cloudnery 
            required: true
        },
        thumnail:{
            type: String,   // used from cloudnery 
            required: true
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        title:{
            type: String
        },
        description:{
            type: String,
        },
        duration:{
            type: Number  // extract from cloudnary
        },
        view:{
            type: Number,
            default: 0
        },
        isPublised:{
            type: Boolean,
            default: true,
        }

    }
    , {timestamps: true}, {strict: true})

    // pending to plugin Aggregate


export const Vidio = mongoose.model('Vidio', vidioSchema);
