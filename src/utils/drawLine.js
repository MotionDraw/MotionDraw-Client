let prevMode = "";

export function drawLine(result, ctx, x, y, color, mode) {
  if (result.handednesses.length > 0) {
    if (mode === "Move") {
      prevMode = "Move";
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (mode === "Erase") {
      prevMode = "Erase";
      ctx.clearRect(x - 5, y - 5, 10, 10);
    } else if (mode === "Draw") {
      if (prevMode === "Erase") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        prevMode = "Draw";
        return;
      }
      prevMode = "Draw";
      ctx.strokeStyle = color;
      ctx.lineTo(x + 1, y + 1);
      ctx.stroke();
    }
  }
}
