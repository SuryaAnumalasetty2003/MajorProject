    import { render, screen, waitFor } from "@testing-library/react";
    import userEvent from "@testing-library/user-event";
    import { MemoryRouter } from "react-router-dom";
    import axios from "../../../api/axios";
    import AddAllocationForm from "../../../pages/Admin/ParkingAllocations/AllocationForm";

    vi.mock("../../../api/axios");

    const mockNavigate = vi.fn();

    vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
    });

    describe("AddAllocationForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem("token", "fake-token");
    });

    it("renders all the form inputs and buttons", () => {
        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: /add allocation/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter vehicle number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/allocated from date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/allocated upto date/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Verify available lots/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /add allocation/i })).toBeInTheDocument();
    });

    it("shows error if 'Verify Available Lots' clicked without both dates", async () => {
        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

        expect(screen.getByText(/please select both from and to dates/i)).toBeInTheDocument();
    });

    it("fetches available lots and displays them", async () => {
        const lotsMock = [
        { parkingLotId: 1, lotNumber: "L1", location: "Level 1" },
        { parkingLotId: 2, lotNumber: "L2", location: "Level 2" },
        ];

        axios.get.mockResolvedValueOnce({ data: lotsMock });

        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.type(screen.getByLabelText(/allocated from date/i), "2025-08-01");
        await userEvent.type(screen.getByLabelText(/allocated upto date/i), "2025-08-10");

        await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

        await waitFor(() =>
        expect(axios.get).toHaveBeenCalledWith(
            "/ParkingLots/search?from=2025-08-01&to=2025-08-10",
            expect.objectContaining({
            headers: expect.objectContaining({ Authorization: "Bearer fake-token" }),
            })
        )
        );

        expect(await screen.findByRole("combobox")).toBeInTheDocument();
        expect(screen.getByText(/l1 \(level 1\)/i)).toBeInTheDocument();
        expect(screen.getByText(/l2 \(level 2\)/i)).toBeInTheDocument();
    });

    it("shows error message if fetching lots fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("Network error"));

        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.type(screen.getByLabelText(/allocated from date/i), "2025-08-01");
        await userEvent.type(screen.getByLabelText(/allocated upto date/i), "2025-08-10");

        await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

        expect(await screen.findByText(/failed to fetch available lots/i)).toBeInTheDocument();
    });

    it("shows vehicle not found error when vehicle API returns empty", async () => {
  // Mock axios: vehicle search returns empty array
  axios.get.mockImplementation((url) => {
    if (url.includes("/Vehicles/search-by-plate")) {
      return Promise.resolve({ data: [] }); // no vehicle found
    }
    if (url.includes("/ParkingLots/search")) {
      return Promise.resolve({
        data: [{ parkingLotId: "1", lotNumber: "L1", location: "Level 1" }],
      });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <AddAllocationForm />
    </MemoryRouter>
  );

  // Fill inputs
  await userEvent.type(screen.getByPlaceholderText(/enter vehicle number/i), "INVALID123");
  await userEvent.type(screen.getByLabelText(/allocated from date/i), "2025-08-01");
  await userEvent.type(screen.getByLabelText(/allocated upto date/i), "2025-08-10");

  // Fetch available lots so select appears
  await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

  // Select a parking lot option
  const lotSelect = await screen.findByRole("combobox", { name: /available parking lots/i });
  await userEvent.selectOptions(lotSelect, "1");

  // Submit form
  await userEvent.click(screen.getByRole("button", { name: /add allocation/i }));

  // Assert error message for vehicle not found
  expect(await screen.findByRole("alert")).toHaveTextContent(/vehicle number not found/i);
});


    it("shows error if vehicle has active overlapping allocation", async () => {
        const vehicle = { vehicleId: "v1" };
        const overlappingAllocation = {
        vehicleId: "v1",
        allocatedFromDate: "2025-08-05",
        allocatedUptoDate: "2025-08-15",
        };

        axios.get.mockImplementation((url) => {
        if (url.includes("/Vehicles/search-by-plate")) return Promise.resolve({ data: [vehicle] });
        if (url === "/parkingallocations") return Promise.resolve({ data: [overlappingAllocation] });
        if (url.includes("/ParkingLots/search"))
            return Promise.resolve({ data: [{ parkingLotId: 1, lotNumber: "L1", location: "Level 1" }] });
        return Promise.resolve({ data: [] });
        });

        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.type(screen.getByPlaceholderText(/enter vehicle number/i), "ABC123");
        await userEvent.type(screen.getByLabelText(/allocated from date/i), "2025-08-01");
        await userEvent.type(screen.getByLabelText(/allocated upto date/i), "2025-08-10");

        await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

        const select = await screen.findByRole("combobox");
        await userEvent.selectOptions(select, "1");

        await userEvent.click(screen.getByRole("button", { name: /add allocation/i }));

        expect(await screen.findByText(/this vehicle already has an active allocation/i)).toBeInTheDocument();
    });

    it("shows error message if allocation submission fails", async () => {
        const vehicle = { vehicleId: "v1" };
        const availableLots = [{ parkingLotId: 1, lotNumber: "L1", location: "Level 1" }];

        axios.get.mockImplementation((url) => {
        if (url.includes("/Vehicles/search-by-plate")) return Promise.resolve({ data: [vehicle] });
        if (url === "/parkingallocations") return Promise.resolve({ data: [] });
        if (url.includes("/ParkingLots/search")) return Promise.resolve({ data: availableLots });
        return Promise.resolve({ data: [] });
        });

        axios.post.mockRejectedValue(new Error("Failed to save"));

        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.type(screen.getByPlaceholderText(/enter vehicle number/i), "ABC123");
        await userEvent.type(screen.getByLabelText(/allocated from date/i), "2025-08-01");
        await userEvent.type(screen.getByLabelText(/allocated upto date/i), "2025-08-10");

        await userEvent.click(screen.getByRole("button", { name: /Verify available lots/i }));

        const select = await screen.findByRole("combobox");
        await userEvent.selectOptions(select, "1");

        await userEvent.click(screen.getByRole("button", { name: /add allocation/i }));

        expect(await screen.findByText(/failed to save allocation/i)).toBeInTheDocument();
    });

    it("navigates back when back button clicked", async () => {
        render(
        <MemoryRouter>
            <AddAllocationForm />
        </MemoryRouter>
        );

        await userEvent.click(screen.getByRole("button", { name: /back/i }));

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
    });
