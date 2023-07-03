import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_SOCKET_URL
    : "http://localhost:4000";

export const socket = io(URL, {
  maxHttpBufferSize: 10 * 1024 * 1024,
});
