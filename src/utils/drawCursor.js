export function drawCursor(result, ctx, x, y, color, mode) {
  if (result.handednesses.length > 0) {
    if (result.handednesses[0][0].categoryName === "Left") {
      if (mode === "Erase") {
        ctx.clearRect(0, 0, 960, 540);
        ctx.strokeRect(x - 5, y - 5, 10, 10);
        return;
      }
      ctx.beginPath();
      ctx.clearRect(0, 0, 960, 540);
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}
