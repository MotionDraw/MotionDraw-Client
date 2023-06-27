import { useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { socket } from "./App";
import { useCursorDisappearCount } from "../hooks/useCursorDisappearCount";

export default function DisplayMyCursor({ roomName, canvas }) {
  const cursor = useSelector((state) => state.cursor);
  const leftCount = useSelector((state) => state.cursor.leftCount);
  const rightCount = useSelector((state) => state.cursor.rightCount);
  const cursorDisappearCount = useCursorDisappearCount(5, cursor);

  useEffect(() => {
    socket.emit("cursorPosition", roomName, socket.id, cursor);
  }, [roomName, cursor]);

  return (
    <>
      {cursorDisappearCount !== 0 && (
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
            <ProgressBar progress={rightCount * 3.3} />
            RightHand
          </RightCursor>
          <LeftCursor
            left={
              canvas.current &&
              canvas.current.width -
                cursor.leftHand.x +
                canvas.current.offsetLeft +
                canvas.current.offsetParent.offsetParent.offsetLeft +
                35 -
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
            <ProgressBar progress={leftCount} />
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

  background: rgba(242, 65, 57, 0.5);
`;
