import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/").get(getNotifications).delete(deleteNotifications)
router.route("/:id").delete(deleteNotification)

export {router as notificationRouter}