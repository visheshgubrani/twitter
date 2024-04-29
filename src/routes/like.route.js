import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, togglePostLike } from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/toggle/comment/:commentId").post(toggleCommentLike) 
router.route("/toggle/post/:postId").post(togglePostLike)
export {router as likeRouter}