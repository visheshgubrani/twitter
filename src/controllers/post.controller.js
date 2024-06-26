import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { destroyImg } from "../utils/destroyImg.js";
import { Like } from "../models/like.model.js";
import { Follower } from "../models/follower.model.js";
import mongoose from "mongoose";

const addPost = asyncHandler(async(req, res) => {
    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "Post Cannot be empty")
    }
    let postImage;
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file?.path)
        if (!uploadResult) {
            throw new ApiError(400, "Failed to upload post image")
        }

        postImage = uploadResult.url
    }

    const post = await Post.create({
        content,
        postImage,
        user: req.user?._id
    })

    if (!post) {
        throw new ApiError(400, "Failed to create post")
    }

    return res.status(201).json(
        new ApiResponse(201, "Post created successfully", post)
    )
})

const getAllPosts = asyncHandler(async(req, res) => { //update it to particular user
    const posts = await Post.find({})
    if (!posts) {
        throw new ApiError(400, "Posts not found")
    }
    return res.status(200).json(
        new ApiResponse(200, "Posts Fetched Successfully", posts)
    )
})

const getPost = asyncHandler(async(req, res) => {
    const {id} = req.params

    const post = await Post.findById(id)
    if (!post) {
        throw new ApiError(400, "Failed to fetch post")
    }

    res.status(200).json(
        new ApiResponse(200, "Post fetched successfully", post)
    )
})

const updatePost = asyncHandler(async(req, res) => {
    const {id} = req.params
    const post = await Post.findById(id)
    if (!post) {
        throw new ApiError(400, "Failed to fetch post")
    }

    if (req.user._id.toString() !== post.user.toString()) { //csl it
        throw new ApiError(403, "Unauthorized Request")
    }

    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "Please Enter the content")
    }

    if (post.postImage && post.postImage !== "") {
        const oldPostImage = post.postImage.split("/").pop().split(".")[0] //console log
        await destroyImg(oldPostImage)
    }

    let postImage;
    if (req.file) {
        const postImageLocalPath = req.file?.path
        const uploadImage = await uploadOnCloudinary(postImageLocalPath)
        postImage = uploadImage.url
    }

    const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
            content,
            postImage
        },
        {new: true}
    )
    return res.status(200).json(
        new ApiResponse(200, "Post Updated Successfully", updatedPost)
    ) 
})

const deletePost = asyncHandler(async(req, res) => {
    const {id} = req.params
    const post = await Post.findById(id)

    if (!post) {
        throw new ApiError(400, "Post not found")
    }

    if (req.user._id.toString() !== post.user.toString()) { //csl it
        throw new ApiError(403, "Unauthorized Request")
    }

    const deletedPost = await Post.findByIdAndDelete(id)

    if (!deletedPost) {
        throw new ApiError(400, "failed to delete the post")
    }
    
    return res.status(200).json(
        new ApiResponse(200, "Deleted the post successfully", {})
    )
})

const getLikes = asyncHandler(async(req, res) => {
    const {postId} = req.params
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    const Post = await Post.findById(postId)

    if (!postId) {
        throw new ApiError(400, "Post not found")
    }

    const likes = await Like.find({
        post: postId
    }).skip(skip).limit(limit)

    const total = await Like.countDocuments({post: postId})

    res.status(200).json(
        new ApiResponse(
            200,
            "Likes fetched successfullt",
            {
                likes,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalLikes: total
            }
        )
    )
})

const getFollowersPost = asyncHandler(async(req, res) => {
    const userId = req.user?._id
    const posts = await Follower.aggregate([
        {
            $match: {
                followedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: 'posts',
                localField: 'following',
                foreignField: 'user',
                as: 'userPosts'
            }
        },
        {
            $unwind: '$userPosts'
        },
        {
            $sort: {
                'userPosts.createdAt': -1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, "Posts from followed users fetched successfully", posts)
    )

})

export {addPost, getAllPosts, getPost, updatePost, deletePost, getLikes, getFollowersPost}