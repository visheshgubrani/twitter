import mongoose, {Schema} from "mongoose";

const notificationSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    type: {
        type: String,
        enum: ["follow", "like"],
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

export const Notification = mongoose.model('Notification', notificationSchema)