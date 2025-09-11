import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserDashboard from '../../pages/User/UserDashboard';
import axios from '../../api/axios';
import Cookies from 'js-cookie';

// Mocks
vi.mock('../../api/axios');
vi.mock('js-cookie');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserDashboard', () => {
  const fakeUser = {
    userId: 'user123',
    fullName: 'John Doe',
    email: 'john@example.com',
    mobileNumber: '9876543210',
  };

  const fakeVehicle = {
    vehicleId: 'veh123',
    numberPlate: 'ABC1234',
    type: 'Car',
    make: 'Toyota',
    color: 'Red',
  };

  const fakeParkingLot = {
    parkingLotId: 'lot123',
    lotNumber: 'P1',
    location: 'Level 1',
  };

  const fakeAllocation = {
    allocationId: 'alloc123',
    allocatedFromDate: '2023-07-01',
    allocatedUptoDate: '2023-07-10',
    allocatedDays: 10,
    lotNumber: 'P1',
    lotLocation: 'Level 1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Cookies.get.mockClear();
    Cookies.remove.mockClear();

    // Mock localStorage user and cookie token
    localStorage.setItem('user', JSON.stringify(fakeUser));
    Cookies.get.mockImplementation((key) => (key === 'token' ? 'fake-token' : null));
  });

  it('shows login prompt if user not found', () => {
    localStorage.removeItem('user');
    Cookies.get.mockReturnValue(null);

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/please login again/i)).toBeInTheDocument();
  });

  it('fetches and displays user, vehicles, and allocations', async () => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === `/Vehicles/by-user/${fakeUser.userId}`) {
        return Promise.resolve({ data: [fakeVehicle] });
      }
      if (url === '/ParkingLots') {
        return Promise.resolve({ data: [fakeParkingLot] });
      }
      if (url === `/ParkingAllocations/by-vehicle/${fakeVehicle.vehicleId}`) {
        return Promise.resolve({ data: [fakeAllocation] });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(new RegExp(`Welcome, ${fakeUser.fullName}`))).toBeInTheDocument();

    // User info
    expect(screen.getByText(fakeUser.fullName)).toBeInTheDocument();
    expect(screen.getByText(fakeUser.email)).toBeInTheDocument();
    expect(screen.getByText(fakeUser.mobileNumber)).toBeInTheDocument();

    // Vehicle info
    expect(await screen.findByText(fakeVehicle.numberPlate)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${fakeVehicle.make} \\(${fakeVehicle.color}\\) \\[${fakeVehicle.type}\\]`))).toBeInTheDocument();

    // Allocation info
    expect(await screen.findByText(fakeAllocation.lotNumber)).toBeInTheDocument();
    expect(screen.getByText(fakeAllocation.lotLocation)).toBeInTheDocument();
    expect(screen.getByText(fakeAllocation.allocatedFromDate)).toBeInTheDocument();
    expect(screen.getByText(fakeAllocation.allocatedUptoDate)).toBeInTheDocument();
    expect(screen.getByText(fakeAllocation.allocatedDays.toString())).toBeInTheDocument();
  });

  it('logs out user when clicking logout', () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutBtn);

    expect(Cookies.remove).toHaveBeenCalledWith('token');
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows message and register vehicle button if no vehicles', async () => {
    axios.get.mockImplementation((url) => {
      if (url === `/Vehicles/by-user/${fakeUser.userId}`) return Promise.resolve({ data: [] });
      if (url === '/ParkingLots') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no vehicle registered/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register vehicle/i })).toBeInTheDocument();
  });

  it('allows editing vehicle and saving update successfully', async () => {
    axios.get.mockImplementation((url) => {
      if (url === `/Vehicles/by-user/${fakeUser.userId}`) {
        return Promise.resolve({ data: [fakeVehicle] });
      }
      if (url === '/ParkingLots') {
        return Promise.resolve({ data: [fakeParkingLot] });
      }
      if (url === `/ParkingAllocations/by-vehicle/${fakeVehicle.vehicleId}`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    axios.put.mockResolvedValueOnce({
      data: { ...fakeVehicle, numberPlate: 'NEW1234' },
    });

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    // Wait for vehicle to load
    expect(await screen.findByText(fakeVehicle.numberPlate)).toBeInTheDocument();

    // Click Edit button
    fireEvent.click(screen.getByText(/edit/i));

    // Input fields should appear
    const numberPlateInput = screen.getByDisplayValue(fakeVehicle.numberPlate);
    expect(numberPlateInput).toBeInTheDocument();

    // Change number plate
    fireEvent.change(numberPlateInput, { target: { value: 'NEW1234' } });

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        `/Vehicles/${fakeVehicle.vehicleId}`,
        expect.objectContaining({
          numberPlate: 'NEW1234',
        }),
        expect.any(Object)
      )
    );

    // Edit form should close, updated vehicle shown
    expect(screen.queryByRole('textbox', { name: /number plate/i })).not.toBeInTheDocument();
    expect(await screen.findByText('NEW1234')).toBeInTheDocument();
  });

  it('shows error message on vehicle update failure', async () => {
    axios.get.mockImplementation((url) => {
      if (url === `/Vehicles/by-user/${fakeUser.userId}`) {
        return Promise.resolve({ data: [fakeVehicle] });
      }
      if (url === '/ParkingLots') {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    axios.put.mockRejectedValueOnce(new Error('Failed update'));

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    // Click Edit button
    fireEvent.click(await screen.findByText(/edit/i));

    const numberPlateInput = screen.getByDisplayValue(fakeVehicle.numberPlate);
    fireEvent.change(numberPlateInput, { target: { value: 'NEW1234' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/failed to update vehicle/i)).toBeInTheDocument();
  });
});
