import { configureStore } from "@reduxjs/toolkit";
import historyReducer from "../features/history/historySlice";
import logger from "redux-logger";

export const store = configureStore({
  reducer: {
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
