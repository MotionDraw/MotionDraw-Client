import Start from "./Start";
import Lobby from "./Lobby";
import Room from "./Room";
import { Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SOCKET_URL);

export default function App() {
  return (
    <div>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/rooms/:roomName" element={<Room />} />
      </Routes>
    </div>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;
