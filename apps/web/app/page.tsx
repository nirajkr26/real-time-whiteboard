"use client"

import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function Home() {
  const [roomId, setRoomId] = useState("")
  const router = useRouter()

  return (
    <div className="flex w-screen h-screen justify-center items-center">
      <div className=" flex gap-2">
        <input className="border border-gray-300 p-2 rounded-md text-white " type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room id" />

        <button className="bg-white p-2 rounded-md" onClick={() => {
          router.push(`/room/${roomId.trim()}`)
        }} disabled={!roomId.trim()}>Join room</button>
      </div>
    </div>
  );
}
