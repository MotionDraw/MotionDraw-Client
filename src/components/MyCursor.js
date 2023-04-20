import { useSelector } from "react-redux";
import styled from "styled-components";

export default function MyCursor({ canvas }) {
  const cursor = useSelector((state) => state.cursor);
  const count = useSelector((state) => state.cursor.count);

  return (
    <>
      <RightCursor
        left={
          canvas.current &&
          canvas.current.width -
            cursor.rightHand.x +
            canvas.current.offsetLeft +
            canvas.current.offsetParent.offsetLeft +
            5
        }
        top={
          canvas.current &&
          cursor.rightHand.y +
            canvas.current.offsetTop +
            canvas.current.offsetParent.offsetTop +
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
            canvas.current.offsetParent.offsetLeft +
            5
        }
        top={
          canvas.current &&
          cursor.leftHand.y +
            canvas.current.offsetTop +
            canvas.current.offsetParent.offsetTop +
            5
        }
      >
        <ProgressBar progress={count} />
        LeftHand
      </LeftCursor>
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
  z-index: 999;

  text-align: center;
  font-size: 1rem;

  border: 1px solid black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-right-radius: 20px;

  background: rgba(0, 0, 0, 0.2);
`;

const LeftCursor = styled.div`
  position: absolute;
  width: 80px;
  height: 20px;
  padding: 5px;

  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  z-index: 999;

  text-align: center;
  font-size: 1rem;

  border: 1px solid black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 20px;
  border-color: black black black black;

  background: rgba(0, 0, 0, 0.2);
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

  background: blue;
`;
