using BackendProject.DTO;

namespace BackendProject.Service.Interface
{
    public interface IParkingAllocationService
    {
        Task<IEnumerable<ParkingAllocationReadDto>> GetAllAsync();
        Task<ParkingAllocationReadDto> GetByIdAsync(int id);
        Task<IEnumerable<ParkingAllocationReadDto>> GetByVehicleIdAsync(int vehicleId);
        Task<IEnumerable<ParkingAllocationReadDto>> GetByLotIdAsync(int lotId);
        Task<IEnumerable<ParkingAllocationReadDto>> SearchByDateRangeAsync(DateTime from, DateTime to);
        Task<ParkingAllocationReadDto> CreateAsync(ParkingAllocationCreateDto dto);
        Task<ParkingAllocationReadDto> UpdateAsync(int id, ParkingAllocationUpdateDto dto);

        Task<bool> DeleteAsync(int id);

    }
}
