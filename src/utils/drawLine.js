export function drawLine(result, ctx, x, y) {
  console.log(result);
  if (result.handednesses.length > 0) {
    if (
      result.handednesses[0][0].categoryName === "Left" &&
      result.gestures[0][0].categoryName === "Open_Palm"
    ) {
      ctx.moveTo(x, y);
    } else if (result.handednesses[0][0].categoryName === "Left") {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}
