import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import ParkingLotDetail from "../../../pages/Admin/ParkingLots/ParkingLotDetail";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ lotNumber: "A11" }),
  };
});

describe("ParkingLotDetail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("shows loading state initially", async () => {
    let resolveGet;
    const getPromise = new Promise((resolve) => {
      resolveGet = resolve;
    });
    axios.get.mockReturnValueOnce(getPromise);

    render(
      <MemoryRouter>
        <ParkingLotDetail />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading details/i)).toBeInTheDocument();

    resolveGet({ data: [] });
    await waitFor(() => expect(screen.queryByText(/loading details/i)).not.toBeInTheDocument());
  });

  it("displays 'not found' message if no matching lot", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ lotNumber: "B12", location: "First Floor", isOccupied: true }],
    });

    render(
      <MemoryRouter initialEntries={["/parking-lots/A11"]}>
        <ParkingLotDetail />
      </MemoryRouter>
    );

    expect(await screen.findByText(/parking lot not found/i)).toBeInTheDocument();
  });

  it("navigates back when close (✕) button clicked", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ lotNumber: "A11", location: "Ground Floor", isOccupied: false }],
    });

    render(
      <MemoryRouter>
        <ParkingLotDetail />
      </MemoryRouter>
    );

    await screen.findByText(/parking lot details/i);

    const closeButton = screen.getByText("✕");
    await userEvent.click(closeButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates back when Back button clicked", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ lotNumber: "A11", location: "Ground Floor", isOccupied: false }],
    });

    render(
      <MemoryRouter>
        <ParkingLotDetail />
      </MemoryRouter>
    );

    await screen.findByText(/parking lot details/i);

    const backButton = screen.getByRole("button", { name: /back/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
