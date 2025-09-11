import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import * as reactRouterDom from "react-router-dom";
import AdminDashboard from "../../pages/Admin/AdminDashboard"; // Adjust import path if needed

// Mock useNavigate to a jest.fn
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // Default useLocation, can be overridden by spy in tests
    useLocation: () => ({ pathname: "/admin/homepage" }),
  };
});

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Set localStorage items as if logged in
    localStorage.setItem("user", JSON.stringify({ id: "user123", name: "Admin User" }));
    localStorage.setItem("token", "fake-token");
  });

  it("renders sidebar with all menu items", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /admin panel/i })).toBeInTheDocument();

    const menuNames = [
      "Home",
      "Manage Users",
      "View Allocations",
      "Add Parking Lot",
      "Manage Vehicles",
    ];
    for (const name of menuNames) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("highlights active menu item based on current location", () => {
    // Spy and mock useLocation to simulate different path
    vi.spyOn(reactRouterDom, "useLocation").mockReturnValue({
      pathname: "/admin/manage-users",
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const activeItem = screen.getByText("Manage Users");
    expect(activeItem.parentElement).toHaveClass("bg-indigo-600");
    expect(activeItem.parentElement).toHaveClass("text-white");
    expect(activeItem.parentElement).toHaveClass("font-semibold");
  });

  it("navigates to correct route on menu item click", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const manageUsersItem = screen.getByText("Manage Users").parentElement;
    expect(manageUsersItem).toBeVisible();

    await userEvent.click(manageUsersItem);

    expect(mockNavigate).toHaveBeenCalledWith("manage-users");
  });

  it("logs out correctly: clears localStorage and navigates home", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    await userEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    // No cookie removal check because cookies are not used
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("placeholder: has keyboard accessible menu items if keyboard handlers added", () => {
    // Write tests here once you add keyboard accessibility features on menu items.
  });
});
