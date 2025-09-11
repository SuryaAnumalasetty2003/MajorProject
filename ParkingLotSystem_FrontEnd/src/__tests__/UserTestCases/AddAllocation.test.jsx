import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddAllocation from '../../pages/User/AddAllocation'; // Adjust if necessary
import axios from '../../api/axios';
import Cookies from 'js-cookie';

vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddAllocation component', () => {
  const fakeUser = { userId: 'user123' };
  const fakeVehicles = [{ vehicleId: 'veh1', numberPlate: 'ABC123' }];
  const fakeLots = [
    { parkingLotId: 1, lotNumber: 'L1', location: 'Level 1' },
    { parkingLotId: 2, lotNumber: 'L2', location: 'Level 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(fakeUser));
    Cookies.get.mockImplementation(key => (key === 'token' ? 'fake-token' : null));

    // Default axios.get mock returns proper data object for all relevant urls
    axios.get.mockImplementation(url => {
      if (url === `/Vehicles/by-user/${fakeUser.userId}`) {
        return Promise.resolve({ data: fakeVehicles });
      }
      if (url.startsWith('/ParkingLots/search')) {
        return Promise.resolve({ data: fakeLots });
      }
      // fallback for other GET requests
      return Promise.resolve({ data: [] });
    });

    axios.post.mockResolvedValue({}); // Default post success for allocation submission
  });

  it('renders form fields and buttons', () => {
    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /add parking allocation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /allocate slot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /check available lots/i })).toBeInTheDocument();

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');
    expect(fromDateInput).toBeInTheDocument();
    expect(toDateInput).toBeInTheDocument();
  });

  it('fetches vehicles on mount', async () => {
    render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`/Vehicles/by-user/${fakeUser.userId}`, expect.any(Object));
    });
  });

  it('does not fetch vehicles without user or token', async () => {
    localStorage.removeItem('user');
    Cookies.get.mockReturnValue(null);

    render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('/Vehicles/by-user/'), expect.any(Object));
    });
  });

  it('fetches available lots after clicking check available lots with valid dates', async () => {
    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    await userEvent.click(screen.getByRole('button', { name: /check available lots/i }));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ParkingLots/search?from=2025-08-01&to=2025-08-05'),
        expect.any(Object)
      );
    });

    expect(await screen.findByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText(/l1 - level 1/i)).toBeInTheDocument();
    expect(screen.getByText(/l2 - level 2/i)).toBeInTheDocument();
  });

  it('shows error if fetching available lots fails and displays alert', async () => {
    // Override axios.get mock for this test
    axios.get.mockImplementation(url => {
      if (url.startsWith('/ParkingLots/search'))
        return Promise.reject(new Error('Network error'));
      if (url === `/Vehicles/by-user/${fakeUser.userId}`)
        return Promise.resolve({ data: fakeVehicles });
      return Promise.resolve({ data: [] });
    });

    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    await userEvent.click(screen.getByRole('button', { name: /check available lots/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/failed to load available lots/i);
  });

  it('shows error if no registered vehicles when submitting', async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // No vehicles returned

    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    await userEvent.click(screen.getByRole('button', { name: /allocate slot/i }));

    expect(await screen.findByText(/please register a vehicle first/i)).toBeInTheDocument();
  });

  it('shows error if no parking lot selected when submitting', async () => {
    axios.get.mockResolvedValueOnce({ data: fakeVehicles });

    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    // Intentionally do not select any parking lot

    await userEvent.click(screen.getByRole('button', { name: /allocate slot/i }));

    expect(await screen.findByText(/please select a parking lot/i)).toBeInTheDocument();
  });

  it('submits allocation and navigates on success', async () => {
    axios.get.mockResolvedValueOnce({ data: fakeVehicles });
    axios.post.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: fakeLots });

    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    await userEvent.click(screen.getByRole('button', { name: /check available lots/i }));

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: String(fakeLots[0].parkingLotId) } });

    await userEvent.click(screen.getByRole('button', { name: /allocate slot/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/ParkingAllocations',
        {
          vehicleId: fakeVehicles[0].vehicleId,
          parkingLotId: fakeLots[0].parkingLotId,
          allocatedFromDate: '2025-08-01',
          allocatedUptoDate: '2025-08-05',
        },
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
    });
  });

  it('shows error on allocation submission failure', async () => {
    axios.get.mockResolvedValueOnce({ data: fakeVehicles });
    axios.post.mockRejectedValueOnce(new Error('Submission failed'));
    axios.get.mockResolvedValueOnce({ data: fakeLots });

    const { container } = render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const fromDateInput = container.querySelector('input[name="fromDate"]');
    const toDateInput = container.querySelector('input[name="toDate"]');

    await userEvent.clear(fromDateInput);
    await userEvent.type(fromDateInput, '2025-08-01');
    await userEvent.clear(toDateInput);
    await userEvent.type(toDateInput, '2025-08-05');

    await userEvent.click(screen.getByRole('button', { name: /check available lots/i }));

    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: String(fakeLots[0].parkingLotId) } });

    await userEvent.click(screen.getByRole('button', { name: /allocate slot/i }));

    expect(await screen.findByText(/error creating allocation/i)).toBeInTheDocument();
  });

  it('navigates back when close button clicked', () => {
    render(
      <MemoryRouter>
        <AddAllocation />
      </MemoryRouter>
    );

    const closeBtn = screen.getByRole('button', { name: /×/i }) || screen.getByText('×');
    fireEvent.click(closeBtn);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
  