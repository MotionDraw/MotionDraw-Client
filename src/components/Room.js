import styled from "styled-components";
import Modal from "./Modal";
import { useEffect, useRef, useState } from "react";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawLine } from "../utils/drawLine";
import modelAssetPath from "../assets/gesture_recognizer.task";
import { drawCursor } from "../utils/drawCursor";
import { useParams } from "react-router-dom";
import {
  changeColor,
  changeNextColor,
  changePrevColor,
  decreasesLineWidth,
  increasesLineWidth,
} from "../utils/toolHand";
import {
  CANVAS_HEIGHT_OFFSET,
  MAX_THICKNESS,
  MIN_THICKNESS,
  PAPER_CANVAS_HEIGHT,
  PAPER_CANVAS_HEIGHT_PX,
  PAPER_CANVAS_WIDTH,
  PAPER_CANVAS_WIDTH_PX,
  THICKNESS,
} from "../constants/canvasConfig";
import { socket } from "./App";
import { useDispatch, useSelector } from "react-redux";
import { pushHistory, setHistory } from "../features/history/historySlice";
import { setLeftCount } from "../features/history/cursorSlice";
import {
  drawStraightLine,
  drawRectangle,
  drawCircle,
} from "../utils/drawShape";
import {
  setLeftCursorPosition,
  setRightCursorPosition,
} from "../features/history/cursorSlice";
import DisplayMyCursor from "./DisplayMyCursor";
import DisplayOtherCursors from "./DisplayOtherCursors";
import ColorCircle from "./ColorCircle";

export default function Room() {
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const paperCanvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const requestRef = useRef(null);
  const cleanupCalled = useRef(false);
  const { roomName } = useParams();
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [mode, setMode] = useState("Move");
  const [shape, setShape] = useState("");
  const [lineWidth, setLineWidth] = useState(2);
  const [initCanvas, setInitCanvas] = useState([]);
  const [isInitCanvas, setIsInitCanvas] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShapeReady, setIsShapeReady] = useState(false);
  const historyData = useSelector((state) => state.history.history);
  const dispatch = useDispatch();

  function modalOpenHandler() {
    setIsModalOpen(true);
  }

  function modalCloseHandler() {
    setIsModalOpen(false);
  }

  function changeColorHandler(color) {
    changeColor(color);
    setSelectedColor(color);
  }

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
    const preiviewCtx = previewCanvasRef.current.getContext("2d");

    function renderLoop() {
      preiviewCtx.clearRect(0, 0, PAPER_CANVAS_WIDTH, PAPER_CANVAS_HEIGHT);

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
          const rightHandXPosition =
            gestureRecognitionResult.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            gestureRecognitionResult.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          for (const landmarks of gestureRecognitionResult.landmarks) {
            drawConnectors(videoCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 2,
            });
            drawLandmarks(videoCtx, landmarks, {
              color: "#FF0000",
              radius: 2,
            });
          }

          drawCursor(
            gestureRecognitionResult,
            cursorCtx,
            rightHandXPosition,
            rightHandYPosition,
            selectedColor,
            lineWidth,
            mode
          );
        }

        if (
          gestureRecognitionResult.handednesses.length === 1 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Left"
        ) {
          const rightHandXPosition =
            gestureRecognitionResult.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            gestureRecognitionResult.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

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
              x: rightHandXPosition,
              y: rightHandYPosition,
              selectedColor: selectedColor,
              lineWidth: lineWidth,
              mode: mode,
              socketId: socket.id,
            })
          );

          dispatch(
            setRightCursorPosition({
              x: rightHandXPosition,
              y: rightHandYPosition,
            })
          );

          socket.emit("drawLine", roomName, {
            result: gestureRecognitionResult,
            x: rightHandXPosition,
            y: rightHandYPosition,
            selectedColor: selectedColor,
            lineWidth: lineWidth,
            mode: mode,
            socketId: socket.id,
          });

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            rightHandXPosition,
            rightHandYPosition,
            selectedColor,
            lineWidth,
            mode,
            socket.id
          );
        } else if (
          gestureRecognitionResult.handednesses.length === 1 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Right"
        ) {
          const leftHandXPosition =
            gestureRecognitionResult.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const leftHandYPosition =
            gestureRecognitionResult.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Thumb_Up"
          ) {
            changeNextColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Thumb_Down"
          ) {
            changePrevColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth(dispatch) && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Closed_Fist"
          ) {
            if (decreasesLineWidth(dispatch) && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "ILoveYou"
          ) {
            setMode("Shape");
          } else {
            dispatch(setLeftCount(0));
          }

          dispatch(
            setLeftCursorPosition({
              x: leftHandXPosition,
              y: leftHandYPosition,
            })
          );
        } else if (
          gestureRecognitionResult.handednesses.length === 2 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Left"
        ) {
          const leftHandXPosition =
            gestureRecognitionResult.landmarks[1][8].x *
            paperCanvasRef.current.width;
          const leftHandYPosition =
            gestureRecognitionResult.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            gestureRecognitionResult.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            gestureRecognitionResult.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            setMode("Move");
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            setMode("Shape");
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
            changeNextColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName ===
            "Thumb_Down"
          ) {
            changePrevColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth(dispatch) && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[1][0].categoryName ===
            "Closed_Fist"
          ) {
            if (decreasesLineWidth(dispatch) && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          } else {
            dispatch(setLeftCount(0));
          }

          if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "ILoveYou" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            drawStraightLine(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              lineWidth,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("StraightLine");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "Victory" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            drawRectangle(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              lineWidth,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("Rectangle");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "Pointing_Up" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            drawCircle(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("Circle");
          }

          if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "Open_Palm" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            setIsShapeReady(true);
            if (shape === "StraightLine") {
              drawStraightLine(
                paperCtx,
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition,
                rightHandYPosition,
                lineWidth,
                isShapeReady
              );
            } else if (shape === "Rectangle") {
              drawRectangle(
                paperCtx,
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition,
                rightHandYPosition,
                lineWidth,
                isShapeReady
              );
            } else if (shape === "Circle") {
              drawCircle(
                paperCtx,
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition,
                rightHandYPosition,
                isShapeReady
              );
            }
          }

          dispatch(
            setLeftCursorPosition({
              x: leftHandXPosition,
              y: leftHandYPosition,
            })
          );

          dispatch(
            setRightCursorPosition({
              x: rightHandXPosition,
              y: rightHandYPosition,
            })
          );

          dispatch(
            pushHistory({
              result: gestureRecognitionResult,
              x: rightHandXPosition,
              y: rightHandYPosition,
              selectedColor: selectedColor,
              lineWidth: lineWidth,
              mode: mode,
              socketId: socket.id,
            })
          );

          socket.emit("drawLine", roomName, {
            result: gestureRecognitionResult,
            x: leftHandXPosition,
            y: leftHandYPosition,
            selectedColor: selectedColor,
            lineWidth: lineWidth,
            mode: mode,
            socketId: socket.id,
          });

          if (
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          )
            return;

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            rightHandXPosition,
            rightHandYPosition,
            selectedColor,
            lineWidth,
            mode,
            socket.id
          );
        } else if (
          gestureRecognitionResult.handednesses.length === 2 &&
          gestureRecognitionResult.handednesses[0][0].categoryName === "Right"
        ) {
          const leftHandXPosition =
            gestureRecognitionResult.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const leftHandYPosition =
            gestureRecognitionResult.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            gestureRecognitionResult.landmarks[1][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            gestureRecognitionResult.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            gestureRecognitionResult.gestures[1][0].categoryName === "Open_Palm"
          ) {
            setMode("Move");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "ILoveYou"
          ) {
            setMode("Shape");
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
            changeNextColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Thumb_Down"
          ) {
            changePrevColor(setSelectedColor, dispatch);
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName === "Open_Palm"
          ) {
            if (increasesLineWidth(dispatch) && lineWidth < MAX_THICKNESS) {
              setLineWidth(lineWidth + THICKNESS);
            }
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
            "Closed_Fist"
          ) {
            if (increasesLineWidth(dispatch) && lineWidth > MIN_THICKNESS) {
              setLineWidth(lineWidth - THICKNESS);
            }
          } else {
            dispatch(setLeftCount(0));
          }

          if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "ILoveYou" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "ILoveYou"
          ) {
            drawStraightLine(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              lineWidth,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("StraightLine");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "ILoveYou" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "Victory"
          ) {
            drawRectangle(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              lineWidth,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("Rectangle");
          } else if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "ILoveYou" &&
            gestureRecognitionResult.gestures[1][0].categoryName ===
              "Pointing_Up"
          ) {
            drawCircle(
              preiviewCtx,
              leftHandXPosition,
              leftHandYPosition,
              rightHandXPosition,
              rightHandYPosition,
              "Preview"
            );
            setIsShapeReady(false);
            setShape("Circle");
          }

          if (
            gestureRecognitionResult.gestures[0][0].categoryName ===
              "ILoveYou" &&
            gestureRecognitionResult.gestures[1][0].categoryName === "Open_Palm"
          ) {
            setIsShapeReady(true);
            if (shape === "StraightLine") {
              drawStraightLine(
                paperCtx,
                rightHandXPosition,
                rightHandYPosition,
                leftHandXPosition,
                leftHandYPosition,
                lineWidth,
                isShapeReady
              );
            } else if (shape === "Rectangle") {
              drawRectangle(
                paperCtx,
                rightHandXPosition,
                rightHandYPosition,
                leftHandXPosition,
                leftHandYPosition,
                lineWidth,
                isShapeReady
              );
            } else if (shape === "Circle") {
              drawCircle(
                paperCtx,
                rightHandXPosition,
                rightHandYPosition,
                leftHandXPosition,
                leftHandYPosition,
                isShapeReady
              );
            }
          }

          dispatch(
            setLeftCursorPosition({
              x: leftHandXPosition,
              y: leftHandYPosition,
            })
          );

          dispatch(
            setRightCursorPosition({
              x: rightHandXPosition,
              y: rightHandYPosition,
            })
          );

          dispatch(
            pushHistory({
              result: gestureRecognitionResult,
              x: rightHandXPosition,
              y: rightHandYPosition,
              selectedColor: selectedColor,
              lineWidth: lineWidth,
              mode: mode,
              socketId: socket.id,
            })
          );

          socket.emit("drawLine", roomName, {
            result: gestureRecognitionResult,
            x: rightHandXPosition,
            y: rightHandYPosition,
            selectedColor: selectedColor,
            lineWidth: lineWidth,
            mode: mode,
            socketId: socket.id,
          });

          if (
            gestureRecognitionResult.gestures[0][0].categoryName === "ILoveYou"
          )
            return;

          drawLine(
            gestureRecognitionResult,
            paperCtx,
            rightHandXPosition,
            rightHandYPosition,
            selectedColor,
            lineWidth,
            mode,
            socket.id
          );
        }
        videoCtx.restore();
      }
      requestRef.current = requestAnimationFrame(renderLoop);
    }

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [
    gestureRecognizer,
    selectedColor,
    mode,
    lineWidth,
    isShapeReady,
    roomName,
    shape,
    dispatch,
  ]);

  useEffect(() => {
    if (isInitCanvas) {
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
    let state = "";

    ctx.clearRect(
      0,
      0,
      paperCanvasRef.current.width,
      paperCanvasRef.current.height
    );

    for (let i = 0; i < initCanvas.length; i += 1) {
      if (
        initCanvas[i].result.handednesses.length === 1 &&
        initCanvas[i].result.handednesses[0][0].categoryName === "Left"
      ) {
        drawLine(
          initCanvas[i].result,
          ctx,
          initCanvas[i].x,
          initCanvas[i].y,
          initCanvas[i].selectedColor,
          initCanvas[i].lineWidth,
          initCanvas[i].mode,
          initCanvas[i].socketId
        );
      } else if (initCanvas[i].result.handednesses.length === 2) {
        if (initCanvas[i].result.handednesses[0][0].categoryName === "Left") {
          const leftHandXPosition =
            initCanvas[i].result.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const leftHandYPosition =
            initCanvas[i].result.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            initCanvas[i].result.landmarks[1][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            initCanvas[i].result.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            initCanvas[i].result.gestures[0][0].categoryName === "ILoveYou" &&
            initCanvas[i].result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Straight";
          } else if (
            initCanvas[i].result.gestures[0][0].categoryName ===
              "Pointing_Up" &&
            initCanvas[i].result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Circle";
          } else if (
            initCanvas[i].result.gestures[0][0].categoryName === "Victory" &&
            initCanvas[i].result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Rectangle";
          }

          if (
            initCanvas[i].result.gestures[0][0].categoryName === "Open_Palm" &&
            initCanvas[i].result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            if (state === "Straight") {
              ctx.beginPath();
              ctx.lineTo(leftHandXPosition, leftHandYPosition);
              ctx.lineTo(rightHandXPosition, rightHandYPosition);
              ctx.stroke();

              state = "";
            } else if (state === "Rectangle") {
              ctx.beginPath();
              ctx.rect(
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition - leftHandXPosition,
                rightHandYPosition - leftHandYPosition
              );
              ctx.stroke();

              state = "";
            } else if (state === "Circle") {
              const radiusX = Math.abs(leftHandXPosition - rightHandXPosition);
              const radiusY = Math.abs(leftHandYPosition - rightHandYPosition);
              const radius =
                Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2)) / 2;

              ctx.beginPath();
              ctx.arc(
                (leftHandXPosition + rightHandXPosition) / 2,
                (leftHandYPosition + rightHandYPosition) / 2,
                radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();

              state = "";
            }

            drawLine(
              initCanvas[i].result,
              ctx,
              initCanvas[i].x,
              initCanvas[i].y,
              initCanvas[i].selectedColor,
              initCanvas[i].lineWidth,
              initCanvas[i].mode,
              initCanvas[i].socketId
            );
          } else if (
            initCanvas[i].result.handednesses[0][0].categoryName === "Right"
          ) {
            drawLine(
              initCanvas[i].result,
              ctx,
              initCanvas[i].x,
              initCanvas[i].y,
              initCanvas[i].selectedColor,
              initCanvas[i].lineWidth,
              initCanvas[i].mode,
              initCanvas[i].socketId
            );
          }
        } else if (
          initCanvas[i].result.handednesses[0][0].categoryName === "Right"
        ) {
          const leftHandXPosition =
            initCanvas[i].result.landmarks[1][8].x *
            paperCanvasRef.current.width;
          const leftHandYPosition =
            initCanvas[i].result.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            initCanvas[i].result.landmarks[0][8].x *
            paperCanvasRef.current.width;
          const rightHandYPosition =
            initCanvas[i].result.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            initCanvas[i].result.gestures[1][0].categoryName === "ILoveYou" &&
            initCanvas[i].result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Straight";
          } else if (
            initCanvas[i].result.gestures[1][0].categoryName ===
              "Pointing_Up" &&
            initCanvas[i].result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Circle";
          } else if (
            initCanvas[i].result.gestures[1][0].categoryName === "Victory" &&
            initCanvas[i].result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Rectangle";
          }

          if (
            initCanvas[i].result.gestures[1][0].categoryName === "Open_Palm" &&
            initCanvas[i].result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            if (state === "Straight") {
              ctx.beginPath();
              ctx.lineTo(leftHandXPosition, leftHandYPosition);
              ctx.lineTo(rightHandXPosition, rightHandYPosition);
              ctx.stroke();

              state = "";
            } else if (state === "Rectangle") {
              ctx.beginPath();
              ctx.rect(
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition - leftHandXPosition,
                rightHandYPosition - leftHandYPosition
              );
              ctx.stroke();

              state = "";
            } else if (state === "Circle") {
              const radiusX = Math.abs(leftHandXPosition - rightHandXPosition);
              const radiusY = Math.abs(leftHandYPosition - rightHandYPosition);
              const radius =
                Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2)) / 2;

              ctx.beginPath();
              ctx.arc(
                (leftHandXPosition + rightHandXPosition) / 2,
                (leftHandYPosition + rightHandYPosition) / 2,
                radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();

              state = "";
            }

            drawLine(
              initCanvas[i].result,
              ctx,
              initCanvas[i].x,
              initCanvas[i].y,
              initCanvas[i].selectedColor,
              initCanvas[i].lineWidth,
              initCanvas[i].mode,
              initCanvas[i].socketId
            );
          } else if (
            initCanvas[i].result.handednesses[0][0].categoryName === "Right"
          ) {
            drawLine(
              initCanvas[i].result,
              ctx,
              initCanvas[i].x,
              initCanvas[i].y,
              initCanvas[i].selectedColor,
              initCanvas[i].lineWidth,
              initCanvas[i].mode,
              initCanvas[i].socketId
            );
          }
        }
      }
    }
  }, [initCanvas]);

  useEffect(() => {
    const ctx = paperCanvasRef.current.getContext("2d");
    let state = "";

    socket.on("draw", (data) => {
      dispatch(pushHistory(data));
      if (
        data.result.handednesses.length === 1 &&
        data.result.handednesses[0][0].categoryName === "Left"
      ) {
        drawLine(
          data.result,
          ctx,
          data.x,
          data.y,
          data.selectedColor,
          data.lineWidth,
          data.mode,
          data.socketId
        );
      } else if (data.result.handednesses.length === 2) {
        if (data.result.handednesses[0][0].categoryName === "Left") {
          const leftHandXPosition =
            data.result.landmarks[0][8].x * paperCanvasRef.current.width;
          const leftHandYPosition =
            data.result.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            data.result.landmarks[1][8].x * paperCanvasRef.current.width;
          const rightHandYPosition =
            data.result.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            data.result.gestures[0][0].categoryName === "ILoveYou" &&
            data.result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Straight";
          } else if (
            data.result.gestures[0][0].categoryName === "Pointing_Up" &&
            data.result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Circle";
          } else if (
            data.result.gestures[0][0].categoryName === "Victory" &&
            data.result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            state = "Rectangle";
          }

          if (
            data.result.gestures[0][0].categoryName === "Open_Palm" &&
            data.result.gestures[1][0].categoryName === "ILoveYou"
          ) {
            if (state === "Straight") {
              ctx.beginPath();
              ctx.lineTo(leftHandXPosition, leftHandYPosition);
              ctx.lineTo(rightHandXPosition, rightHandYPosition);
              ctx.stroke();

              state = "";
            } else if (state === "Rectangle") {
              ctx.beginPath();
              ctx.rect(
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition - leftHandXPosition,
                rightHandYPosition - leftHandYPosition
              );
              ctx.stroke();

              state = "";
            } else if (state === "Circle") {
              const radiusX = Math.abs(leftHandXPosition - rightHandXPosition);
              const radiusY = Math.abs(leftHandYPosition - rightHandYPosition);
              const radius =
                Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2)) / 2;

              ctx.beginPath();
              ctx.arc(
                (leftHandXPosition + rightHandXPosition) / 2,
                (leftHandYPosition + rightHandYPosition) / 2,
                radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();

              state = "";
            }

            drawLine(
              data.result,
              ctx,
              data.x,
              data.y,
              data.selectedColor,
              data.lineWidth,
              data.mode,
              data.socketId
            );
          } else if (data.result.handednesses[0][0].categoryName === "Right") {
            drawLine(
              data.result,
              ctx,
              data.x,
              data.y,
              data.selectedColor,
              data.lineWidth,
              data.mode,
              data.socketId
            );
          }
        } else if (data.result.handednesses[0][0].categoryName === "Right") {
          const leftHandXPosition =
            data.result.landmarks[1][8].x * paperCanvasRef.current.width;
          const leftHandYPosition =
            data.result.landmarks[1][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;
          const rightHandXPosition =
            data.result.landmarks[0][8].x * paperCanvasRef.current.width;
          const rightHandYPosition =
            data.result.landmarks[0][8].y *
            paperCanvasRef.current.height *
            CANVAS_HEIGHT_OFFSET;

          if (
            data.result.gestures[1][0].categoryName === "ILoveYou" &&
            data.result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Straight";
          } else if (
            data.result.gestures[1][0].categoryName === "Pointing_Up" &&
            data.result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Circle";
          } else if (
            data.result.gestures[1][0].categoryName === "Victory" &&
            data.result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            state = "Rectangle";
          }

          if (
            data.result.gestures[1][0].categoryName === "Open_Palm" &&
            data.result.gestures[0][0].categoryName === "ILoveYou"
          ) {
            if (state === "Straight") {
              ctx.beginPath();
              ctx.lineTo(leftHandXPosition, leftHandYPosition);
              ctx.lineTo(rightHandXPosition, rightHandYPosition);
              ctx.stroke();

              state = "";
            } else if (state === "Rectangle") {
              ctx.beginPath();
              ctx.rect(
                leftHandXPosition,
                leftHandYPosition,
                rightHandXPosition - leftHandXPosition,
                rightHandYPosition - leftHandYPosition
              );
              ctx.stroke();

              state = "";
            } else if (state === "Circle") {
              const radiusX = Math.abs(leftHandXPosition - rightHandXPosition);
              const radiusY = Math.abs(leftHandYPosition - rightHandYPosition);
              const radius =
                Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2)) / 2;

              ctx.beginPath();
              ctx.arc(
                (leftHandXPosition + rightHandXPosition) / 2,
                (leftHandYPosition + rightHandYPosition) / 2,
                radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();

              state = "";
            }

            drawLine(
              data.result,
              ctx,
              data.x,
              data.y,
              data.selectedColor,
              data.lineWidth,
              data.mode,
              data.socketId
            );
          } else if (data.result.handednesses[0][0].categoryName === "Right") {
            drawLine(
              data.result,
              ctx,
              data.x,
              data.y,
              data.selectedColor,
              data.lineWidth,
              data.mode,
              data.socketId
            );
          }
        }
      }
    });

    return () => {
      socket.off("draw");
    };
  }, [paperCanvasRef, dispatch]);

  return (
    <Wrapper>
      <DisplayMyCursor roomName={roomName} canvas={paperCanvasRef} />
      <DisplayOtherCursors canvas={paperCanvasRef} />
      <ShowModalButton onClick={modalOpenHandler}>?</ShowModalButton>
      {isModalOpen && <Modal modalCloseHandler={modalCloseHandler} />}
      <LeftContainer>
        <div style={{ fontSize: "7rem", fontWeight: "800" }}>{mode}</div>
        <LineWidthContainer>
          <div>Line : {lineWidth}px</div>
          <LineWidthSlider
            style={{ backgroundColor: "orange" }}
            type="range"
            min={MIN_THICKNESS}
            max={MAX_THICKNESS}
            color="gray"
            step={1}
            value={lineWidth}
            onChange={(e) => {
              setLineWidth(e.target.valueAsNumber);
            }}
            list="markers"
          />
          <DataList id="markers">
            <option value="1" label="1"></option>
            <option value="2" label="2"></option>
            <option value="3" label="3"></option>
            <option value="4" label="4"></option>
            <option value="5" label="5"></option>
            <option value="6" label="6"></option>
            <option value="7" label="7"></option>
            <option value="8" label="8"></option>
          </DataList>
        </LineWidthContainer>
        <VideoContainer>
          <Video ref={videoRef} autoPlay />
          <VideoCanvas ref={videoCanvasRef} />
        </VideoContainer>
      </LeftContainer>
      <RightContainer>
        <PaperContainer>
          <Paper width={PAPER_CANVAS_WIDTH_PX} height={PAPER_CANVAS_HEIGHT_PX}>
            <ToolBox>
              <ColorCircle
                color="black"
                onClick={() => changeColorHandler("black")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="red"
                onClick={() => changeColorHandler("red")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="orange"
                onClick={() => changeColorHandler("orange")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="yellow"
                onClick={() => changeColorHandler("yellow")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="green"
                onClick={() => changeColorHandler("green")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="blue"
                onClick={() => changeColorHandler("blue")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="navy"
                onClick={() => changeColorHandler("navy")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
              <ColorCircle
                color="purple"
                onClick={() => changeColorHandler("purple")}
                selectedColor={selectedColor}
                dispatch={dispatch}
              />
            </ToolBox>
          </Paper>
          <PaperCanvas
            ref={paperCanvasRef}
            width={PAPER_CANVAS_WIDTH_PX}
            height={PAPER_CANVAS_HEIGHT_PX}
          />
          <PaperCanvas
            ref={cursorCanvasRef}
            width={PAPER_CANVAS_WIDTH_PX}
            height={PAPER_CANVAS_HEIGHT_PX}
          />
          <PaperCanvas
            ref={previewCanvasRef}
            width={PAPER_CANVAS_WIDTH_PX}
            height={PAPER_CANVAS_HEIGHT_PX}
          />
        </PaperContainer>
      </RightContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding-top: 50px;
  display: flex;
  height: 100vh;
  width: 100vw;
  font-size: 10em;
  background-color: #fee4b3;
  overflow: hidden;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  font-size: 3rem;
  font-weight: 800;
  width: 30vw;
  height: 800px;
  color: rgb(242, 65, 57);

  div {
    margin-bottom: 2.5rem;
  }
`;

const RightContainer = styled.div`
  position: relative;
  width: 70vw;
  height: 100vh;
  padding: 0 50px;
`;

const LineWidthContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const VideoContainer = styled.div`
  position: relative;
`;

const PaperContainer = styled.div`
  position: absolute;
`;

const LineWidthSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  background-color: rgb(60, 179, 113);
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background-color: rgb(242, 65, 57);
    transform: translateY(-25%);
    cursor: pointer;
  }
`;

const DataList = styled.datalist`
  display: flex;
  font-size: 20px;
  justify-content: space-between;
  padding-top: 10px;
  width: 350px;
`;

const Video = styled.video`
  position: absolute;
  left: 50%;
  z-index: 9;
  width: 320px;
  height: 240px;
  transform: translateX(-50%) rotateY(180deg);
`;

const VideoCanvas = styled.canvas`
  position: absolute;
  left: 50%;
  z-index: 9;
  width: 320px;
  height: 240px;
  transform: translateX(-50%) rotateY(180deg);
`;

const Paper = styled.div`
  position: absolute;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: white;
  box-shadow: 10px 10px grey;
`;

const PaperCanvas = styled.canvas`
  position: absolute;
  z-index: 9;
  transform: rotateY(180deg);
`;

const ToolBox = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  right: 10px;
  z-index: 10;
`;

const ShowModalButton = styled.button`
  position: absolute;
  height: 50px;
  width: 50px;
  font-size: 20px;
  right: 10px;
  bottom: 10px;
  border: none;
  z-index: 999;
  border-radius: 50%;
  color: rgb(255, 255, 255);
  background-color: rgb(242, 65, 57);
  cursor: pointer;
`;
