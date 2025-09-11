using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Microsoft.EntityFrameworkCore;

namespace BackendProject.Service.Implementation
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _repo;
        private readonly IMapper _mapper;
        private readonly ILogger<UserService> _logger;

        public UserService(IGenericRepository<User> repo, IMapper mapper, ILogger<UserService> logger)
        {
            _repo = repo;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<UserReadDto>> GetAllAsync()
        {
            try
            {
                var users = await _repo.GetAllAsync();
                _logger.LogInformation("Fetched all users.");
                return _mapper.Map<IEnumerable<UserReadDto>>(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all users.");
                return Enumerable.Empty<UserReadDto>();
            }
        }

        public async Task<User> GetByIdAsync(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found or is deleted.", id);
                    return null;
                }

                _logger.LogInformation("Fetched user with ID {UserId}", id);
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user with ID {UserId}", id);
                return null;
            }
        }

        public async Task<UserReadDto> RegisterAsync(RegisterDto dto)
        {   
            try
            {

                var user = _mapper.Map<User>(dto);
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var created = await _repo.AddAsync(user);

                _logger.LogInformation("User registered with email {Email}", user.Email);
                return _mapper.Map<UserReadDto>(created);
            }
            catch (DbUpdateException ex)
            {
                var innerMsg = ex.InnerException?.Message ?? "";

                if (innerMsg.Contains("IX_Users_Email"))
                {
                    _logger.LogWarning("Duplicate email registration attempt: {Email}", dto.Email);
                    return new UserReadDto { FullName = "DUPLICATE_EMAIL" };
                }

                if (innerMsg.Contains("IX_Users_Mobile"))
                {
                    _logger.LogWarning("Duplicate mobile registration attempt: {Mobile}", dto.MobileNumber);
                    return new UserReadDto { FullName = "DUPLICATE_MOBILE" };
                }

                _logger.LogError(ex, "Unknown DB error during registration.");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user with email {Email}", dto.Email);
                return null;
            }
        }


        public async Task<UserReadDto> LoginAsync(LoginDto dto)
        {
            try
            {
                var users = await _repo.GetAllAsync();
                var user = users.FirstOrDefault(u => u.Email == dto.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Invalid login attempt for email {Email}", dto.Email);
                    return null;
                }

                _logger.LogInformation("User logged in: {Email}", user.Email);
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email {Email}", dto.Email);
                return null;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("Delete failed. User with ID {UserId} not found or already deleted.", id);
                    return false;
                }

                await _repo.DeleteAsync(id);
                _logger.LogInformation("User with ID {UserId} deleted.", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return false;
            }
        }

        public async Task<UserReadDto> UpdateAsync(int id, UserUpdateDto dto)
        {
            try
            {
                var user = await _repo.GetByIdAsync(id);
                if (user == null)
                {
                    _logger.LogWarning("Update failed. User with ID {UserId} not found or is deleted.", id);
                    return null;
                }

                user.FullName = dto.FullName;
                user.MobileNumber = dto.MobileNumber;
                user.Email = dto.Email;

                await _repo.UpdateAsync(user);
                _logger.LogInformation("User with ID {UserId} updated.", id);
                return _mapper.Map<UserReadDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}", id);
                return null;
            }
        }
    }
}
