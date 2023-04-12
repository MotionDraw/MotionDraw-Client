let count = 0;
let gesture = "";
const color = ["red", "orange", "yellow", "blue", "green", "black"];
let index = 0;

export function prevColor(setColor) {
  if (gesture === "Thumb_Down") {
    count++;
  } else {
    gesture = "Thumb_Down";
    count = 0;
  }

  if (count > 20) {
    setColor(color[index]);
    count = 0;
    index--;
    if (index < 0) {
      index = color.length - 1;
    }
  }
}

export function nextColor(setColor) {
  if (gesture === "Thumb_Up") {
    count++;
  } else {
    gesture = "Thumb_Up";
    count = 0;
  }

  if (count > 20) {
    setColor(color[index]);
    count = 0;
    index++;
    if (index > color.length - 1) {
      index = 0;
    }
  }
}
