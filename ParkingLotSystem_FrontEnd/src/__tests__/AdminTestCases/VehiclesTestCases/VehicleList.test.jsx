import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import VehicleList from "../../../pages/Admin/Vehicles/VehicleList";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("VehicleList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("fetches and displays the list of vehicles", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { vehicleId: "1", numberPlate: "ABC123", userName: "John Doe" },
        { vehicleId: "2", numberPlate: "XYZ789", userName: "Jane Smith" },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    expect(await screen.findByText("ABC123")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("XYZ789")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("filters vehicles by number plate or owner", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { vehicleId: "1", numberPlate: "ABC123", userName: "John Doe" },
        { vehicleId: "2", numberPlate: "XYZ789", userName: "Jane Smith" },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    await screen.findByText("ABC123");

    const searchInput = screen.getByPlaceholderText(/search by number plate or owner/i);
    await userEvent.type(searchInput, "Jane");

    expect(screen.queryByText("ABC123")).toBeNull();
    expect(screen.getByText("XYZ789")).toBeInTheDocument();
  });

  it("navigates to vehicle detail page on View button click", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { vehicleId: "1", numberPlate: "ABC123", userName: "John Doe" },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    await screen.findByText("ABC123");

    const viewButton = screen.getByRole("button", { name: /view/i });
    await userEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/vehicles/ABC123");
  });

  it("deletes a vehicle after confirmation", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { vehicleId: "1", numberPlate: "ABC123", userName: "John Doe" },
      ],
    });
    axios.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    await screen.findByText("ABC123");

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/vehicles/1", expect.any(Object));
    });

    expect(screen.queryByText("ABC123")).toBeNull();

    window.confirm.mockRestore();
  });

  it("does not delete vehicle if confirmation is cancelled", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { vehicleId: "1", numberPlate: "ABC123", userName: "John Doe" },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    await screen.findByText("ABC123");

    vi.spyOn(window, "confirm").mockImplementation(() => false);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(axios.delete).not.toHaveBeenCalled();

    expect(screen.getByText("ABC123")).toBeInTheDocument();

    window.confirm.mockRestore();
  });

  it("displays no vehicles message when list is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <VehicleList />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument();
  });
});
