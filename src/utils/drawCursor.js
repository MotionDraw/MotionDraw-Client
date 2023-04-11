export function drawCursor(result, ctx, x, y, color) {
  if (result.handednesses.length > 0) {
    if (result.handednesses[0][0].categoryName === "Left") {
      ctx.beginPath();
      ctx.clearRect(0, 0, 960, 540);
      ctx.arc(x, y, 1, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}
