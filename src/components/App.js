import Room from "./Room";
import { createGlobalStyle } from "styled-components";
export default function App() {
  return (
    <div>
      <GlobalStyle />
      <Room />
    </div>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;
