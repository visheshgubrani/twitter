import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { destroyImg } from "../utils/destroyImg.js";
import { generateTokens } from "../utils/generateTokens.js";
import mongoose from "mongoose";
import { Follower } from "../models/follower.model.js";


const options = {
    httpOnly: true,
    secure: true
}

const registerUser = asyncHandler(async(req, res) => {
    const {fullName, username, email, password, bio, link} = req.body
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
        coverImg,
        bio,
        link
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
    //do lowercase either in schema or put regex here after fullname
    const user = await User.findOne({
        $or: [{username}, {fullName}] //{fullName: {$regex: new RegExp(`^${fullName}$`, 'i')}}
    }).select("-password -refreshToken -email")

    if (!user) {
        throw new ApiError(400, "User does not exists")
    }

    return res.status(200).json(
        new ApiResponse(200, "user fetched successfully", user)
    )
})

const updateUser = asyncHandler(async(req, res) => {
    const {fullName, email, username} = req.body
    if (!(fullName || email || username)) {
        throw new ApiError(400, "All fields are requried")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                username
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
    
    if (oldPassword === newPassword) {
        throw new ApiError(400, "Old and new passwords cannot be same")
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

const getUserFollowers = asyncHandler(async(req, res) => {
    const userId = req.params?.userId

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const followers = await Follower.aggregate([
        {
            $match: {
                following: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "followers",
                foreignField: "_id",
                as: "followerDetails"
            }
        },
        {
            $unwind: "$followerDetails"
        },
        {
            $project: {
                _id: "$followerDetails._id",
                username: "$followerDetails.username",
                profileImg: "$followerDetails.profileImg"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, "Followers fetched successfully", followers)
    )
})


const getUserFollowing = asyncHandler(async(req, res) => {
    const userId = req.params?.userId //get userid from the request
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id")
    }

    const aggregateQuery = Follower.aggregatePaginate([
        {
            $match: {
                followers: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "following",
                foreignField: "_id",
                as: "followingDetails"
            }
        },
        {
            $unwind: "$followingDetails"
        },
        {
            $project: {
                _id: "$followingDetails._id",
                username: "followingDetails.username",
                profileImg: "$followingDetails.profileImg"
            }
        }
    ])

    const options = {page, limit, sort: {
        createdAt: -1
    }}

    const followingResults = await Follower.aggregatePaginate(aggregateQuery, options)
    return res.status(200).json(
        new ApiResponse(200, "Fetched Following", followingResults)
    )

})

const getUserFollowersCount = asyncHandler(async(req, res) => {
    const userId = req.params?.userId

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId")
    }

    const followersCount = await Follower.countDocuments({
        following: new mongoose.Types.ObjectId(userId)
    })

    return res.status(200).json(
        new ApiResponse(200, "Followers Count Fetched Successfully", followersCount)
    )
})

const getUserFollowingCount = asyncHandler(async(req, res) => {
    const userId = req.params?.userId

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User")
    }

    const followingCount = await Follower.countDocuments({
        followers: new mongoose.Types.ObjectId(userId)
    })

    return res.status(200).json(
        new ApiResponse(200, "Following count fetched successfully", followingCount)
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    updatePassword,
    updateCoverImg,
    updateProfileImg,
    getCurrentUser,
    getUserFollowers,
    getUserFollowing,
    getUserFollowersCount,
    getUserFollowingCount
}