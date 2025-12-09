import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware"
import { CreateUserSchema } from "@repo/common/types"

const app = express()

app.use(express.json())

app.post("/signup", async (req, res) => {
    try {
        const data = CreateUserSchema.safeParse(req.body)

        if (!data.success) {
            return res.json({
                message: "Incorrect credentials"
            })
        }

        res.json({
            userId: 1
        })

    } catch (err) {

    }
})

app.post("/signin", async (req, res) => {
    try {
        const userId = 1;
        const token = jwt.sign({ userId }, JWT_SECRET)

        res.json({
            token
        })

    } catch (err) {
        console.log(err)
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