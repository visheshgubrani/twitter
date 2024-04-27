import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

export const Comment = mongoose.model("Comment", commentSchema)