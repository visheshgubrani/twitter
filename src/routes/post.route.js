import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addPost, deletePost, getAllPosts, getPost, updatePost } from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/add").post(verifyJWT, upload.single("postImage") ,addPost)
router.route("/update/:id").patch(verifyJWT, upload.single("postImage"), updatePost)
router.route("/:id").get(getPost)
router.route("/").get(getAllPosts)
router.route("/delete/:id").delete(verifyJWT, deletePost)

export {router as postRouter}