# Motion Draw

`Motion Draw`는 MediaPipe의 Gesture recognition을 사용하여 `손 모양을 인식`하고 그것을 바탕으로 그림판을 구현하여 `socket 통신`으로 다른 사용자와 `함께` `그림`을 그릴 수 있게 하는 프로젝트입니다.

# Deploy

모바일 불가합니다.
<br>
Chrome에서 동작 확인하였습니다.

- **[MotionDraw](https://www.motiondraw.xyz/)**

# 목차

- [Motion Draw](#motion-draw)
- [Deploy](#deploy)
- [Motivation](#motivation)
- [Challenges](#challenges)
  - [1. 어떻게 허공에서 손을 움직이는 것으로 그림을 그릴것인가?](#1-어떻게-허공에서-손을-움직이는-것으로-그림을-그릴것인가)
    - [1) 손 모양 인식 Library, tenserflow vs mediapipe](#1-손-모양-인식-library-tenserflow-vs-mediapipe)
    - [2) mediapipe의 출력값을 이용하여 canvas와 webcam과 동기화하기](#2-mediapipe의-출력값을-이용하여-canvas와-webcam과-동기화하기)
    - [3) 그리기 중 색변경, 굵기변경 시 그리고 있던 선도 영향을 받는 현상 처리는 어떻게 할 것인가?](#3-그리기-중-색변경-굵기변경-시-그리고-있던-선도-영향을-받는-현상-처리는-어떻게-할-것인가)
  - [2. 어떻게 여러명이서 그림을 그릴 수 있을까?](#2-어떻게-여러명이서-그림을-그릴-수-있을까)
    - [1) 어떤 방법으로 구현할 것인가?](#1-어떤-방법으로-구현할-것인가)
    - [2) 2명이서 동시에 그릴 때 서로의 선이 이어지는 경우](#2-2명이서-동시에-그릴-때-각-사용자의-선이-이어지는-경우)
    - [3) 그림을 그리고 있는 방에 입장시 어떻게 그리고 있던 그림을 불러올 것인가?](#3-그림을-그리고-있는-방-입장-시-어떻게-그리고-있던-그림을-불러올-것인가)
  - [3. UX 개선](#3-ux-개선)
    - [1) 일정 시간 후 커서 사라지게 만들기](#1-일정-시간-후-커서-사라지게-만들기)
    - [2) 마우스로 선굵기 조절 및 색 선택 기능](#2-마우스로-선굵기-조절-및-색-선택-기능)
    - [3) 모드 변경 및 색 변경 시 커서에 progress bar 구현](#3-모드-변경-및-색-변경-시-커서에-progress-bar-구현)
    - [4) 색상에 마우스 올릴 시 색 변경 기능](#4-색상에-마우스-올릴-시-색-변경-기능)
  - [4. 성능 개선 방향](#4-성능-개선-방향)
  	- [어떻게 해야 그림을 더 부드럽게 그릴 수 있을까?](#어떻게-해야-그림을-더-부드럽게-그릴-수-있을까)
- [Schedule](#schedule)
- [Tech Stacks](#tech-stacks)
- [Repository Link](#repository-link)
- [Member](#member)

# Motivation

마우스와 태블릿 PC와 같은 입력장치가 아닌 `웹캠`을 이용하여 "허공에 손짓으로 그림을 그리게 된다면 얼마나 편할까?" 라는 생각을 종종 하곤 했습니다. 그래서 이번 프로젝트에 위와 같은 생각을 구현할 방법으로 `딥러닝`을 떠올리게 되었고 조사하게 되었습니다.
그래서 프로젝트의 목표를 특정 손 모양을 웹캠에 인식시켜 허공에서 그림을 그리고 다른 사용자와 같이 즐길 수 있는 그림판을 구현하는 것이 되었습니다.

# Challenges

## 1. 어떻게 허공에서 손을 움직이는 것으로 그림을 그릴것인가?

### 1) 손 모양 인식 Library, tensorflow.js vs mediapipe


손 모양을 인식하려고 구분하려고 한다면 인공지능으로 학습된 모델을 가지고 있는 Library를 찾아야 했습니다. 조사 결과 tensorflow.js에 손모양 인식 라이브러리가 있었고 그것을 사용하여 개발을 진행하려고 하였습니다. 그런데 관련 깃허브에 `tensorflow.js`를 사용한 예가 있었고 `mediapipe`를 사용한 예가 있었습니다.

둘다 같은 동작을 하지만 두 가지를 비교하여 보니 `mediapipe`를 사용하는것이 `tensorflow.js`를 사용하는 것보다 제 프로젝트를 진행하는데 있어 더 빠른 성능을 보여주었기 때문에 `mediapipe`를 사용하게 되었습니다.

### 2) mediapipe의 출력값을 이용하여 canvas와 webcam과 동기화하기
> mediapipe의 4가지 출력값

mediapipe의 gestureRecognizer는 출력값으로 아래와 같은 4가지 속성을 가진 객체를 반환합니다.
- gestures : 어떤 손 모양인지 알려주는 배열
- handednesses : 왼손인지 오른손인지 알려주는 배열
- landmarks : 2D 공간에서 손을 21개의 좌표로 표현한 배열
- worldLandmarks : 3D 공간에서 손을 21개의 좌표로 표현한 배열

위 4가지 속성 중 worldLandmarks를 제외한 3가지 속성을 이용하여 웹상에 도형과 같은 그래픽적인 것을 표현할 때 쓰이는 HTML 태그인 `<canvas>`를 사용하여 기능을 구현하였습니다.

기능 중 그리기 기능을 구현하는 부분에서 어려웠던 점은 landmarks의 배열은 x와 y 좌표를 가지고 있는데 이 값은 0~1 사이의 값을 반환하는데 이 값을 사용하여 어떻게 canvas에 그림을 표현해야 하는지가 어려운 부분이었습니다.

> 손의 위치를 webcam에서 상대적으로 표현한 반환값, 0과 1

손을 움직이면서 1이라는 값이 웹캠에서의 width와 height의 값을 상대적으로 뜻한다는 것을 파악했습니다. 이 값에 canvas의 가로와 세로 길이를 곱하고 canvas 메서드를 사용하여 그리게 되면 canvas와 webcam의 손 위치가 `동기화`되는 것을 확인했고 문제를 해결했습니다.

### 3) 그리기 중 모드 변경 시 선 전체가 영향을 받는 문제 

> 그리기 중 색 변경, 굵기 변경 시 그리고 있는 선이 바뀌는 현상 발생

오른손에 그리기 모드와 왼손에 색 변경, 굵기 변경 기능을 구현 후 선을 그리면서 색을 바꿔보는 동작을 진행했습니다. 그리기 모드로 선을 그리는 중 색 변경이나 굵기 변경 기능을 사용하면 그리고 있던 선의 색과 굵기가 모두 바뀌는 현상이 있었습니다.

> 원인 분석

- 기존의 canvas 메서드인 lineTo 메서드를 이어나가는 방식이 문제
 
위 현상을 해결하기 위하여 원인을 분석해 보았습니다.
기존의 동작 방식은 `canvas API`의 시작점을 설정하는 `moveTo 메서드`로 시작하고 지정된 좌표로 선을 잇는 `lineTo 메서드`를 계속 호출하는 방식으로 선을 그었습니다. 이러한 동작 방식이 그림을 그리는 도중 선의 굵기나 색을 변경하게 되면 `moteTo 메서드`의 좌표부터 그림을 그리고 있는 `lineTo 메서드`의 좌표까지 영향을 미치게 된다는 것으로 파악하였습니다.

> 해결 방안

-  이전 좌표를 기억하고 `moveTo 메서드`와 `lineTo 메서드`를 반복하는 방식으로 해결

기존에 마우스로 그림판을 구현하는 로직은 위와 같은 작동 방식으로 하였지만, 그리는 동시에 굵기와 색을 조절하는 경우가 없어 위와 같은 현상이 있을 것이라 예상하지 못했습니다.
위와 같은 동작을 해결하기 위해 `moveTo 메서드`로 시작점을 찍고 `lineTo 메서드`로 선을 계속해서 잇는 방식이 아닌 손 모양을 인식하는 루프마다 좌표를 저장하고 이전좌표를 잇는 방식으로 변경하여 이 문제를 해결했습니다.

## 2. 어떻게 여러명이서 그림을 그릴 수 있을까?

### 1) socket.io를 사용한 멀티 구현

여려 명이 동시에 그림을 그리는 방법으로 최적화된 양방향 통신을 지원하는 `socket.io`를 사용하여 실시간으로 데이터를 주고받는 방식으로 구현하는 것을 목표로 했습니다.

> `broadcast 방식`으로 멀티 그림판 구현

웹캠으로 손 모양을 인식한 객체 데이터와 접속한 room의 방제목을 `socket.io`를 이용하여 서버로 보내고 서버에서 room에 접속한 모든 사용자에게 데이터를 보내는 `broadcast 방식`으로 객체 데이터를 보내는 방식으로 구현하였습니다. 그리고 받은 객체 데이터를 다시 방에 입장한 사용자의 canvas에 그리는 방식으로 `socket.io`를 사용한 멀티 그림판 구현을 완료하게 되었습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/bb566df8-f18a-42be-b084-e7f2fc8cf599"  width="400" height="300"/>

### 2) 2명이서 동시에 그릴 때 각 사용자의 선이 이어지는 경우

> 같은 함수 재사용으로 여려 명의 사용자 접속 시 발생하는 각 사용자의 커서에 선이 이어지는 현상 발생

`socket.io`를 이용하여 실시간 통신을 하여 그림을 그리는 것까지는 성공하였으나 여러 명의 사용자가 동시에 그림을 그리게 된다면 각 사용자의 커서가 선이 서로 이어지는 현상이 있었습니다.

> 원인 분석

1. lineTo 메소드 반복
2. 함수 재사용으로 인한 다른 사용자 좌표 기억

[1.3](#3-그리기-중-모드-변경-시-선-전체가-영향을-받는-문제)의 문제와 마찬가지로 `lineTo 메서드`를 반복하여 그림을 그리는 방식으로 동작하면서발생하는 문제였습니다. 그래서 이전 좌표를 기억하여 `moveTo`와 `lineTo` 메소드를 반복하여 그리는 방식으로 동작을 바꾸어 해결하려 했으나 이전 좌표가 공유되어 그림이 이상하게 그려지는 현상은 그대로였습니다. 이는 함수를 재활용하면서 사용하다 보니 다른 사용자의 좌표를 기억하여 발생하는 문제였습니다.

> 고려한 두 가지 방법

그래서 저는 해결할 수 있는 두 가지 방법을 생각했습니다.

1. 사용자 늘어날 때마다 canvas에 고유 id를 부여하여 겹치는 방식
- 장점 : 사용자가 늘어날때마다 id를 부여한 canvas를 늘리면 됨(구현 쉬움)
- 단점 : z-index 문제로 겹쳐 그리기, 상대방 그림 지우기 불가 / 여러 canvas사용
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/92308ca3-73cf-46ce-b2a4-c9778c90f981"  width="400" height="300"/>

2. 이전 좌표에 socket id를 기억하여 저장하는 방식
- 장점 : 한 canvas안에서 모든 사용자의 그리기, 지우기 해결 가능

```js
prevPosition = { ...prevPosition, [socketId]: { x, y } };
```

> 이전 좌표에 socket id를 기억하여 저장하는 방식 선택

첫 번째 방법은 각 canvas에 각 사용자가 할당되기 때문에 `canvas`의 우선순위인 `z-index`의 문제가 발생하여 그림을 서로 겹쳐 그릴 수 없거나 서로의 그림을 지울 수 없는 문제가 있었습니다. 그래서 한 canvas에 모든 문제를 해결해야 한다고 생각하고 두 번째 방법인 이전 좌표에 `socket id`를 기억하여 저장하는 방식으로 진행하는 방식이 단점없이 해결 가능하여 이 방법으로 해결했습니다.

### 3) 그림을 그리고 있는 방 입장 시 어떻게 그리고 있던 그림을 불러올 것인가?

> 준비/시작 기능 없는 자유로운 참가 방식 선택

처음에는 준비/시작 기능을 만들어 진행 중인 방에는 참가가 불가능하게 구현 예정이었습니다. 하지만 언제든지 그림을 그리고 있는 방에 자유롭게 접속하고 나갈 수 있게 구현하는 방식이 이 프로젝트에서 더 옳은 방향이라고 생각하였습니다. 그래서 진행 중인 방에 그림을 불러오게 할 방법을 고민했습니다.

> redux를 사용하여 방 입장 시 동기화 기능 구현 목표 설정

제가 생각한 방법은 `redux`를 사용하여 사용자가 그린 정보를 저장한 뒤 새로운 사용자가 들어오게 된다면 그 정보를 요청하고 전달받아 기존의 그림을 그려주는 방향으로 목표를 잡고 진행하였습니다.

> 고려해야 할 두 가지 문제

1. 누구의 정보를 가져와야 할까?
2. 어떻게 기존 함수 로직을 재활용하면서 구현?

이 부분에서 어려웠던 점은 같은 `socket.io`의 `room`에 있는 누구의 정보를 가져와야 하는지 문제가 되었고, `redux` 설계를 어떤 방식으로 해야지 기존의 함수를 재활용하면서 구현할 수 있을까에 대한 문제가 있었습니다. 그래서 저는 두 가지 방식의 해결 방안을 생각했습니다.

> 해결 방안

1. 가장 방에 오래 있었던 사용자의 그림 데이터를 요청하여 초기화하기
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/b85d323e-6590-4f5c-975a-d91ad93ce174"  width="400" height="600"/>

2. redux 데이터 구조를 사용자의 socket id마다 정보를 가지고 있는 방식

첫 번째 방식을 설명하자면 각 사용자의 행동과 다른 사용자들의 행동을 모두 `redux`에 저장합니다. 그리고 방에 사용자가 입장하게 되면 그 사용자는 첫 번째 사용자의 `redux` 데이터를 요청하면서 데이터를 저장하게 되고 순서대로 그림을 그려 `동기화`하는 방식입니다.

두 번째는 `redux`의 `데이터 구조`를 `socket id`마다 정보를 가지고 있는 방식으로 구현하려고 했습니다. 하지만 이 방식을 사용하면 그려진 시간이 알 수 없게 되어 원래의 그림 정보와 다르게 표시될 가능성이 있었습니다. 이를 방지하기 위하여 하나의 배열에 시간순으로 정보를 넣고 그 정보를 다시 함수를 재활용하여 그리는 첫 번째 방식으로 구현하였습니다.

## 3. UX 개선

### 1) 일정 시간 후 커서 사라지게 만들기
> 많은 커서 불편함 해소를 위한 5초 지나면 커서 사라지는 기능 구현

여러 명의 사용자가 방에 들어와서 그림을 그리게 되고 사용자가 많아지면 여러 개의 커서가 생기게 됩니다. 그렇게 되면 사용자가 잠시 그림을 그리는 것을 쉬게 되더라도 커서는 화면 위에 표시되게 됩니다. 그 부분이 사용자 입장에서 거슬릴 수 있는 부분이라 생각했기 때문에 움직임이 없는 상태로 5초가 지나게 되면 커서를 보이지 않게 만드는 기능을 구현하게 하였습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/324f5343-58a8-4b4a-ac3a-47e9a9cba45c"  width="400" height="300"/>

### 2) 마우스로 선굵기 조절 및 색 선택 기능
> 손 모양으로 모드 변경 소요 시간 단축을 위한 마우스를 사용한 모드 변경

그림을 그리다가 손 모양으로 선 굵기를 조절하거나 색을 선택하는 것에 답답함을 느낄 사용자도 있으리라 생각했습니다. 그래서 드래그로 선 굵기를 조절하고 마우스 클릭으로 색 선택을 할 수 있게 만들어 빠른 변환이 가능한 기능을 구현하게 되었습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/1ce86ca8-3b03-44f3-860b-3c231b418403"  width="400" height="300"/>

### 3) 모드 변경 및 색 변경 시 커서에 progress bar 구현
> 모드 변경 소요 시간 시각화

굵기를 조절하기 다음 색으로 넘어가기 기능 등 다른 모드로 변경되는 데 시간이 걸리는 기능들이 있었습니다. 하지만 사용자가 모드가 변경되는데 시간이 얼마나 소요되는지 모른다면 불편하리라 생각했습니다. 그래서 시간 관리를 `redux`를 사용하여 관리해서 커서에 모드 변경 진행 정도를 표시해주는 `progress bar` 기능을 추가하여 구현하였습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/cdf3d4b2-0dfc-44e1-a74e-1483288f7fc9"  width="400" height="300"/>

### 4) 색상에 마우스 올릴 시 색 변경 기능
> 실제 팔레트와 유사한 느낌을 위한 기능 추가

사용자가 마우스로 굵기 변경이나 색 변경 모드로 색을 바꾸는 방식이 아닌 팔레트에 붓을 찍어서 그림을 구현하는 방식처럼 마우스를 색에 올릴 시 그 색을 사용하도록 한다면 사용하기 편할 것이라고 생각하였습니다. 그래서 마우스를 색에 올리면 색이 변경하는 기능을 구현하였습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/949fd312-7fc9-4470-ac5f-c425c515e397"  width="400" height="300"/>

## 4. 성능 개선 방향

### 어떻게 해야 그림을 더 부드럽게 그릴 수 있을까?

그림 그릴 때 가끔 화면이 버벅이는 것처럼 느껴지는 이유를 조사해 봤습니다. 브라우저는 한 프레임당 16.67ms 1초에 60번의 프레임을 보여주는 식으로 동작합니다. 하지만 손 모양을 인식하고 그림을 그리는 함수의 실행시간이 49ms에서 120ms 사이로 동작하는 것을 개발자 도구의 Performance 측정으로 알아냈습니다. 함수에서 대부분의 시간은 MideaPipe에서 을 인식하는 함수에서 소요되는 것으로 파악됐습니다.

그래서 성능을 개선할 수 있는 가능성 중 하나는 MideaPipe의 함수 실행시간을 단축하는 방법과 함수 실행시간을 단축하지 못하더라도 똑같은 함수가 두 번 호출되는 현상을 파악하여 막을 수 있는 방식을 알아낸다면 성능을 개선할 수 있을 것으로 생각합니다.

다른 방법으로는 성능을 개선하기 위하여 `setTimeout` 동작방식과 `rAF(requestAnimationFrame)`의 동작 방식을 비교했을 때 `rAF`로 동작하는 방식이 브라우저의 최적화되어 효율적인 애니메이션을 구현할 것이라 예상하였습니다. 하지만 실제로 두 가지 방법을 모두 사용해 보았을 때 `rAF`는 그림이 끊기면서 그려지고 `setTimeout` 방식이 더 부드럽고 끊기지 않게 그려지는 상황이 일어났습니다.

<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/b27e576c-94f9-4eeb-842b-d4ebbcc4ced4"  width="400" height="300"/>
<img src="https://github.com/MotionDraw/MotionDraw-Client/assets/107802867/00b63048-9275-4941-8bb3-f2a8b1e3cb96"  width="400" height="300"/>

# Schedule

### 프로젝트 기간 : 2023.04.03(월) ~ 2023.04.24(금) / 3주

1주차 : 기획 및 설계

- 아이디어 수집
- 기술 스택 선정
- Figma를 사용한 Mockup 제작
- Notion에 Kanban 작성

2~3주차 : 기능 개발

- 프론트 엔드 구현
- 백엔드 서버 구현

# Tech Stacks

### Frontend

- React
- React-Router
- Redux-Toolkit
- styled-component
- socket.io-client
- ESLint

### Backend

- Node.js
- Express
- socket.io
- ESLint

# Repository Link

- [Frontend](https://github.com/MotionDraw/MotionDraw-Client)
- [Backend](https://github.com/MotionDraw/MotionDraw-Server)

# Member

- 강현준 : steady.kang27@gmail.com
