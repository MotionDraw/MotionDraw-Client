import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const navigate = useNavigate();

  function onClickHandler() {
    navigate("/lobby");
  }

  return (
    <Wrapper>
      <Circle
        top="-30vh"
        left="-30vh"
        diameter="70"
        color="blue"
        data-testid="circle"
      />
      <Circle
        top="-30vh"
        left="75vw"
        diameter="80"
        color="red"
        data-testid="circle"
      />
      <Circle
        top="40vh"
        left="70vw"
        diameter="90"
        color="yellow"
        data-testid="circle"
      />
      <Title>Motion Draw</Title>
      <StartButton onClick={onClickHandler}>Start</StartButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const Title = styled.div`
  font-size: 12em;
  font-weight: 800;

  z-index: 10;
  padding: -10px;
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
