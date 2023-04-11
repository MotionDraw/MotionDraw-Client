import { useEffect, useRef, useState } from "react";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawLine } from "../utils/drawLine";
import styled from "styled-components";
import { drawCursor } from "../utils/drawCursor";
import { prevColor } from "../utils/toolHand";

export default function Room() {
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const paperCanvasRef = useRef(null);
  const cursorCanvasRef = useRef(null);
  const [gestureRecognizer, setGestureRecognizer] = useState();

  useEffect(() => {
    async function getUserCamera() {
      let stream = null;

      try {
        const video = videoRef.current;

        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        video.srcObject = stream;

        video.play();
      } catch (error) {
        console.log(error);
      }
    }

    getUserCamera();
  }, [videoRef]);

  useEffect(() => {
    async function run() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const result = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
        numHands: 2,
      });

      setGestureRecognizer(result);
    }

    run();
  }, []);

  useEffect(() => {
    const videoCtx = videoCanvasRef.current.getContext("2d");
    const paperCtx = paperCanvasRef.current.getContext("2d");
    const cursorCtx = cursorCanvasRef.current.getContext("2d");

    function renderLoop() {
      if (!gestureRecognizer) return;

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
          drawLine(
            gestureRecognitionResult,
            paperCtx,
            gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height
          );
          drawCursor(
            gestureRecognitionResult,
            cursorCtx,
            gestureRecognitionResult.landmarks[0][8].x *
              paperCanvasRef.current.width,
            gestureRecognitionResult.landmarks[0][8].y *
              paperCanvasRef.current.height
          );
        }

        videoCtx.restore();
      }
      requestAnimationFrame(renderLoop);
    }

    const id = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(id);
    };
  }, [gestureRecognizer]);

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
        <div>Draw</div>
        <div position="relative">
          <Video ref={videoRef} autoPlay />
          <VideoCanvas ref={videoCanvasRef} />
        </div>
      </LeftContainer>
      <RightContainer>
        <Paper></Paper>
        <PaperCanvas ref={paperCanvasRef} />
        <PaperCanvas ref={cursorCanvasRef} />
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
  width: 960px;
  height: 540px;
  transform: rotateY(180deg);
`;
const ToolBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
