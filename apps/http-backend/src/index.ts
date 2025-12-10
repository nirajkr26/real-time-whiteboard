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
        res.json({
            roomId: "123"
        })
    } catch (err) {

    }
})



app.listen(4000, () => {
    console.log("http server running on port 4000")
})