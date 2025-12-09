import { z } from "zod"

export const CreateUserSchema = z.object({
    username: z.string().min(3, "Username should be greater than 3 characters").max(20, "Username cannot be greater than 20 characters"),
    password: z.string(),
    name: z.string(),
})

export const SigninSchema = z.object({
    username: z.string().min(3, "Username should be greater than 3 characters").max(20, "Username cannot be greater than 20 characters"),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20)
})