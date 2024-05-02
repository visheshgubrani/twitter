import { Router } from "express";
import { 
    getCurrentUser, 
    getUser, 
    loginUser, 
    logoutUser, 
    registerUser, 
    updateCoverImg, 
    updatePassword, 
    updateProfileImg, 
    updateUser,
    getUserFollowers,
    getUserFollowing, 
    getUserFollowersCount,
    getUserFollowingCount
    } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profileImg",
            maxCount: 1
        },
        {
            name: "coverImg",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/current").get(verifyJWT, getCurrentUser)
router.route("/:username").get(getUser) //aggregate the info (username, posts, followers, following, profileImg)
router.route("/update-user").patch(verifyJWT, updateUser)
router.route("/update-pass").patch(verifyJWT, updatePassword)
router.route("/update-coverimg").patch(verifyJWT,upload.single("coverImg") ,updateCoverImg)
router.route("/update-profileimg").patch(verifyJWT, upload.single("coverImg") ,updateProfileImg)
router.route("/followers/:userId").get(verifyJWT ,getUserFollowers)
router.route("/following/:userId").get(verifyJWT, getUserFollowing)
router.route("/followers/count/:userId").get(verifyJWT, getUserFollowersCount)
router.route("/following/count/:userId").get(verifyJWT, getUserFollowingCount)

export {router as UserRouter}