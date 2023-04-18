import { useSelector } from "react-redux";
import styled from "styled-components";

export default function MyCursor({ canvas }) {
  const history = useSelector((state) => state.history.history);

  return (
    <Cursor
      left={
        history.length &&
        canvas.current &&
        canvas.current.width -
          history[history.length - 1].x +
          canvas.current.offsetLeft +
          canvas.current.offsetParent.offsetLeft +
          5
      }
      top={
        history.length &&
        canvas.current &&
        history[history.length - 1].y +
          canvas.current.offsetTop +
          canvas.current.offsetParent.offsetTop +
          5
      }
    >
      My
    </Cursor>
  );
}

const Cursor = styled.div`
  position: absolute;
  left: ${(props) => `${props.left}px`};
  top: ${(props) => `${props.top}px`};
  z-index: 999;

  font-size: 2rem;

  background: rgba(0, 0, 0, 0.2);
`;
