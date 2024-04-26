import { Like } from "../models/like.model";
import { Post } from "../models/post.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const toggleLike = asyncHandler(async(req, res) => {
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
    const newLike = await Like.create({
        post: postId,
        likedBy: userId
    })

    await Post.findByIdAndUpdate(postId,
    {
        $inc: {
            likesCount: 1
        }
    })

    res.status(200).json(
        new ApiResponse(200, "Successfully Liked a post", {})
    )
})

const toggleCommentLike = asyncHandler(async(req, res) => {

})

export {toggleLike}