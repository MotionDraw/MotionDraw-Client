import { useState } from "react";
import { useEffect } from "react";
import { socket } from "./App";
import OtherCursor from "./OtherCursor";

export default function DisplayOtherCursors({ canvas }) {
  const [position, setPosition] = useState({});

  useEffect(() => {
    socket.on("cursorPosition", (socketId, data) => {
      setPosition({ ...position, [socketId]: data });
    });

    return () => {
      socket.off("cursorPosition");
    };
  }, [position]);

  return (
    <>
      {Object.values(position).length !== 0 &&
        Object.values(position).map((value, index) => {
          return <OtherCursor key={index} cursor={value} canvas={canvas} />;
        })}
    </>
  );
}
