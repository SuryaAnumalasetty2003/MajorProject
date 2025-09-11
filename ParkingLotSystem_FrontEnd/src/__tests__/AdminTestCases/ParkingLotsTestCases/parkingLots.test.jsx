import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import ParkingLots from "../../../pages/Admin/ParkingLots/ParkingLots";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/admin/dashboard/parking-lots" }),
  };
});

describe("ParkingLots Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("fetches and displays parking lots on mount", async () => {
  // Mock initial GET /parkinglots call with parking lots data
  axios.get.mockResolvedValueOnce({
    data: [
      { parkingLotId: "1", lotNumber: "A11", location: "Ground Floor", isOccupied: false },
      { parkingLotId: "2", lotNumber: "B12", location: "First Floor", isOccupied: true },
    ],
  });

  render(
    <MemoryRouter>
      <ParkingLots />
    </MemoryRouter>
  );

  // Assert heading presence
  expect(screen.getByRole("heading", { name: /parking lots/i })).toBeInTheDocument();

  // Wait for the lot cards to render (async because data is loaded)
  const lotCardA11 = await screen.findByRole("button", { name: /parking lot a11 at ground floor/i });
  expect(lotCardA11).toBeInTheDocument();

  const lotCardB12 = screen.getByRole("button", { name: /parking lot b12 at first floor/i });
  expect(lotCardB12).toBeInTheDocument();
});


  it("filters lots by lot number on search", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { parkingLotId: "1", lotNumber: "A11", location: "Ground Floor", isOccupied: false },
        { parkingLotId: "2", lotNumber: "B12", location: "First Floor", isOccupied: true },
      ],
    });

    render(
      <MemoryRouter>
        <ParkingLots />
      </MemoryRouter>
    );

    await screen.findByText("A11");

    const searchInput = screen.getByLabelText("Search Parking Lots by Lot Number");
    await userEvent.type(searchInput, "B12");

    expect(screen.queryByText("A11")).toBeNull();
    expect(screen.getByText("B12")).toBeInTheDocument();
  });

  it("disables Add Lot button when inputs empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <ParkingLots />
      </MemoryRouter>
    );

    const lotNumberInput = screen.getByLabelText("Lot Number");
    const locationSelect = screen.getByLabelText("Location");
    const addButton = screen.getByRole("button", { name: /add lot/i });

    expect(addButton).toBeDisabled();

    await userEvent.type(lotNumberInput, "A11");
    expect(addButton).toBeDisabled();

    await userEvent.selectOptions(locationSelect, "Ground Floor");
    expect(addButton).toBeEnabled();
  });
  it("confirms and deletes a parking lot", async () => {
    axios.get.mockResolvedValue({
      data: [{ parkingLotId: "1", lotNumber: "A11", location: "Ground Floor", isOccupied: false }],
    });

    axios.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <ParkingLots />
      </MemoryRouter>
    );

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    await screen.findByText("A11");

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("/parkinglots/1", expect.any(Object));
    });

    window.confirm.mockRestore();
  });

  it("does not delete parking lot if confirmation cancelled", async () => {
    axios.get.mockResolvedValue({
      data: [{ parkingLotId: "1", lotNumber: "A11", location: "Ground Floor", isOccupied: false }],
    });

    vi.spyOn(window, "confirm").mockImplementation(() => false);

    render(
      <MemoryRouter>
        <ParkingLots />
      </MemoryRouter>
    );

    await screen.findByText("A11");

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(axios.delete).not.toHaveBeenCalled();

    window.confirm.mockRestore();
  });

  it("navigates to lot detail and edit pages", async () => {
    axios.get.mockResolvedValue({
      data: [{ parkingLotId: "1", lotNumber: "A11", location: "Ground Floor", isOccupied: false }],
    });

    render(
      <MemoryRouter>
        <ParkingLots />
      </MemoryRouter>
    );

    await screen.findByText("A11");

    await userEvent.click(screen.getByRole("button", { name: /parking lot a11 at ground floor/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/parking-lots/A11");

    mockNavigate.mockClear();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/parking-lots/edit/1");
  });
});
