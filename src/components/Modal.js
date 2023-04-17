import styled from "styled-components";
import { useRef } from "react";

export default function Modal({ modalCloseHandler }) {
  const modalRef = useRef(null);

  function closeModal() {
    modalCloseHandler(false);
  }

  return (
    <ModalBackground>
      <ModalContainer ref={modalRef}>
        <CloseButton onClick={closeModal}>X</CloseButton>
        <ul>
          <li>손동작 종류</li>
        </ul>
        <GestureContainer>
          <figure>
            <Image src="/img/Open_Palm.png" />
            <figcaption>Open_Palm</figcaption>
          </figure>
          <figure>
            <Image src="/img/Closed_Fist.png" />
            <figcaption>Closed_Fist</figcaption>
          </figure>
          <figure>
            <Image src="/img/Pointing_Up.png" />
            <figcaption>Pointing_Up</figcaption>
          </figure>
          <figure>
            <Image src="/img/Thumb_Up.png" />
            <figcaption>Thumb_Up</figcaption>
          </figure>
          <figure>
            <Image src="/img/Thumb_Down.png" />
            <figcaption>Thumb_Down</figcaption>
          </figure>
          <figure>
            <Image src="/img/Victory.png" />
            <figcaption>Victory</figcaption>
          </figure>
          <figure>
            <Image src="/img/ILoveYou.png" />
            <figcaption>ILoveYou</figcaption>
          </figure>
        </GestureContainer>

        <ul>
          <li>왼손</li>
          <ol>
            <li>Open_Palm</li>
            <ul>
              <li>
                0.5초 동안 자세를 유지하면 선의 굵기/지우개 크기가 커집니다.
              </li>
            </ul>
            <li>Closed_Fist</li>
            <ul>
              <li>
                0.5초 동안 자세를 유지하면 선의 굵기/지우개 크기가 작아집니다.
              </li>
            </ul>
            <li>Thumb_Up</li>
            <ul>
              <li>2초 동안 자세를 유지하면 다음 색으로 변경됩니다.</li>
            </ul>
            <li>Thumb_Down</li>
            <ul>
              <li>2초 동안 자세를 유지하면 이전 색으로 변경됩니다.</li>
            </ul>
          </ol>

          <br />

          <li>오른손</li>
          <ol>
            <li>Open_Palm</li>
            <ul>
              <li>커서를 이동시키는 Move모드로 전환합니다.</li>
            </ul>
            <li>Open_Palm</li>
            <ul>
              <li>지울수 있는 Erase모드로 전환합니다.</li>
            </ul>
            <li>그 외</li>
            <ul>
              <li>선을 그리는 Draw모드로 전환합니다.</li>
            </ul>
          </ol>
        </ul>
      </ModalContainer>
    </ModalBackground>
  );
}

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 998;
  background: rgba(0, 0, 0, 0.3);
`;

const ModalContainer = styled.div`
  padding: 20px;
  width: 80%;
  height: 90%;

  z-index: 999;
  font-size: 50px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: white;
  border: 1px solid black;
  border-radius: 8px;

  overflow: scroll;
  overflow-x: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const GestureContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: 30px;
  text-align: center;
`;

const Image = styled.img`
  margin: 10px;
  height: 13vw;
  width: 13vw;
`;
