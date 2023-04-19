let prevReady;

export function drawStraightLine(ctx, x1, y1, x2, y2, lineWidth, ready) {
  if (prevReady === false && ready === true) {
    ctx.beginPath();
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  prevReady = ready;
}
