import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import EditAllocationForm from "../../../pages/Admin/ParkingAllocations/EditAllocationForm";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "42" }),
  };
});

describe("EditAllocationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("loads allocation and populates form", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/parkingallocations/42") {
        return Promise.resolve({
          data: {
            numberPlate: "ABC123",
            parkingLotId: "5",
            allocatedFromDate: "2025-08-01T00:00:00Z",
            allocatedUptoDate: "2025-08-10T00:00:00Z",
          },
        });
      }
      if (url === "/parkinglots/search?from=2025-08-01&to=2025-08-10") {
        return Promise.resolve({
          data: [
            { parkingLotId: "4", lotNumber: "L4", location: "Level 4" },
            { parkingLotId: "5", lotNumber: "L5", location: "Level 5" },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <EditAllocationForm />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue("ABC123")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-08-01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-08-10")).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();

    expect(await screen.findByRole("option", { name: /L4/i })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: /L5/i })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: /L5/i }).selected).toBe(true);
  });

  it("shows error message if vehicle not found", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/parkingallocations/42") {
        return Promise.resolve({
          data: {
            numberPlate: "ABC123",
            parkingLotId: "5",
            allocatedFromDate: "2025-08-01T00:00:00Z",
            allocatedUptoDate: "2025-08-10T00:00:00Z",
          },
        });
      }
      if (url === "/parkinglots/search?from=2025-08-01&to=2025-08-10") {
        return Promise.resolve({ data: [{ parkingLotId: "5", lotNumber: "L5", location: "Level 5" }] });
      }
      if (url.includes("/Vehicles/search-by-plate")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <EditAllocationForm />
      </MemoryRouter>
    );

    await screen.findByDisplayValue("ABC123");

    await userEvent.click(screen.getByRole("button", { name: /update allocation/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/vehicle number not found/i);
  });

  it("shows error if overlapping allocation exists", async () => {
    const vehicle = [{ vehicleId: "v1" }];
    const overlappingAllocation = [
      {
        allocationId: 99,
        vehicleId: "v1",
        allocatedFromDate: "2025-08-05T00:00:00Z",
        allocatedUptoDate: "2025-08-15T00:00:00Z",
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === "/parkingallocations/42") {
        return Promise.resolve({
          data: {
            numberPlate: "ABC123",
            parkingLotId: "5",
            allocatedFromDate: "2025-08-01T00:00:00Z",
            allocatedUptoDate: "2025-08-10T00:00:00Z",
          },
        });
      }
      if (url === "/parkinglots/search?from=2025-08-01&to=2025-08-10") {
        return Promise.resolve({ data: [{ parkingLotId: "5", lotNumber: "L5", location: "Level 5" }] });
      }
      if (url.includes("/Vehicles/search-by-plate")) {
        return Promise.resolve({ data: vehicle });
      }
      if (url === "/parkingallocations") {
        return Promise.resolve({ data: overlappingAllocation });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <EditAllocationForm />
      </MemoryRouter>
    );

    await screen.findByDisplayValue("ABC123");

    await userEvent.click(screen.getByRole("button", { name: /update allocation/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already has an active allocation/i);
  });

  it("successfully updates allocation and navigates", async () => {
    const vehicle = [{ vehicleId: "v1" }];

    axios.get.mockImplementation((url) => {
      if (url === "/parkingallocations/42") {
        return Promise.resolve({
          data: {
            numberPlate: "ABC123",
            parkingLotId: "5",
            allocatedFromDate: "2025-08-01T00:00:00Z",
            allocatedUptoDate: "2025-08-10T00:00:00Z",
          },
        });
      }
      if (url === "/parkinglots/search?from=2025-08-01&to=2025-08-10") {
        return Promise.resolve({ data: [{ parkingLotId: "5", lotNumber: "L5", location: "Level 5" }] });
      }
      if (url.includes("/Vehicles/search-by-plate")) {
        return Promise.resolve({ data: vehicle });
      }
      if (url === "/parkingallocations") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    axios.put = vi.fn().mockResolvedValue({});

    render(
      <MemoryRouter>
        <EditAllocationForm />
      </MemoryRouter>
    );

    await screen.findByDisplayValue("ABC123");

    await userEvent.click(screen.getByRole("button", { name: /update allocation/i }));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    // No need for fake timers because delay is 0 in test environment
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard/allocations");
  });

  it("shows error if update API fails", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/parkingallocations/42") {
        return Promise.resolve({
          data: {
            numberPlate: "ABC123",
            parkingLotId: "5",
            allocatedFromDate: "2025-08-01T00:00:00Z",
            allocatedUptoDate: "2025-08-10T00:00:00Z",
          },
        });
      }
      if (url === "/parkinglots/search?from=2025-08-01&to=2025-08-10") {
        return Promise.resolve({ data: [{ parkingLotId: "5", lotNumber: "L5", location: "Level 5" }] });
      }
      if (url.includes("/Vehicles/search-by-plate")) {
        return Promise.resolve({ data: [{ vehicleId: "v1" }] });
      }
      if (url === "/parkingallocations") {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    axios.put = vi.fn().mockRejectedValue(new Error("Update failed"));

    render(
      <MemoryRouter>
        <EditAllocationForm />
      </MemoryRouter>
    );

    await screen.findByDisplayValue("ABC123");

    await userEvent.click(screen.getByRole("button", { name: /update allocation/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/failed to update allocation/i);
  });
});
