import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


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
export {router as UserRouter}