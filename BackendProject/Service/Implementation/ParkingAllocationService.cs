using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Serilog;

namespace BackendProject.Service.Implementation
{
    public class ParkingAllocationService : IParkingAllocationService
    {
        private readonly IGenericRepository<ParkingAllocation> _repo;
        private readonly IMapper _mapper;

        public ParkingAllocationService(IGenericRepository<ParkingAllocation> repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ParkingAllocationReadDto>> GetAllAsync()
        {
            try
            {
                var allocations = await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot);
                return _mapper.Map<IEnumerable<ParkingAllocationReadDto>>(allocations);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error occurred in GetAllAsync");
                throw;
            }
        }

        public async Task<ParkingAllocationReadDto> GetByIdAsync(int id)
        {
            try
            {
                var allocation = await _repo.GetByIdIncludingAsync(id, a => a.Vehicle, a => a.ParkingLot);
                if (allocation == null) {
                    return null;
                }
                return _mapper.Map<ParkingAllocationReadDto>(allocation);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error occurred in GetByIdAsync with ID: {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ParkingAllocationReadDto>> GetByVehicleIdAsync(int vehicleId)
        {
            try
            {
                var allocations = await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot);
                var filtered = allocations.Where(a => a.VehicleId == vehicleId);
                return _mapper.Map<IEnumerable<ParkingAllocationReadDto>>(filtered);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error occurred in GetByVehicleIdAsync with VehicleId: {VehicleId}", vehicleId);
                throw;
            }
        }

        public async Task<IEnumerable<ParkingAllocationReadDto>> GetByLotIdAsync(int lotId)
        {
            try
            {
                var all = await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot);
                return _mapper.Map<IEnumerable<ParkingAllocationReadDto>>(all.Where(a => a.ParkingLotId == lotId));
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error occurred in GetByLotIdAsync with LotId: {LotId}", lotId);
                throw;
            }
        }

        public async Task<IEnumerable<ParkingAllocationReadDto>> SearchByDateRangeAsync(DateTime from, DateTime to)
        {
            try
            {
                var all = await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot);
                return _mapper.Map<IEnumerable<ParkingAllocationReadDto>>(all
                    .Where(a => a.AllocatedFromDate <= to && a.AllocatedUptoDate >= from));
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in SearchByDateRangeAsync from {From} to {To}", from, to);
                throw;
            }
        }

        public async Task<ParkingAllocationReadDto> CreateAsync(ParkingAllocationCreateDto dto)
        {
            try
            {
                var fromDate = dto.AllocatedFromDate.ToDateTime(TimeOnly.MinValue);
                var toDate = dto.AllocatedUptoDate.ToDateTime(TimeOnly.MaxValue);

                if (toDate < fromDate)
                    throw new Exception("End date must be greater than or equal to start date.");

                var existing = await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot);

                bool conflict = existing.Any(a =>
                    a.ParkingLotId == dto.ParkingLotId &&
                    a.AllocatedFromDate <= toDate &&
                    a.AllocatedUptoDate >= fromDate);

                if (conflict)
                    throw new Exception("Selected slot is already booked for the given time range.");

                bool vehicleOverlap = existing.Any(a =>
                    a.VehicleId == dto.VehicleId &&
                    a.AllocatedFromDate <= toDate &&
                    a.AllocatedUptoDate >= fromDate);

                if (vehicleOverlap)
                    throw new Exception("This vehicle is already allocated to another parking lot during the selected period.");

                var allocation = _mapper.Map<ParkingAllocation>(dto);
                allocation.AllocatedFromDate = fromDate;
                allocation.AllocatedUptoDate = toDate;

                await _repo.AddAsync(allocation);

                var full = (await _repo.GetAllIncludingAsync(a => a.Vehicle, a => a.ParkingLot))
                    .FirstOrDefault(a => a.AllocationId == allocation.AllocationId);

                return _mapper.Map<ParkingAllocationReadDto>(full);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in CreateAsync for VehicleId: {VehicleId}, ParkingLotId: {ParkingLotId}", dto.VehicleId, dto.ParkingLotId);
                throw;
            }
        }

        public async Task<ParkingAllocationReadDto> UpdateAsync(int id, ParkingAllocationUpdateDto dto)
        {
            try
            {
                var fromDate = dto.AllocatedFromDate.ToDateTime(TimeOnly.MinValue);
                var toDate = dto.AllocatedUptoDate.ToDateTime(TimeOnly.MaxValue);

                if (toDate < fromDate)
                    throw new Exception("End date must be greater than or equal to start date.");

                var existing = await _repo.GetByIdIncludingAsync(id, a => a.Vehicle, a => a.ParkingLot);
                if (existing == null) return null;

                var all = await _repo.GetAllAsync();
                bool conflict = all.Any(a =>
                    a.AllocationId != id &&
                    a.ParkingLotId == dto.ParkingLotId &&
                    a.AllocatedFromDate <= toDate &&
                    a.AllocatedUptoDate >= fromDate);

                if (conflict)
                    throw new Exception("Cannot extend: selected slot is already booked by another user during that time.");

                _mapper.Map(dto, existing);
                existing.AllocatedFromDate = fromDate;
                existing.AllocatedUptoDate = toDate;

                await _repo.UpdateAsync(existing);

                var updated = await _repo.GetByIdIncludingAsync(id, a => a.Vehicle, a => a.ParkingLot);
                return _mapper.Map<ParkingAllocationReadDto>(updated);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in UpdateAsync for ID: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repo.GetByIdIncludingAsync(id, a => a.Vehicle, a => a.ParkingLot);
                if (existing == null) return false;

                await _repo.DeleteAsync(id);
                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in DeleteAsync for ID: {Id}", id);
                throw;
            }
        }
    }
}
