let prevCount = 0;
let nextCount = 0;
const color = ["red", "orange", "yellow", "blue", "green", "black"];
let index = 0;

export function prevColor(setColor) {
  prevCount++;

  if (prevCount > 20) {
    setColor(color[index]);
    prevCount = 0;
    index--;
    if (index < 0) {
      index = color.length - 1;
    }
  }
}

export function nextColor(setColor) {
  nextCount++;

  if (nextCount > 20) {
    setColor(color[index]);
    nextCount = 0;
    index++;
    if (index > color.length - 1) {
      index = 0;
    }
  }
}
