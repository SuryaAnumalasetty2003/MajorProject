using BackendProject.DTO;
using BackendProject.Model;

namespace BackendProject.Service.Interface
{
    public interface IUserService
    {
        Task<IEnumerable<UserReadDto>> GetAllAsync();
        Task<User> GetByIdAsync(int id);
        Task<UserReadDto> RegisterAsync(RegisterDto dto);
        Task<UserReadDto> LoginAsync(LoginDto dto);
        Task<bool> DeleteAsync(int id);
        Task<UserReadDto> UpdateAsync(int id, UserUpdateDto dto); 
    }
}
