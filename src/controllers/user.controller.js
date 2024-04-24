import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateTokens } from "../utils/generateTokens.js";

const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async(req, res) => {
    const {fullName, username, email, password} = req.body
    if (!(fullName && username && email && password)) {
        throw new ApiError(400, "Please provide all the details")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }

    let coverImg, profileImg
    if (req.files.profileImg) {
        const profileImgUpload = await uploadOnCloudinary(req.files?.profileImg[0].path)
        if (!profileImgUpload) {
            throw new ApiError(500, "Error Uploading to Cloudinary")
        }
        profileImg = profileImgUpload.url
    }

    if (req.files.coverImg) {
        const coverImgUpload = await uploadOnCloudinary(req.files?.coverImg[0].path)
        if (!coverImgUpload) {
            throw new ApiError(500, "Error Uploading to Cloudinary")
        }
        coverImg = coverImgUpload.url
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        profileImg,
        coverImg
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(400, "Failed to create the user")
    }

    return res.status(201).json(
        new ApiResponse(201, "User Registered Successfully", createdUser)
    )
})

const loginUser = asyncHandler(async(req, res) => {
    const {email, username, password} = req.body

    if (!(username || email)) {
        throw new ApiError(400, "username or email required")
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(400, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not valid")
    }

    const {accessToken, refreshToken} = await generateTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, "User LoggedIn Successfully", {user: loggedInUser, accessToken, refreshToken}) //why are we sending this data?
    )
})
export {
    registerUser,
    loginUser
}