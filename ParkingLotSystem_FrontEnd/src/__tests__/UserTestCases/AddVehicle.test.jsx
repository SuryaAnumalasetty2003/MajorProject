import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddVehicle from '../../pages/User/AddVehicle'; // Adjust path as needed
import axios from '../../api/axios';
import Cookies from 'js-cookie';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('js-cookie', () => {
  return {
    default: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    }
  };
});

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddVehicle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock a logged-in user and token
    localStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    Cookies.get.mockReturnValue('fake-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders form fields and buttons', () => {
    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/number plate/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/make/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/color/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('shows customType input when "Other" is selected', async () => {
    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Other');

    expect(screen.getByPlaceholderText(/enter custom type/i)).toBeInTheDocument();
  });

  it('submits form successfully and navigates', async () => {
    axios.post.mockResolvedValueOnce({ data: { vehicleId: 'veh1' } });

    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/number plate/i), 'AB123CD');
    await userEvent.type(screen.getByPlaceholderText(/make/i), 'Honda');
    await userEvent.type(screen.getByPlaceholderText(/color/i), 'Black');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Car');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/vehicles',
        expect.objectContaining({
          numberPlate: 'AB123CD',
          make: 'Honda',
          color: 'Black',
          type: 'Car',
          customType: undefined,
          userId: 'user123',
        }),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
    });
  });

  it('shows error message from API on failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Duplicate number plate' } },
    });

    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/number plate/i), 'AB123CD');
    await userEvent.type(screen.getByPlaceholderText(/make/i), 'Honda');
    await userEvent.type(screen.getByPlaceholderText(/color/i), 'Black');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Car');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/duplicate number plate/i)).toBeInTheDocument();
  });

  it('shows error if not logged in', async () => {
    localStorage.removeItem('user');
    Cookies.get.mockReturnValue(null);

    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/number plate/i), 'AB123CD');
    await userEvent.type(screen.getByPlaceholderText(/make/i), 'Honda');
    await userEvent.type(screen.getByPlaceholderText(/color/i), 'Black');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'Car');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/please login again/i)).toBeInTheDocument();
  });

  it('navigates back on clicking back button', () => {
    render(
      <MemoryRouter>
        <AddVehicle />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
