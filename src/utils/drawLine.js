let prevMode = "";
let prevPosition = {};

export function drawLine(result, ctx, x, y, color, lineWidth, mode, socketId) {
  const eraserSize = lineWidth * 10;

  if (result.handednesses.length > 0) {
    if (mode === "Move") {
      prevMode = "Move";
      ctx.beginPath();
      ctx.moveTo(x, y);
      prevPosition = { ...prevPosition, [socketId]: { x, y } };
    } else if (mode === "Erase") {
      prevMode = "Erase";
      ctx.clearRect(
        x - eraserSize / 2,
        y - eraserSize / 2,
        eraserSize,
        eraserSize
      );
    } else if (mode === "Draw") {
      if (prevMode === "Erase") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        prevMode = "Draw";
        return;
      }
      ctx.beginPath();
      if (prevPosition[socketId]) {
        ctx.moveTo(prevPosition[socketId].x, prevPosition[socketId].y);
      } else {
        ctx.moveTo(x, y);
      }

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();

      prevMode = "Draw";
      prevPosition = { ...prevPosition, [socketId]: { x, y } };
    }
  }
}
