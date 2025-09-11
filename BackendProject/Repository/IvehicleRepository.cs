using BackendProject.Model;

namespace BackendProject.Repository
{
    public interface IvehicleRepository
    {
        Task<Vehicle> GetVehicleWithUserAsync(int id);

    }
}
