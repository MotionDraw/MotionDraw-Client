import React from "react";
import styled from "styled-components";
import { useCursorDisappearCount } from "../hooks/useCursorDisappearCount";

export default function OtherCursor({ cursor, canvas }) {
  const cursorDisappearCount = useCursorDisappearCount(5, cursor);

  return (
    <>
      {cursorDisappearCount > 0 && (
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
          Others
        </RightCursor>
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
  background-color: rgba(100, 65, 30, 0.3);
`;
