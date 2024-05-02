import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const followerSchema = new Schema({
    followers: { //user followers (like any user followers)
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    following: { //users the user is following
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

followerSchema.plugin(mongooseAggregatePaginate)

export const Follower = mongoose.model('Follower', followerSchema)