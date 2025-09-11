using BackendProject.Model;

namespace BackendProject.Service.Interface
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
