import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Follower } from "../models/follower.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserFollowers = asyncHandler(async(req, res) => {
    const userId = req.params?.userId
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const aggregateQuery = await Follower.aggregate([
        {
            $match: {
                following: mongoose.Types.ObjectId(userId)
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
            $unwind: "followerDetails"
        },
        {
            $project: {
                _id: "$followerDetails._id",
                username: "$followerDetails.username",
                profileImg: "$followerDetails.profileImg"
            }
        }
    ])

    const options = {
        page,
        limit,
        sort: {
            createdAt: -1
        }
    }

    const followerResults = await Follower.aggregatePaginate(aggregateQuery, options)

    return res.status(200).json(
        new ApiResponse(200, "Followers fetched successfully", followerResults)
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

export {
    getUserFollowers,
    getUserFollowing
}