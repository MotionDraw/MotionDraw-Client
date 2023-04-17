import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    pushHistory: (state, action) => {
      state.history = [...state.history, action.payload];
    },
    initHistory: (state) => {
      state.history = [];
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
  },
});

export const { pushHistory, initHistory, setHistory } = historySlice.actions;

export default historySlice.reducer;
