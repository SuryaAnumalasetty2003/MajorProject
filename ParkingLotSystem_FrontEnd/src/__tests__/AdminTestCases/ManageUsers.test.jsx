import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageUsers from "../../pages/Admin/ManageUsers"; // Adjust this path
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

vi.mock("axios");

describe("ManageUsers component", () => {
  const fakeUsers = [
    {
      userId: "1",
      fullName: "Alice Smith",
      email: "alice@example.com",
      mobileNumber: "9876543210",
      role: "Admin",
    },
    {
      userId: "2",
      fullName: "Bob Johnson",
      email: "bob@example.com",
      mobileNumber: "9123456789",
      role: "User",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: fakeUsers });
    axios.put.mockResolvedValue({});
    axios.delete.mockResolvedValue({});
  });

  it("renders fetched users in table", async () => {
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });
  });

  it("filters users by search input", async () => {
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Alice Smith"));

    const searchInput = screen.getByPlaceholderText(/search by name or email or mobileNumber/i);
    await userEvent.type(searchInput, "bob");

    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("opens edit form upon clicking Edit and updates user", async () => {
    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Alice Smith"));

    await userEvent.click(screen.getAllByText("Edit")[0]);

    const fullNameInput = await screen.findByPlaceholderText("Full Name");
    expect(fullNameInput.value).toBe("Alice Smith");

    await userEvent.clear(fullNameInput);
    await userEvent.type(fullNameInput, "Alice S");

    await userEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/api/Users/1"),
        expect.objectContaining({ fullName: "Alice S" }),
        expect.any(Object)
      );
    });
  });

  it("asks for confirmation and deletes user", async () => {
    window.confirm = vi.fn(() => true); // mock confirmation

    render(
      <MemoryRouter>
        <ManageUsers />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Alice Smith"));

    await userEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining("/api/Users/1"),
        expect.any(Object)
      );
    });

    window.confirm.mockRestore();
  });
});
