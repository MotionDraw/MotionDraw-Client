import styled from "styled-components";

export default function Start() {
  return (
    <Wrapper>
      <Circle top="-30vh" left="-30vh" diameter="70" color="blue" />
      <Circle top="-30vh" left="75vw" diameter="80" color="red" />
      <Circle top="40vh" left="70vw" diameter="90" color="yellow" />
      <StartButton>Start</StartButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
`;

const Circle = styled.div`
  position: fixed;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  width: ${(props) => `${props.diameter}vh`};
  height: ${(props) => `${props.diameter}vh`};
  background-color: ${(props) => props.color};
  border-radius: 50%;
`;

const StartButton = styled.button`
  width: 40vw;
  height: 30vh;
  background-color: rgb(255, 255, 255);
  border: none;
  border-radius: 10px;
  font-size: 8em;
  color: rgb(0, 0, 0);
  :hover {
    color: skyBlue;
  }
`;
