import { setCount } from "../features/history/cursorSlice";

let count = 0;
let gesture = "";
const color = [
  "black",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "navy",
  "purple",
];
let index = 0;

export function changePrevColor(setColor, dispatch) {
  dispatch(setCount(count * 5));

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

export function changeNextColor(setColor, dispatch) {
  dispatch(setCount(count * 5));

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

export function decreasesLineWidth(dispatch) {
  dispatch(setCount(count * 10));
  if (gesture === "Closed_Fist") {
    count++;
  } else {
    gesture = "Closed_Fist";
    count = 0;
  }

  if (count > 10) {
    count = 0;
    return true;
  }

  return false;
}

export function increasesLineWidth(dispatch) {
  dispatch(setCount(count * 10));
  if (gesture === "Open_Palm") {
    count++;
  } else {
    gesture = "Open_Palm";
    count = 0;
  }

  if (count > 10) {
    count = 0;
    return true;
  }

  return false;
}
