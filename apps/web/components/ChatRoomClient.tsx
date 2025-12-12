"use client"

import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"

export function ChatRoomClient({
    messages,
    id
}: {
    messages: { message: string }[],
    id: string
}) {
    const [chats, setChats] = useState(messages)
    const { socket, loading } = useSocket()
    const [currentMessage, setCurrentMessage] = useState("")

    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }))

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, { message: parsedData.message }])
                }
            }
        }
    }, [socket, loading, id])

    return (
        <div>
            <div className="p-2">
                {chats.map((m, index) => <div key={index}> {m.message}</div>)}
            </div>
            <div className="flex gap-2 justify-center items-center">

                <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} placeholder="Type Message..." className="rounded-md border border-gray-300 p-2 text-white" />

                <button onClick={() => {
                    socket?.send(JSON.stringify({
                        type: "chat",
                        roomId: id,
                        message: currentMessage
                    }))
                    setCurrentMessage("")
                }} className="bg-white text-black p-2 rounded-md">Send Message</button>
            </div>
        </div>
    )
}