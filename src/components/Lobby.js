import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { socket } from "./App";
import { initHistory } from "../features/history/historySlice";

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function onClickRoom(roomName) {
    socket.emit("joinRoom", roomName, (response) => {
      if (response.success) {
        navigate(`/rooms/${response.payload}`);
      }
    });
  }

  function onCreateRoom() {
    const roomName = prompt("생성할 방 이름을 입력해 주세요.");
    if (!roomName) return alert("방 이름은 필수로 입력하여야 합니다.");

    socket.emit("createRoom", roomName, (response) => {
      if (response.success) {
        navigate(`/rooms/${response.payload}`);
      } else {
        alert("이미 존재하는 방입니다.");
      }
    });
  }

  useEffect(() => {
    dispatch(initHistory());
  }, [dispatch]);

  useEffect(() => {
    function roomListHandler(rooms) {
      setRooms(rooms);
    }

    socket.emit("roomList", roomListHandler);

    return () => {
      socket.off("roomList", roomListHandler);
    };
  }, []);

  return (
    <Wrapper>
      <Circle top="-30vh" left="-30vh" diameter="70" color="blue" />
      <Circle top="-30vh" left="75vw" diameter="80" color="red" />
      <Circle top="40vh" left="70vw" diameter="90" color="yellow" />
      <RoomsContainer>
        <RoomsLists>
          {Object.values(rooms).map((element, index) => {
            return (
              <Room key={index} onClick={() => onClickRoom(element.roomName)}>
                <div>방제목 : {element.roomName}</div>
                <div>{element.playerCount} 명 접속</div>
              </Room>
            );
          })}
        </RoomsLists>
      </RoomsContainer>
      <ButtonContainer>
        <CreateRoomButton onClick={onCreateRoom}>방 만들기</CreateRoomButton>
      </ButtonContainer>
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
  width: 70vw;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  color: gray;
`;

const ButtonContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 25vw;
  display: flex;
  flex-direction: column;
`;

const RoomsLists = styled.div`
  height: 85vh;
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
  justify-content: space-between;
  width: 90%;
  margin: 10px;
  padding: 20px;
  border-radius: 10px;
  background-color: rgb(100, 100, 100);
  color: white;
  cursor: pointer;
`;

const CreateRoomButton = styled.button`
  position: absolute;
  bottom: 50px;
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
