import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async(req, res) => {
    const {postId} = req.params
    const post = await Post.findById(postId)
    if (!post) {
        throw new ApiError(400, "Failed to find the post")
    } 

    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "Comment cannout be empty")
    }

    const comment = await Comment.create({
        content,
        post,
        user: req.user?._id
    })

    if (!comment) {
        throw new ApiError(400, "Failed to create comment")
    }

    return res.status(201).json(
        new ApiResponse(200, "Comment added successfully", comment)
    )
})

const getComments = asyncHandler(async(req, res) => {
    const {postId} = req.params
    const post = await Post.findById(postId)

    if (!post) {
        throw new ApiError(400, "Post not found")
    }

    const comments = await Comment.find({
        post
    })
    
    if (!comments) {
        throw new ApiError(400, "Unable to fetch comments")
    }

    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", comments)
    )
})

const getComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Unable to fetch comment")
    }

    return res.status(200).json(
        new ApiResponse(200, "Comment fetched successfully", comment)
    )
}) 

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "Unable to fetch the comment")
    }

    if (comment.user?.toString() !== userId.toString()) {
        throw new ApiError(400, "Not Authenticated to delete")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(400, "Unable to delete the comment")
    }

    return res.status(200).json(
        new ApiResponse(200, "Successfully deleted the comment")
    )
})

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const userId = req.user?._id
    const {content} = req.body

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if (comment.user?.toString() !== userId.toString()) {
        throw new ApiError(400, "User not authenticated to update comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if (!updatedComment) {
        throw new ApiError(400, "Failed to update the comment")
    }

    return res.status(200).json(
        new ApiResponse(200, "Updated the comment successfully")
    )
})

const getLikes = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req,query.limit, 10) || 10
    const skip = (page - 1) * limit

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    const likes = await Like.find({
        comment: commentId
    }).skip(skip).limit(limit)

    const total = await Like.countDocuments({comment: commentId})

    res.status(200).json(
        new ApiResponse(200, "Likes fetched successfully", {
            likes,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalLikes: total
        })
    )
})

export {
    addComment,
    getComment,
    getComments,
    updateComment,
    deleteComment,
    getLikes
}