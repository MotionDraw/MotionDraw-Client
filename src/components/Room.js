import styled from "styled-components";

export default function Room() {
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
        <div>
          <video
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 320,
              height: 240,
            }}
            autoPlay
          />
          <canvas
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 320,
              height: 240,
            }}
          />
        </div>
      </LeftContainer>
      <RightContainer>
        <Paper></Paper>
        <canvas
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            zindex: 9,
            width: 960,
            height: 540,
          }}
        />
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

const ToolBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Paper = styled.div`
  position: relative;
  width: 960px;
  height: 540px;
  background-color: white;
  box-shadow: 10px 10px grey;
`;
