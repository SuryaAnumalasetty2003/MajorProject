import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from '../../../api/axios';
import Allocations from '../../../pages/Admin/ParkingAllocations/Allocations'; // Adjust path if needed

vi.mock('../../../api/axios');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ key: 'test-key' }),
  };
});

describe('Allocations Component', () => {
  const fakeAllocations = [
    {
      allocationId: 1,
      numberPlate: 'ABC123',
      lotNumber: 'L1',
      allocatedFromDate: '2025-01-01',
      allocatedUptoDate: '2025-12-31',
      allocatedDays: 365,
    },
    {
      allocationId: 2,
      numberPlate: 'XYZ789',
      lotNumber: 'L2',
      allocatedFromDate: '2024-06-01',
      allocatedUptoDate: '2024-06-30',
      allocatedDays: 30,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: fakeAllocations });
    axios.delete.mockResolvedValue({});
  });

  it('renders fetched allocations', async () => {
    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    for (const alloc of fakeAllocations) {
      expect(await screen.findByText(alloc.numberPlate)).toBeInTheDocument();
      expect(screen.getByText(alloc.lotNumber)).toBeInTheDocument();
      expect(screen.getByText(alloc.allocatedFromDate)).toBeInTheDocument();
      expect(screen.getByText(alloc.allocatedUptoDate)).toBeInTheDocument();
      expect(screen.getByText(String(alloc.allocatedDays))).toBeInTheDocument();
    }
  });

  it('filters allocations based on search input', async () => {
    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    await screen.findByText('ABC123');

    const searchInput = screen.getByPlaceholderText(/search by number plate or lot number/i);
    await userEvent.type(searchInput, 'xyz');

    expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
    expect(screen.getByText('XYZ789')).toBeInTheDocument();
  });

  it('navigates to add allocation page on Add Allocation button', async () => {
    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: /Create Allocation/i });
    await userEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard/allocations/new');
  });

  it('navigates when clicking on number plate or lot number', async () => {
    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    const plateLink = await screen.findByText(fakeAllocations[0].numberPlate);
    await userEvent.click(plateLink);
    expect(mockNavigate).toHaveBeenCalledWith(`/admin/dashboard/vehicles/${fakeAllocations[0].numberPlate}`);

    const lotLink = screen.getByText(fakeAllocations[0].lotNumber);
    await userEvent.click(lotLink);
    expect(mockNavigate).toHaveBeenCalledWith(`/admin/dashboard/parking-lots/${fakeAllocations[0].lotNumber}`);
  });

  it('navigates to edit page on Edit button click', async () => {
    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    const editButton = await screen.findByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      `/admin/dashboard/allocations/edit/${fakeAllocations[0].allocationId}`
    );
  });

  it('deletes allocation after confirmation and refreshes list', async () => {
    window.confirm = vi.fn(() => true);

    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    // Wait for initial allocations to render
    await screen.findByText(fakeAllocations[0].numberPlate);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(axios.delete).toHaveBeenCalledWith(
      `/parkingallocations/${fakeAllocations[0].allocationId}`,
      expect.anything()
    );

    // axios.get should have been called twice: once on mount and once after delete refresh
    expect(axios.get).toHaveBeenCalledTimes(2);

    window.confirm.mockRestore();
  });

  it('shows no allocations message when none found', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Allocations />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no allocations found/i)).toBeInTheDocument();
  });
});
