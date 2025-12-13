"use client"

import { initDraw } from "@/app/draw";
import { useEffect, useRef } from "react";

export default function Canvas({ roomId }: { roomId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            initDraw(canvas);
        }
    }, [canvasRef])

    return (
        <div className="bg-white">
            <canvas ref={canvasRef} className="fixed inset-0" />
        </div>
    )
}