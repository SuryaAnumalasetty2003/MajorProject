using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Microsoft.Extensions.Logging;

namespace BackendProject.Service.Implementation
{
    public class VehicleService : IVehicleService
    {
        private readonly IGenericRepository<Vehicle> _repo;
        private readonly IvehicleRepository _vehicleRepo;
        private readonly IMapper _mapper;
        private readonly ILogger<VehicleService> _logger;

        public VehicleService(
            IGenericRepository<Vehicle> repo,
            IMapper mapper,
            IvehicleRepository vehicleRepo,
            ILogger<VehicleService> logger)
        {
            _repo = repo;
            _mapper = mapper;
            _vehicleRepo = vehicleRepo;
            _logger = logger;
        }

        public async Task<VehicleReadDto> GetByIdAsync(int id)
        {
            try
            {
                var vehicle = await _vehicleRepo.GetVehicleWithUserAsync(id);
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle with ID {VehicleId} not found or deleted.", id);
                    return null;
                }

                _logger.LogInformation("Fetched vehicle with ID {VehicleId}.", id);
                return _mapper.Map<VehicleReadDto>(vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicle with ID {VehicleId}.", id);
                return null;
            }
        }

        public async Task<IEnumerable<VehicleReadDto>> GetByUserIdAsync(int userId)
        {
            try
            {
                var vehicles = await _repo.GetAllIncludingAsync(v => v.User);
                var result = vehicles.Where(v => v.UserId == userId);
                _logger.LogInformation("Fetched {Count} vehicles for User ID {UserId}.", result.Count(), userId);
                return _mapper.Map<IEnumerable<VehicleReadDto>>(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicles for User ID {UserId}.", userId);
                return Enumerable.Empty<VehicleReadDto>();
            }
        }

        public async Task<IEnumerable<VehicleReadDto>> GetAllAsync()
        {
            try
            {
                var vehicles = await _repo.GetAllIncludingAsync(v => v.User);
                _logger.LogInformation("Fetched all non-deleted vehicles: {Count} found.", vehicles.Count());
                return _mapper.Map<IEnumerable<VehicleReadDto>>(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all vehicles.");
                return Enumerable.Empty<VehicleReadDto>();
            }
        }

        public async Task<IEnumerable<VehicleReadDto>> SearchAsync(string name)
        {
            try
            {
                var vehicles = await _repo.GetAllIncludingAsync(v => v.User);
                name = name.ToLower();

                var filtered = vehicles.Where(v =>
                    
                        v.Make.ToLower().Contains(name) ||
                        v.NumberPlate.ToLower().Contains(name) ||
                        v.User != null && v.User.FullName.ToLower().Contains(name)
                    
                );

                _logger.LogInformation("Searched vehicles by '{Name}', found {Count} result(s).", name, filtered.Count());
                return _mapper.Map<IEnumerable<VehicleReadDto>>(filtered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles by name '{Name}'.", name);
                return Enumerable.Empty<VehicleReadDto>();
            }
        }

        public async Task<VehicleReadDto> CreateAsync(VehicleCreateDto dto)
        {
            try
            {
                var existing = await _repo.GetAllAsync();
                if (existing.Any(v => v.UserId == dto.UserId))
                {
                    _logger.LogWarning("User ID {UserId} already has a vehicle registered.", dto.UserId);
                    throw new InvalidOperationException("User already has a registered vehicle.");
                }

                var entity = _mapper.Map<Vehicle>(dto);
                var created = await _repo.AddAsync(entity);
                _logger.LogInformation("Vehicle registered for User ID {UserId}, Plate: {Plate}.", dto.UserId, dto.NumberPlate);

                return _mapper.Map<VehicleReadDto>(created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Vehicle creation failed due to business rule for User ID {UserId}.", dto.UserId);
                throw; // Let controller catch this
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle for User ID {UserId}.", dto.UserId);
                return null;
            }
        }

        public async Task<VehicleReadDto> UpdateAsync(int id, VehicleUpdateDto dto)
        {
            try
            {
                var existing = await _repo.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Update failed. Vehicle with ID {VehicleId} not found or deleted.", id);
                    return null;
                }

                _mapper.Map(dto, existing);
                await _repo.UpdateAsync(existing);
                _logger.LogInformation("Updated vehicle with ID {VehicleId}.", id);
                return _mapper.Map<VehicleReadDto>(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle with ID {VehicleId}.", id);
                return null;
            }
        }

        public async Task<IEnumerable<VehicleReadDto>> SearchByNumberPlateAsync(string plate)
        {
            try
            {
                var vehicles = await _repo.GetAllIncludingAsync(v => v.User);
                plate = plate.ToLower();

                var filtered = vehicles.Where(v =>
                    v.NumberPlate.ToLower().Contains(plate)
                );

                _logger.LogInformation("Searched vehicles by number plate '{Plate}', found {Count}.", plate, filtered.Count());
                return _mapper.Map<IEnumerable<VehicleReadDto>>(filtered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching vehicles by number plate '{Plate}'.", plate);
                return Enumerable.Empty<VehicleReadDto>();
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var entity = await _repo.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Delete failed. Vehicle ID {VehicleId} not found or already deleted.", id);
                    return false;
                }

                await _repo.DeleteAsync(id);
                _logger.LogInformation("Deleted vehicle with ID {VehicleId}.", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle with ID {VehicleId}.", id);
                return false;
            }
        }
    }
}
