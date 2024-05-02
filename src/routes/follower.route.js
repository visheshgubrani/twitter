import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleFollow } from "../controllers/follower.controller.js";

const router = Router()

router.route('/user/:userId').post(verifyJWT, toggleFollow)

export {router as followerRouter}