let prevReady = false;

export function drawStraightLine(ctx, x1, y1, x2, y2, lineWidth, ready) {
  if (ready === "Preview") {
    ctx.beginPath();
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    return;
  }

  if (prevReady === false && ready === true) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  prevReady = ready;
}

export function drawRectangle(ctx, x1, y1, x2, y2, lineWidth, ready) {
  if (ready === "Preview") {
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
    return;
  }

  if (prevReady === false && ready === true) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }

  prevReady = ready;
}

export function drawCircle(ctx, x1, y1, x2, y2, ready) {
  const radiusX = Math.abs(x1 - x2);
  const radiusY = Math.abs(y1 - y2);
  const radius = Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2)) / 2;

  if (ready === "Preview") {
    ctx.beginPath();
    ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return;
  }

  if (prevReady === false && ready === true) {
    ctx.beginPath();
    ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  prevReady = ready;
}
