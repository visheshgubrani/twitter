import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { UserRouter } from './routes/user.route.js'
import { postRouter } from './routes/post.route.js'

const app = express()
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
export {app}
