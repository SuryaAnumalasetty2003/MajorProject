import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/RegisterPage';
import api from '../api/axios';

// Mock api module
vi.mock('../api/axios', () => ({
  default: { post: vi.fn() },
}));

// Mock react-router-dom useNavigate before importing component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the registration form fields & button', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('updates input values when typing', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue('9876543210');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123');
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123');
  });

  it('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password321');

    await user.click(screen.getByRole('button', { name: /register/i }));

     await waitFor(() => {
    expect(
      screen.getByText((content) => content.includes("Passwords do not match"))
    ).toBeInTheDocument();
  });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows error when mobile number is invalid', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '12345'); // invalid number
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/invalid mobile number format/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls API and navigates after successful registration', async () => {
    api.post.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/registered successfully/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/Users/register', {
        fullName: 'John Doe',
        email: 'john@example.com',
        mobileNumber: '9876543210',
        password: 'password123',
        confirmPassword: 'password123',
      })
    );

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'), { timeout: 3000 });
  });

  it('shows error if email already exists', async () => {
    api.post.mockRejectedValueOnce(
      Object.assign(new Error('DUPLICATE_EMAIL'), {
        response: { data: { message: 'DUPLICATE_EMAIL' } },
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });

  it('shows error if mobile number already exists', async () => {
    api.post.mockRejectedValueOnce(
      Object.assign(new Error('DUPLICATE_MOBILE'), {
        response: { data: { message: 'DUPLICATE_MOBILE' } },
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/mobile number already exists/i)).toBeInTheDocument();
  });

  it('shows generic error on registration failure', async () => {
    api.post.mockRejectedValueOnce(
      Object.assign(new Error('Some error'), {
        response: { data: { message: 'UNKNOWN_ERROR' } }
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/mobile number/i), '9876543210');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
  });
});
