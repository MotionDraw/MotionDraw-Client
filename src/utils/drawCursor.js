export function drawCursor(result, ctx, x, y, color, lineWidth, mode) {
  const eraserSize = lineWidth * 5;
  const radius = lineWidth / 2;

  if (result.handednesses.length > 0) {
    if (result.handednesses[0][0].categoryName === "Left") {
      if (mode === "Erase") {
        ctx.clearRect(0, 0, 960, 540);
        ctx.strokeRect(
          x - eraserSize / 2,
          y - eraserSize / 2,
          eraserSize,
          eraserSize
        );
        return;
      }
      ctx.beginPath();
      ctx.clearRect(0, 0, 960, 540);
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}
