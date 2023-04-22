import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { socket } from "./App";

export default function MyCursor({ roomName, canvas }) {
  const cursor = useSelector((state) => state.cursor);
  const count = useSelector((state) => state.cursor.count);
  const [invisibleCount, setInvisibleCount] = useState(5);

  useEffect(() => {
    socket.emit("cursorPosition", roomName, socket.id, cursor);
  }, [roomName, cursor]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (invisibleCount > 0) {
        setInvisibleCount((count) => count - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [invisibleCount]);

  useEffect(() => {
    setInvisibleCount(5);
  }, [cursor]);

  return (
    <>
      {invisibleCount !== 0 && (
        <>
          <RightCursor
            left={
              canvas.current &&
              canvas.current.width -
                cursor.rightHand.x +
                canvas.current.offsetLeft +
                canvas.current.offsetParent.offsetParent.offsetLeft +
                50
            }
            top={
              canvas.current &&
              cursor.rightHand.y +
                canvas.current.offsetTop +
                canvas.current.offsetParent.offsetTop +
                canvas.current.offsetParent.offsetParent.offsetTop +
                5
            }
          >
            RightHand
          </RightCursor>
          <LeftCursor
            left={
              canvas.current &&
              canvas.current.width -
                cursor.leftHand.x +
                canvas.current.offsetLeft +
                canvas.current.offsetParent.offsetParent.offsetLeft +
                50 -
                80 +
                5
            }
            top={
              canvas.current &&
              cursor.leftHand.y +
                canvas.current.offsetTop +
                canvas.current.offsetParent.offsetTop +
                canvas.current.offsetParent.offsetParent.offsetTop +
                5
            }
          >
            <ProgressBar progress={count} />
            LeftHand
          </LeftCursor>
        </>
      )}
    </>
  );
}

const RightCursor = styled.div`
  position: absolute;
  width: 80px;
  height: 20px;
  padding: 5px;

  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  z-index: 20;

  text-align: center;
  font-size: 1rem;

  border: 1px solid black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-right-radius: 20px;

  color: rgb(255, 255, 255);
  background-color: rgba(242, 65, 57, 0.5);
`;

const LeftCursor = styled.div`
  position: absolute;
  width: 80px;
  height: 20px;
  padding: 5px;

  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  z-index: 20;

  text-align: center;
  font-size: 1rem;

  border: 1px solid black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 20px;
  border-color: black black black black;

  color: rgb(255, 255, 255);
  background-color: rgba(242, 65, 57, 0.5);
`;

const ProgressBar = styled.div`
  position: absolute;
  width: ${(props) => `${props.progress}%`};
  height: 100%;

  left: 0;
  top: 0;

  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  background: rgba(242, 65, 57);
`;
