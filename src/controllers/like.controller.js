import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Notification } from "../models/notification.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const togglePostLike = asyncHandler(async(req, res) => {
    const {postId} = req.params
    const userId = req.user?._id

    const post = await Post.findById(postId)
    if (!post) {
        throw new ApiError(400, "Post not found")
    }

    // Check if a like already exists
    const existingLike = await Like.findOne({
        post: postId,
        likedBy: userId
    })

    if (existingLike) {
        // Unlike the post
        await Like.findByIdAndDelete(existingLike._id)
        await Post.findByIdAndUpdate(postId, {$inc: {likesCount: -1}})
        return res.status(200).json(
            new ApiResponse(200, "Disliked Success", {})
        )
    }
    
    // Like the post
    await Like.create({
        post: postId,
        likedBy: userId
    })

    await Post.findByIdAndUpdate(postId,
    {
        $inc: {
            likesCount: 1
        }
    })

    const notification = await Notification.create({
        from: userId,
        to: post.user?._id,
        type: "like"
    })

    if (!notification) {
        throw new ApiError(400, "Failed to send notification")
    }
    res.status(200).json(
        new ApiResponse(200, "Successfully Liked a post", {})
    )
})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "comment doesn't exists")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id)
        await Comment.findByIdAndUpdate(commentId, {$inc: {likesCount: -1}})
        return res.status(200).json(
            new ApiResponse(200, "Disliked Success", {})
        )
    }

    await Like.create({
        comment: commentId,
        likedBy: userId
    })

    await Comment.findByIdAndUpdate(
        commentId,
        {
            $inc: {
                likesCount: 1
            }
        }
    )

    return res.status(200).json(
        new ApiResponse(200, "Liked the comment successfully", {})
    )
})

export {togglePostLike, toggleCommentLike}