"use client"


import { useEffect, useRef, useState } from "react";
import IconButton from "./iconButton";
import { Circle, Eraser, MousePointer, Pencil, RectangleHorizontal } from "lucide-react";
import { Draw } from "@/app/draw/draw";

export type Tool = "circle" | "rect" | "pencil"

export default function Canvas({ roomId, socket }: {
    roomId: string,
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [game, setGame] = useState<Draw | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("rect")

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game])

    useEffect(() => {
        if (!game) return;

        const onResize = () => game.resize();
        onResize()

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize)

    }, [game])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            const g = new Draw(canvas, roomId, socket)
            setGame(g)

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef])

    return (
        <div className="h-screen overflow-hidden">
            <canvas ref={canvasRef} />

            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

        </div>
    )
}

const TopBar = ({ selectedTool, setSelectedTool }: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void
}) => {
    return (
        <span className="bg-gray-700 fixed top-1.5 left-1/2 p-2 rounded-xl -translate-x-1/2  flex gap-1">
            {/* <IconButton icon={<MousePointer />} onClick={() => { }} /> */}

            <IconButton activated={selectedTool === "pencil"} icon={<Pencil />} onClick={() => { setSelectedTool("pencil") }} />

            <IconButton activated={selectedTool === "rect"} icon={<RectangleHorizontal />} onClick={() => { setSelectedTool("rect") }} />

            <IconButton activated={selectedTool === "circle"} icon={<Circle />} onClick={() => { setSelectedTool("circle") }} />

            {/* <IconButton  icon={<Eraser />} onClick={() => { }} /> */}
        </span>
    )
}