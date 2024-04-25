import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { destroyImg } from "../utils/destroyImg.js";
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

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User Logged Out Successfully", {}))
})

const getUser = asyncHandler(async(req, res) => {
    const {username, fullName} = req.params
    if (!(username || fullName)) {
        throw new ApiError(400, "Please Enter the username or the name of the user")
    }

    const user = await User.findOne({
        $or: [{username}, {fullName}]
    }).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(400, "User does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, "user fetched successfully", user)
    )
})

const updateUser = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    if (!(fullName || email )) {
        throw new ApiError(400, "All fields are requried")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200,  "User updated Successfully", user)
    )
})

const updatePassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body
    if (!(oldPassword && newPassword)) {
        throw new ApiError(400, "please provide old and new password")
    }

    const user = await User.findById(req.user?._id)
    const isCurrentPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isCurrentPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, "Password Changed Successfully", {}))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            "User fetched successfully",
            req.user
        )
    )
})

const updateProfileImg = asyncHandler(async(req, res) => {
    const profileImgLocalPath = req.file?.path
    if(!profileImg) {
        throw new ApiError(400, "Please provide the profile Img")
    }

    if (req.user.profileImg && req.user.profileImg !== "") {
        const oldProfileImg = req.user.profileImg.split("/").pop().split(".")[0]
        await destroyImg(oldProfileImg)
    }

    const profileImg = await uploadOnCloudinary(profileImgLocalPath)

    if(!profileImg.url) {
        throw new ApiError(400, "Error while uploading profile image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profileImg: profileImg.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, "Profile Image Updated Successfully", user)
    )
})

const updateCoverImg = asyncHandler(async(req, res) => {
    const coverImgLocalPath = req.file?.path
    if (!coverImgLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    if (req.user.coverImg && req.user.coverImg !== "") {
        const oldCoverImg = req.user.coverImg.split("/").pop().split(".")[0]
        await destroyImg(oldCoverImg)
    }


    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    if (!coverImg.url) {
        throw new ApiError(400, "Failed to upload cover image")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImg: coverImg.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, "Cover Image Updated Successfully", user)
    )
})

export {
    registerUser,
    loginUser,
    logoutUser
}