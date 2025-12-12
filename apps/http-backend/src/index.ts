import "dotenv/config"
import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware"
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client"
const app = express()

app.use(express.json())

app.post("/signup", async (req, res) => {
    try {
        const parseddata = CreateUserSchema.safeParse(req.body)

        if (!parseddata.success) {
            res.json({
                message: "Incorrect inputs"
            })
            return;
        }

        const User = await prismaClient.user.create({
            data: {
                name: parseddata.data?.name,
                email: parseddata.data?.username,
                password: parseddata.data?.password
            }
        })

        res.json({
            userId: User.id
        })

    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
})

app.post("/signin", async (req, res) => {
    try {
        const parsedData = SigninSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.json({
                message: "Incorrect inputs"
            })
            return;
        }
        const User = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username
            }
        })

        if (User?.password != parsedData.data.password) {
            res.json({ message: "Incorrect credentials" })
            return;
        }

        const userId = User.id;
        const token = jwt.sign({ userId }, JWT_SECRET)
        res.setHeader("authorization", token)
        res.json({
            token
        })

    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
})

app.post("/room", middleware, async (req, res) => {
    try {
        const parsedData = CreateRoomSchema.safeParse(req.body)
        if (!parsedData.success) {
            res.json({
                message: "Incorrect input"
            })
            return;
        }

        const room = await prismaClient.room.create({
            data: {
                adminId: req.userId,
                slug: parsedData.data.name
            }
        })

        res.json({
            roomId: room.id
        })
    } catch (err: any) {
        res.status(400).json({
            message: err.message
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {
    try {

        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        })

        res.json({
            messages
        })
    } catch (err: any) {
        res.status(400).json({
            message: err.message
        })
    }
})

app.get("/room/:slug", async (req, res) => {
    try {

        const slug = req.params.slug;
        const room = await prismaClient.room.findFirst({
            where: {
                slug
            }
        })
        
        res.json({
            room
        })
    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
})

app.listen(4000, () => {
    console.log("http server running on port 4000")
})