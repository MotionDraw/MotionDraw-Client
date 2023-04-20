import { configureStore } from "@reduxjs/toolkit";
import historyReducer from "../features/history/historySlice";
import cursorReducer from "../features/history/cursorSlice";
import logger from "redux-logger";

export const store = configureStore({
  reducer: {
    history: historyReducer,
    cursor: cursorReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
