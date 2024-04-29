import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { UserRouter } from './routes/user.route.js'
import { postRouter } from './routes/post.route.js'
import { commentRouter } from './routes/comment.route.js'
import { followerRouter } from './routes/follower.route.js'
import { likeRouter } from './routes/like.route.js'
import { notificationRouter } from './routes/notification.route.js'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


// Routes
// User-Router
app.use("/api/v1/users", UserRouter)

// Post Router
app.use("/api/v1/posts", postRouter)

// Comment Router
app.use("/api/v1/comments", commentRouter)

// Follower Router
app.use("/api/v1/followers", followerRouter)

// like Router
app.use("/api/v1/likes", likeRouter)

// Notification ROuter
app.use("/api/v1/notifications", notificationRouter)

export {app}
