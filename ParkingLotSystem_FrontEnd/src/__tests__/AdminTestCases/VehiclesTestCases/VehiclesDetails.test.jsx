import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "../../../api/axios";
import VehicleDetails from "../../../pages/Admin/Vehicles/VehicleDetails";

vi.mock("../../../api/axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ numberPlate: "ABC123" }),
  };
});

describe("VehicleDetails Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    mockNavigate.mockReset();
  });

  it("shows loading initially", () => {
    // Mock axios.get pending (promise not resolved yet)
    axios.get.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <VehicleDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("fetches and displays vehicle details", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          numberPlate: "ABC123",
          userName: "John Doe",
          type: "Sedan",
          make: "Toyota",
          color: "Blue",
        },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleDetails />
      </MemoryRouter>
    );

    expect(await screen.findByText(/vehicle details/i)).toBeInTheDocument();

    expect(screen.getByText("Number Plate").nextSibling.textContent).toBe("ABC123");
    expect(screen.getByText("Owner Name").nextSibling.textContent).toBe("John Doe");
    expect(screen.getByText("Type").nextSibling.textContent).toBe("Sedan");
    expect(screen.getByText("Model").nextSibling.textContent).toBe("Toyota");
    expect(screen.getByText("Color").nextSibling.textContent).toBe("Blue");
  });

  it("navigates back on Back button click", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          numberPlate: "ABC123",
          userName: "John Doe",
          type: "Sedan",
          make: "Toyota",
          color: "Blue",
        },
      ],
    });

    render(
      <MemoryRouter>
        <VehicleDetails />
      </MemoryRouter>
    );

    // Wait for data to display
    await screen.findByText(/vehicle details/i);

    const backButton = screen.getByRole("button", { name: /back/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
