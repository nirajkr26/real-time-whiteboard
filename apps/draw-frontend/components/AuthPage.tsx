"use client"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"

export function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 flex flex-col gap-2 bg-white rounded-lg">
                <Input type={"text"} placeholder={"Email"} />
                
                <Input type={"password"} placeholder={"Password"} />

                <Button children={isSignin ? "Sign in" : "Sign up"} className={"p-2 bg-slate-800 text-white rounded-lg cursor-pointer"} />
            </div>

        </div>
    )
}