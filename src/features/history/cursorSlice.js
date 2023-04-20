import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rightHand: {
    x: 0,
    y: 0,
  },
  leftHand: {
    x: 0,
    y: 0,
  },
  count: 0,
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
    setCount: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const { setLeftCursorPosition, setRightCursorPosition, setCount } =
  cursorSlice.actions;

export default cursorSlice.reducer;
