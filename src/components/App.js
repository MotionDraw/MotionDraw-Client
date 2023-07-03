import Start from "./Start";
import Lobby from "./Lobby";
import Room from "./Room";
import { Routes, Route } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";

export default function App() {
  return (
    <div>
      <GlobalStyle />
      <Wrapper>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/rooms/:roomName" element={<Room />} />
        </Routes>
      </Wrapper>
      <Notice>
        <p>모바일, 태블릿 환경에서</p>
        <p>이용 불가능합니다</p>
        <p>PC 크롬 환경에서 실행해 주십시오</p>
      </Notice>
    </div>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const Wrapper = styled.div`
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const Notice = styled.div`
  @media screen and (min-width: 768px) {
    display: none;
  }
  font-size: 1.5rem;
  line-height: 1;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
