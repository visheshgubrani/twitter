import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Follower } from "../models/follower.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const toggleFollow = asyncHandler(async(req, res) => {
    const {userId} = req.params //the user we want to follow
    const currentUserId = req.user?._id //our userId, the user doing the following

    const user = await User.findById(userId) 
    if (!user) {
        throw new ApiError(400, 'Please enter the correct userid')
    }

    if (userId.toString() === currentUserId.toString()) {
        throw new ApiError(400, "You cannot follow yourself")
    }
    // find the follow
    const follow = await Follower.findOne({
        followedBy: currentUserId, //
        following: userId // following this userid bu current user
    })

    if (follow) {
        // Unfollow
        await Follower.findByIdAndDelete(follow?._id)
        return res.status(200).json(
            new ApiResponse(200, "Unfollow Successful")
        )
    }

    await Follower.create({
        followedBy: currentUserId, //current user 
        following: userId //from req.params
    })

    return res.status(200).json(
        new ApiResponse(200, "Followed Successfully", {})
    )

})

export {
    toggleFollow
}