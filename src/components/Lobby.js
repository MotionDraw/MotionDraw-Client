import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const navigate = useNavigate();

  function onClickHandler() {
    navigate("/rooms");
  }
  return (
    <Wrapper>
      <Circle top="-30vh" left="-30vh" diameter="70" color="blue" />
      <Circle top="-30vh" left="75vw" diameter="80" color="red" />
      <Circle top="40vh" left="70vw" diameter="90" color="yellow" />
      <RoomsContainer>
        <RoomsLists>
          <Room>방이름 1</Room>
          <Room>방이름 2</Room>
          <Room>방이름 3</Room>
        </RoomsLists>
      </RoomsContainer>
      <CreateRoomButton onClick={onClickHandler}>방 만들기</CreateRoomButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  font-size: 1em;
  justify-content: center;
  align-items: center;
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

const RoomsContainer = styled.div`
  position: relative;
  width: 75vw;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  color: gray;
`;

const RoomsLists = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 30px;
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.3);
`;

const Room = styled.div`
  position: relative;
  display: flex;
  width: 90%;
  margin: 10px;
  padding: 20px;
  border-radius: 10px;
  background-color: rgb(100, 100, 100);
  color: white;
  cursor: pointer;
`;

const CreateRoomButton = styled.button`
  display: flex;
  z-index: 1;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 150px;
  border-radius: 10px;
  border: none;
  background: rgb(251, 188, 4);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  font-size: 50px;
  color: rgb(255, 255, 255);
  :hover {
    color: skyBlue;
  }
`;
