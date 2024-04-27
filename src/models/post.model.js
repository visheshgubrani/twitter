import mongoose, {Schema} from "mongoose";

const postSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    postImage: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

export const Post = mongoose.model("Post", postSchema)

