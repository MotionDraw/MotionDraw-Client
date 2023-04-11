export function drawLine(result, ctx, x, y, color, mode) {
  if (result.handednesses.length > 0) {
    if (mode === "Move") {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (mode === "Erase") {
      ctx.clearRect(x, y, 10, 10);
    } else if (mode === "Draw") {
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}
