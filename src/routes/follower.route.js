import { Router } from "express";
import { getUserFollowers, getUserFollowing } from "../controllers/follower.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.route("/followers/:userId").get(verifyJWT ,getUserFollowers)
router.route("/following/:userId").get(verifyJWT, getUserFollowing)

export {router as followerRouter}