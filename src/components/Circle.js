import styled, { keyframes, css } from "styled-components";
import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { PAPER_CANVAS_WIDTH } from "../constants/canvasConfig";
import { setRightCount } from "../features/history/cursorSlice";

export default function Circle({ color, onClick, selectedColor }) {
  const circleRef = useRef(null);
  const dispatch = useDispatch();
  const rightHandCursor = useSelector((state) => state.cursor.rightHand);
  const [count, setCount] = useState(0);

  function changeColorHandler(color) {
    onClick(color);
  }

  function isInsideCircle(x, y) {
    const circle = circleRef.current;

    if (circle) {
      const circleTop = circle.offsetTop;
      const circleLeft = circle.offsetParent.offsetLeft;
      const circleHeight = circle.clientHeight + circle.clientTop * 2;

      if (
        x >= circleLeft &&
        x <= 900 - 10 &&
        y >= circleTop &&
        y <= circleTop + circleHeight
      ) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    if (
      isInsideCircle(PAPER_CANVAS_WIDTH - rightHandCursor.x, rightHandCursor.y)
    ) {
      setCount(count + 1);
      dispatch(setRightCount(count));
    } else {
      setCount(0);
    }

    if (count > 30) {
      onClick(color);
      setCount(0);
    }
  }, [rightHandCursor]);

  return (
    <CircleStyle
      ref={circleRef}
      color={color}
      onClick={() => changeColorHandler(color)}
      selectedColor={selectedColor}
    />
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
`;

const CircleStyle = styled.div`
  margin: 5px;
  width: 55px;
  height: 55px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  opacity: 0.3;
  animation: ${(props) =>
    props.selectedColor === props.color &&
    css`
      ${fadeIn} 0.5s linear 0s forwards
    `};
  border: 5px solid rgb(255, 255, 255);
  cursor: pointer;
`;
