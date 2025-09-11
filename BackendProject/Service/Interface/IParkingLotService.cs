using BackendProject.DTO;
using BackendProject.Model;

namespace BackendProject.Service.Interface
{
    public interface IParkingLotService
    {
        Task<IEnumerable<ParkingLotReadDto>> GetAllAsync();
        Task<ParkingLotReadDto> GetByIdAsync(int id);
        Task<ParkingLotReadDto> CreateAsync(ParkingLotCreateDto dto);
        Task<ParkingLotReadDto> UpdateAsync(int id, ParkingLotUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<string> SeedLotsAsync();
Task<IEnumerable<ParkingLotReadDto>> SearchByDateRangeAsync(DateTime from, DateTime to);


    }
}
