import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket;
    userId: string;
    rooms: Set<number>; // ✅ roomId as Int
}

const users = new Set<User>();

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") return null;
        if (!(decoded as JwtPayload).userId) return null;
        return (decoded as JwtPayload).userId as string;
    } catch {
        return null;
    }
}

wss.on("connection", (ws, request) => {
    const url = request.url;
    if (!url) return ws.close();

    const token = new URLSearchParams(url.split("?")[1]).get("token") ?? "";
    const userId = checkUser(token);
    if (!userId) return ws.close();

    const user: User = {
        ws,
        userId,
        rooms: new Set()
    };

    users.add(user);

    ws.on("message", async (data) => {
        try {
            const parsed = JSON.parse(data.toString());

            if (parsed.type === "join_room") {
                const roomId = Number(parsed.roomId);
                if (!Number.isInteger(roomId)) return;

                user.rooms.add(roomId);
                return;
            }

            if (parsed.type === "leave_room") {
                user.rooms.delete(Number(parsed.roomId));
                return;
            }

            if (parsed.type === "chat") {
                const roomId = Number(parsed.roomId);
                const message = parsed.message;

                if (!user.rooms.has(roomId)) return;

                try {
                    const response = await prismaClient.chat.create({
                        data: {
                            roomId,
                            userId,
                            message
                        }
                    });
                } catch (err) {
                    ws.send(JSON.stringify({ message: "error saving message" }))
                    console.log(err)
                    return;
                }

                users.forEach((u) => {
                    if (
                        u.rooms.has(roomId) &&
                        u.ws.readyState === WebSocket.OPEN
                    ) {
                        u.ws.send(
                            JSON.stringify({
                                type: "chat",
                                roomId,
                                message,
                                from: userId
                            })
                        );
                    }
                });
            }
        } catch {
            ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
    });

    ws.on("close", () => {
        users.delete(user);
    });
});

console.log("WebSocket server running on ws://localhost:8080");
