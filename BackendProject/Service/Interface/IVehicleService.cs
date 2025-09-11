using BackendProject.DTO;

namespace BackendProject.Service.Interface
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleReadDto>> GetAllAsync();
        Task<VehicleReadDto> GetByIdAsync(int id);
        Task<IEnumerable<VehicleReadDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<VehicleReadDto>> SearchAsync(string name);
        Task<VehicleReadDto> CreateAsync(VehicleCreateDto dto);
        Task<VehicleReadDto> UpdateAsync(int id, VehicleUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<VehicleReadDto>> SearchByNumberPlateAsync(string plate);

    }
}
