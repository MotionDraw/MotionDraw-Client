import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Start from "../components/Start";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("<Start />", () => {
  it("should render three circles and a start button", () => {
    render(<Start />);
    expect(screen.getAllByTestId("circle")).toHaveLength(3);
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("should navigate to /lobby on button click", () => {
    const navigateMock = jest.requireMock("react-router-dom").useNavigate;
    const navigate = jest.fn();
    navigateMock.mockReturnValue(navigate);

    render(<Start />);
    fireEvent.click(screen.getByText("Start"));
    expect(navigate).toHaveBeenCalledWith("/lobby");
  });
});
