import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import EditParkingLot from "../../../pages/Admin/ParkingLots/EditParkingLot";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

describe("EditParkingLot Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("shows loading initially", () => {
    // Mock axios.get to never resolve immediately (simulate loading)
    axios.get.mockReturnValue(new Promise(() => {})); 

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("fetches parking lot and populates form", async () => {
    axios.get.mockResolvedValueOnce({
      data: { lotNumber: "A11", location: "Ground Floor" },
    });

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("A11")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ground Floor")).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to load parking lot/i)).toBeInTheDocument();
  });

  it("allows editing inputs", async () => {
    axios.get.mockResolvedValueOnce({
      data: { lotNumber: "A11", location: "Ground Floor" },
    });

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    const lotNumberInput = await screen.findByDisplayValue("A11");
    const locationSelect = screen.getByDisplayValue("Ground Floor");

    await userEvent.clear(lotNumberInput);
    await userEvent.type(lotNumberInput, "B12");
    expect(lotNumberInput).toHaveValue("B12");

    await userEvent.selectOptions(locationSelect, "First Floor");
    expect(locationSelect).toHaveValue("First Floor");
  });

  it("submits updated data and navigates back on success", async () => {
    axios.get.mockResolvedValueOnce({
      data: { lotNumber: "A11", location: "Ground Floor" },
    });
    axios.put.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    const lotNumberInput = await screen.findByDisplayValue("A11");
    const locationSelect = screen.getByDisplayValue("Ground Floor");
    const updateButton = screen.getByRole("button", { name: /update lot/i });

    // Change inputs
    await userEvent.clear(lotNumberInput);
    await userEvent.type(lotNumberInput, "B12");
    await userEvent.selectOptions(locationSelect, "First Floor");

    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/parkinglots/1",
        { lotNumber: "B12", location: "First Floor" },
        expect.any(Object)
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/parking-lots");
  });

  it("shows error message if update fails", async () => {
    axios.get.mockResolvedValueOnce({
      data: { lotNumber: "A11", location: "Ground Floor" },
    });
    axios.put.mockRejectedValueOnce(new Error("Update failed"));

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    const updateButton = await screen.findByRole("button", { name: /update lot/i });

    await userEvent.click(updateButton);

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });

  it("navigates back when Back button clicked", async () => {
    axios.get.mockResolvedValueOnce({
      data: { lotNumber: "A11", location: "Ground Floor" },
    });

    render(
      <MemoryRouter>
        <EditParkingLot />
      </MemoryRouter>
    );

    await screen.findByText(/edit parking lot/i);

    const backButton = screen.getByRole("button", { name: /back/i });

    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/parking-lots");
  });
});
