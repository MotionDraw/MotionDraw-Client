import React from "react";
import { render, screen } from "@testing-library/react";
import Cursor from "../components/Cursor";
import { act } from "react-dom/test-utils";

describe("<Cursor />", () => {
  jest.useFakeTimers();
  const cursor = {
    rightHand: { x: 0, y: 0 },
    leftHand: { x: 0, y: 0 },
  };

  it("should render Cursor", () => {
    render(
      <Cursor
        cursor={cursor}
        canvas={{
          current: { offsetParent: { offsetParent: { offsetLeft: 0 } } },
        }}
      />
    );

    expect(screen.queryByText("Others")).toBeInTheDocument();
  });

  it("Cursor should not visible after 5 seconds", () => {
    render(
      <Cursor
        cursor={cursor}
        canvas={{
          current: { offsetParent: { offsetParent: { offsetLeft: 0 } } },
        }}
      />
    );

    expect(screen.queryByText("Others")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.queryByText("Others")).not.toBeInTheDocument();
  });
});
