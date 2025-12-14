import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./getExisitingShapes";


type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class Draw {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "rect";
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.clearCanvas();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2)
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY)
                this.ctx.lineTo(shape.endX, shape.endY)
                this.ctx.stroke()
            }
        })
    }

    getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        const { x, y } = this.getMousePos(e)
        this.startX = x;
        this.startY = y;
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        const { x, y } = this.getMousePos(e);

        const width = x - this.startX;
        const height = y - this.startY;

        this.clearCanvas();
        this.ctx.strokeStyle = "white"

        const selectedTool = this.selectedTool;

        if (selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2)
            this.ctx.stroke();
            this.ctx.closePath();
        } else if (selectedTool === "pencil") {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY)
            this.ctx.lineTo(x, y)
            this.ctx.stroke();
        }
    }


    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;

        const { x, y } = this.getMousePos(e);
        const width = x - this.startX;
        const height = y - this.startY;

        let shape: Shape | null = null;

        const selectedTool = this.selectedTool;

        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2
            }
        } else if (selectedTool == "pencil") {
            shape = {
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX: x,
                endY: y
            }
        }

        if (!shape) return;

        this.existingShapes.push(shape);
        this.clearCanvas()

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        }))
    }


    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    }
}