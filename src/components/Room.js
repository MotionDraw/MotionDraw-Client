import { useEffect, useRef, useState } from "react";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawLine } from "../utils/drawLine";
import styled from "styled-components";
import modelAssetPath from "../assets/gesture_recognizer.task";
import { drawCursor } from "../utils/drawCursor";
import { useParams } from "react-router-dom";
import {
  changeNextColor,
  changePrevColor,
  decreasesLineWidth,
  increasesLineWidth,
} from "../utils/toolHand";
import {
  MAX_THICKNESS,
  MIN_THICKNESS,
  THICKNESS,
} from "../constants/canvasConfig";
import { socket } from "./App";
import { useDispatch, useSelector } from "react-redux";
import { pushHistory, setHistory } from "../features/history/historySlice";

export default function Room() {
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const paperCanvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const cleanupCalled = useRef(false);
  const { roomName } = useParams();
  const [gestureRecognizer, setGestureRecognizer] = useState();
  const [color, setColor] = useState("black");
  const [mode, setMode] = useState("Move");
  const [lineWidth, setLineWidth] = useState(2);
  const [initCanvas, setInitCanvas] = useState([]);
  const [isInitCanvas, setIsInitCanvas] = useState(false);
  const historyData = useSelector((state) => state.history.history);
  const dispatch = useDispatch();

  useEffect(() => {
    const video = videoRef.current;

    async function getUserCamera() {
      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        video.srcObject = stream;

        video.play();
      } catch (error) {
        console.log(error);
      }
    }

    getUserCamera();

    return () => {
      video.srcObject = null;
    };
  }, [videoRef]);

  useEffect(() => {
    return () => {
      if (!cleanupCalled.current) {
        cleanupCalled.current = true;
      } else {
        socket.emit("leaveRoom", roomName);
      }
    };
  }, [roomName]);

  useEffect(() => {
    async function run() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-9/wasm"
        );
        const result = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelAssetPath,
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        setGestureRecognizer(result);
      } catch (error) {
        console.log(error);
      }
    }

    run();
  }, []);

  useEffect(() => {
    if (!gestureRecognizer) return;
    const videoCtx = videoCanvasRef.current.getContext("2d");
    const paperCtx = paperCanvasRef.current.getContext("2d");
    const cursorCtx = cursorCanvasRef.current.getContext("2d");

    function renderLoop() {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const nowInMs = Date.now();
        const gestureRecognitionResult = gestureRecognizer.recognizeForVideo(
          videoRef.current,
          nowInMs
        );

        videoCtx.save();
        videoCtx.clearRect(0, 0, videoCanvasRef.width, videoCanvasRef.height);

        const videoWidth = videoRef.current.clientWidth;
        const videoHeight = videoRef.current.clientHeight;

        videoRef.current.width = videoWidth;
        videoRef.current.height = videoHeight;
        videoCanvasRef.current.width = videoWidth;
        videoCanvasRef.current.height = videoHeight;

        if (gestureRecognitionResult.landmarks.length > 0) {
          for (const landmarks of gestureRecognitionResult.landmarks) {
            drawConnectors(videoCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 1,
            });
            drawLandmarks(videoCtx, landmarks, {
              color: "#FF0000",
              lineWidth: 1,
            });
          }

          drawCursor(
            gestureRecognitionResult,
            cursorCtx,
            gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height,
            color,
            lineWidth,
            mode
          );
        }

        if (
          gestureRecognitionResult.handednesses.length === 1 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Left"
        ) {
          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            setMode("Move");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Victory"
          ) {
            setMode("Erase");
          } else {
            setMode("Draw");
          }

          dispatch(
            pushHistory({
              result: gestureRecognitionResult,
              x:
                gestureRecognitionResult.landmarks[0][8].x *
                paperCanvasRef.current.width,
              y:
                gestureRecognitionResult.landmarks[0][8].y *
                paperCanvasRef.current.height,
              color: color,
              lineWidth: lineWidth,
              mode: mode,
            })
          );

          socket.emit("drawLine", roomName, {
            result: gestureRecognitionResult,
            x:
              gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            y:
              gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height,
            color: color,
            lineWidth: lineWidth,
            mode: mode,
          });

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height,
            color,
            lineWidth,
            mode
          );
        } else if (
          gestureRecognitionResult.handednesses.length === 1 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Right"
        ) {
          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Thumb_Up"
          ) {
            changePrevColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Thumb_Down"
          ) {
            changeNextColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth() && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Closed_Fist"
          ) {
            if (decreasesLineWidth() && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          }
        } else if (
          gestureRecognitionResult.handednesses.length === 2 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Left"
        ) {
          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            setMode("Move");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Victory"
          ) {
            setMode("Erase");
          } else {
            setMode("Draw");
          }

          if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Thumb_Up"
          ) {
            changePrevColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName ===
            "Thumb_Down"
          ) {
            changeNextColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth() && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName ===
            "Closed_Fist"
          ) {
            if (decreasesLineWidth() && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          }

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height,
            color,
            lineWidth,
            mode
          );
        } else if (
          gestureRecognitionResult.handednesses.length === 2 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Right"
        ) {
          if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Open_Palm"
          ) {
            setMode("Move");
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Victory"
          ) {
            setMode("Erase");
          } else {
            setMode("Draw");
          }

          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Thumb_Up"
          ) {
            changePrevColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Thumb_Down"
          ) {
            changeNextColor(setColor);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth() && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Closed_Fist"
          ) {
            if (increasesLineWidth() && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          }

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            gestureRecognitionResult.landmarks[1][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[1][8].y *
              paperCanvasRef.current.height,
            color,
            lineWidth,
            mode
          );
        }

        videoCtx.restore();
      }
    }

    const id = setInterval(() => {
      renderLoop();
    }, 40);

    return () => {
      clearInterval(id);
    };
  }, [gestureRecognizer, color, mode, lineWidth]);

  useEffect(() => {
    if (isInitCanvas) {
      socket.off("requestData");
      return;
    }
    socket.emit("sendHistory", roomName);
  }, [isInitCanvas, roomName]);

  useEffect(() => {
    socket.on("requestData", (roomName) => {
      socket.emit("callbackData", roomName, historyData);
    });

    return () => {
      socket.off("requestData");
    };
  }, [historyData, roomName]);

  useEffect(() => {
    socket.on("initCanvas", (data) => {
      dispatch(setHistory(data));
      setInitCanvas(data);
      setIsInitCanvas(true);
    });
    return () => {
      socket.off("initCanvas");
      setIsInitCanvas(false);
    };
  }, [dispatch]);

  useEffect(() => {
    const ctx = paperCanvasRef.current.getContext("2d");

    for (let i = 0; i < initCanvas.length; i += 1) {
      drawLine(
        initCanvas[i].result,
        ctx,
        initCanvas[i].x,
        initCanvas[i].y,
        initCanvas[i].color,
        initCanvas[i].lineWidth,
        initCanvas[i].mode
      );
    }
  }, [initCanvas]);

  useEffect(() => {
    const ctx = paperCanvasRef.current.getContext("2d");

    socket.on("draw", (data) => {
      drawLine(
        data.result,
        ctx,
        data.x,
        data.y,
        data.color,
        data.lineWidth,
        data.mode
      );
    });
  }, []);

  return (
    <Wrapper>
      <LeftContainer>
        <ToolBox>
          <Circle diameter="10" color="red" />
          <Circle diameter="10" color="orange" />
          <Circle diameter="10" color="yellow" />
          <Circle diameter="10" color="blue" />
          <Circle diameter="10" color="green" />
          <Circle diameter="10" color="black" />
        </ToolBox>
        <div>{mode}</div>
        <div>{lineWidth}</div>
        <div position="relative">
          <Video ref={videoRef} autoPlay />
          <VideoCanvas ref={videoCanvasRef} />
        </div>
      </LeftContainer>
      <RightContainer>
        <Paper></Paper>
        <PaperCanvas ref={paperCanvasRef} width="960px" height="540px" />
        <PaperCanvas ref={cursorCanvasRef} width="960px" height="540px" />
      </RightContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  font-size: 10em;
  background-color: #fee4b3;
  overflow: hidden;
`;

const Circle = styled.div`
  margin: 10px;
  width: ${(props) => `${props.diameter}vh`};
  height: ${(props) => `${props.diameter}vh`};
  background-color: ${(props) => props.color};
  border-radius: 50%;
  border: 5px solid rgb(255, 255, 255);
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 30vw;
  height: 100vh;
`;

const RightContainer = styled.div`
  position: relative;
  width: 70vw;
  height: 100vh;
  padding: 50px;
`;

const Video = styled.video`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 9;
  width: 320px;
  height: 240px;
  transform: rotateY(180deg);
`;

const VideoCanvas = styled.canvas`
  position: absolute;
  left: 0;
  right: 0;
  z-index: 9;
  width: 320px;
  height: 240px;
  transform: rotateY(180deg);
`;

const Paper = styled.div`
  position: absolute;
  width: 960px;
  height: 540px;
  background-color: white;
  box-shadow: 10px 10px grey;
`;

const PaperCanvas = styled.canvas`
  position: absolute;
  top: 50;
  left: 50;
  z-index: 9;
  transform: rotateY(180deg);
`;
const ToolBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
