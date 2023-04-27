import { setLeftCount } from "../features/history/cursorSlice";

let count = 0;
let gesture = "";
const colorArr = [
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
  dispatch(setLeftCount(count * 5));

  if (gesture === "Thumb_Down") {
    count++;
  } else {
    gesture = "Thumb_Down";
    count = 0;
  }

  if (count > 20) {
    count = 0;
    index--;
    setColor(colorArr[index]);
    if (index < 0) {
      index = colorArr.length - 1;
    }
  }
}

export function changeNextColor(setColor, dispatch) {
  dispatch(setLeftCount(count * 5));

  if (gesture === "Thumb_Up") {
    count++;
  } else {
    gesture = "Thumb_Up";
    count = 0;
  }

  if (count > 20) {
    count = 0;
    index++;
    setColor(colorArr[index]);
    if (index > colorArr.length - 1) {
      index = 0;
    }
  }
}

export function decreasesLineWidth(dispatch) {
  dispatch(setLeftCount(count * 10));
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
  dispatch(setLeftCount(count * 10));
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

export function changeColor(color) {
  index = colorArr.findIndex((item) => item === color);
}
