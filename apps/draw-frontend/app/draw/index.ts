
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
}

export const initDraw = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return;

    let existingShapes: Shape[] = [];

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        clearCanvas(existingShapes, canvas, ctx)
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas)

    const getMousePos = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    let clicked = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true;
        const { x, y } = getMousePos(e)
        startX = x
        startY = y
    }

    const handleMouseUp = (e: MouseEvent) => {
        clicked = false;

        const { x, y } = getMousePos(e);

        const width = x - startX;
        const height = y - startY;

        existingShapes.push({
            type: "rect",
            x: startX,
            y: startY,
            width,
            height,
        });

    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!clicked) return;

        const { x, y } = getMousePos(e)

        const width = x - startX;
        const height = y - startY;

        clearCanvas(existingShapes, canvas, ctx)
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, width, height)
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);


    return () => {
        window.removeEventListener("resize", resizeCanvas);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
    };

}

const clearCanvas = (existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    existingShapes.forEach((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)

        }
    })
}