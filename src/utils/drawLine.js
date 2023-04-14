let prevMode = "";

export function drawLine(result, ctx, x, y, color, lineWidth, mode) {
  const eraserSize = lineWidth * 5;

  if (result.handednesses.length > 0) {
    if (mode === "Move") {
      prevMode = "Move";
      ctx.beginPath();
      ctx.moveTo(x, y);
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
      prevMode = "Draw";
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}
