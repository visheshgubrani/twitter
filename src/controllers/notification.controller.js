import { Notification } from "../models/notification.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getNotifications = asyncHandler(async(req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not authenticated")
    }

    const notification = await Notification.find({ to: userId })
    .populate('from', '_id username profileImg')
    .populate('post', '_id content')
    .sort({ createdAt: -1 })

    if (!notification) {
        throw new ApiError(400, "Failed to fetch the notification")
    }

    return res.status(200).json(
        new ApiResponse(200, "Notification fetched successfully", notification)
    )
})

const deleteNotification = asyncHandler(async (req, res) => {
    // Get the notification id
    // get the user id
    // find the notification
    //check if the user can delete the notificatoin
    // 
    const notificationId = req.params?.notificationId
    const userId = req.user?._id

    const notification = await Notification.findById(notificationId)
    if (!notification) {
        throw new ApiError(400, "Notification not found")
    }

    if (notification.to.toString() !== userId.toString()) {
        throw new ApiError(400, "User not authenticated to delete the notification")
    }

    await Notification.findByIdAndDelete(notificationId)


    return res.status.status(200).json(
        new ApiResponse(200, "Notification Deleted Successfully", {})
    )

})

const deleteNotifications = asyncHandler(async(req, res) => {
    // Get the notifications
    // delete them
    const userId = req.user?._id
    
    await Notification.deleteMany({ to: userId })
    return res.status(200).json(
        new ApiResponse(200, "Notifications Deleted Successfully", {})
    )
})

export {getNotifications, deleteNotification, deleteNotifications}