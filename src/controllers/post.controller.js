import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { destroyImg } from "../utils/destroyImg.js";

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

const getAllPosts = asyncHandler(async(req, res) => {
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
    const {content} = req.body
    if (!content) {
        throw new ApiError(400, "Please Enter the content")
    }

    if (req.user.postImage && req.user.postImage !== "") {
        const oldPostImage = req.user.postImage.split("/").pop().split(".")[0] //console log
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
        }
    )
    return res.status(200).json(
        new ApiResponse(200, "Post Updated Successfully", updatedPost)
    ) 
})

export {addPost, getAllPosts}