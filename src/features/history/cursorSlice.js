import { createSlice } from "@reduxjs/toolkit";
import { PAPER_CANVAS_WIDTH } from "../../constants/canvasConfig";

const initialState = {
  rightHand: {
    x: 0,
    y: 0,
  },
  leftHand: {
    x: PAPER_CANVAS_WIDTH,
    y: 0,
  },
  leftCount: 0,
  rightCount: 0,
};

export const cursorSlice = createSlice({
  name: "cursor",
  initialState,
  reducers: {
    setLeftCursorPosition: (state, action) => {
      state.leftHand = action.payload;
    },
    setRightCursorPosition: (state, action) => {
      state.rightHand = action.payload;
    },
    setLeftCount: (state, action) => {
      state.leftCount = action.payload;
    },
    setRightCount: (state, action) => {
      state.rightCount = action.payload;
    },
  },
});

export const {
  setLeftCursorPosition,
  setRightCursorPosition,
  setLeftCount,
  setRightCount,
} = cursorSlice.actions;

export default cursorSlice.reducer;
