import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addPost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add-post").post(verifyJWT, upload.single("postImage") ,addPost)

export {router as postRouter}