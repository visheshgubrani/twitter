import mongoose, {Schema} from "mongoose";

const followerSchema = new Schema({
    followedBy: { //user who follow this user 
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    following: { //users this user is following
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Follower = mongoose.model('Follower', followerSchema)