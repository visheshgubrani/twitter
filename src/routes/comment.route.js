import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getComment, getComments, getLikes, updateComment } from "../controllers/comment.controller";

const router = Router()

router.use(verifyJWT)


router.route("/post/:postId").get(getComments).post(addComment)

router.route("/comment/:commentId").get(getComment).patch(updateComment).delete(deleteComment)

router.route("likes/:id").get(getLikes)


export {router as commentRouter}