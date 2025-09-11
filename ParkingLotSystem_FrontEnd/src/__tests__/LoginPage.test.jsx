import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';

// Create a shared mock function for useNavigate
const mockNavigate = vi.fn();

// Mock react-router-dom before importing the tested component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('js-cookie');
vi.mock('../api/axios', () => ({
  default: { post: vi.fn() }
}));

import api from '../api/axios';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    Cookies.set.mockClear();
    api.post.mockReset();
    mockNavigate.mockClear();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('updates email and password inputs', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const pwInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(pwInput, { target: { value: 'secret' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(pwInput).toHaveValue('secret');
  });

  it('shows error on failed login', async () => {
    api.post.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fail@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'badpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('logs in admin and stores token in localStorage', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        user: { email: 'admin@example.com', role: 'admin' },
        token: 'admintoken'
      }
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'adminpw' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('admintoken');
      expect(localStorage.getItem('user')).toContain('admin@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('logs in user and sets cookie', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        user: { email: 'user@example.com', role: 'user' },
        token: 'usertoken'
      }
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'userpw' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(Cookies.set).toHaveBeenCalledWith(
        'token',
        'usertoken',
        expect.objectContaining({ expires: expect.any(Date) })
      );
      expect(localStorage.getItem('user')).toContain('user@example.com');
      expect(mockNavigate).toHaveBeenCalledWith('/user/dashboard');
    });
  });
});
