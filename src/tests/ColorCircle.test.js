import React from "react";
import { fireEvent, getByTestId, render, screen } from "@testing-library/react";
import ColorCircle from "../components/ColorCircle";
import { Provider } from "react-redux";
import { store } from "../app/store";

describe("<ColorCircle />", () => {
  it("색 변경 버튼이 작동하나?", () => {
    const onClickMock = jest.fn();
    const color = "red";
    const selectedColor = "blue";

    render(
      <Provider store={store}>
        <ColorCircle
          color={color}
          onClick={onClickMock}
          selectedColor={selectedColor}
        />
      </Provider>
    );

    fireEvent.click(getByTestId("circle"));

    expect(onClickMock).toHaveBeenCalledWith(color);
  });
});
