using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Microsoft.EntityFrameworkCore;

namespace BackendProject.Service.Implementation
{
    public class ParkingLotService : IParkingLotService
    {
        private readonly IGenericRepository<ParkingLot> _repo;
        private readonly IMapper _mapper;
        private readonly IParkingLotRepository _parkingLotRepository;
        private readonly ILogger<ParkingLotService> _logger;

        public ParkingLotService(
            IGenericRepository<ParkingLot> repo,
            IMapper mapper,
            IParkingLotRepository parkingLotRepository,
            ILogger<ParkingLotService> logger)
        {
            _repo = repo;
            _mapper = mapper;
            _parkingLotRepository = parkingLotRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<ParkingLotReadDto>> GetAllAsync()
        {
            try
            {
                var lots = await _repo.GetAllIncludingAsync(l => l.Allocations);
                var today = DateTime.Today;

                var result = lots
                    
                    .Select(lot =>
                    {
                        var isOccupied = lot.Allocations.Any(a =>
                            
                            a.AllocatedFromDate.Date <= today &&
                            a.AllocatedUptoDate.Date >= today);

                        var dto = _mapper.Map<ParkingLotReadDto>(lot);
                        dto.IsOccupied = isOccupied;
                        return dto;
                    });

                _logger.LogInformation("Fetched {Count} parking lots.", result.Count());
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllAsync");
                throw;
            }
        }

        public async Task<ParkingLotReadDto> GetByIdAsync(int id)
        {
            try
            {
                var lot = await _repo.GetByIdAsync(id);
                if (lot == null)
                {
                    _logger.LogWarning("Parking lot with ID {Id} not found or deleted.", id);
                    return null;
                }

                return _mapper.Map<ParkingLotReadDto>(lot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetByIdAsync with ID {Id}", id);
                throw;
            }
        }

        public async Task<ParkingLotReadDto> CreateAsync(ParkingLotCreateDto dto)
        {
            try
            {
                var entity = _mapper.Map<ParkingLot>(dto);
                var created = await _repo.AddAsync(entity);
                _logger.LogInformation("Created new parking lot with ID {Id}", created.ParkingLotId);
                return _mapper.Map<ParkingLotReadDto>(created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateAsync");
                throw;
            }
        }

        public async Task<ParkingLotReadDto> UpdateAsync(int id, ParkingLotUpdateDto dto)
        {
            try
            {
                var existing = await _repo.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Attempted to update non-existent parking lot ID {Id}", id);
                    return null;
                }

                _mapper.Map(dto, existing);
                await _repo.UpdateAsync(existing);

                _logger.LogInformation("Updated parking lot ID {Id}", id);
                return _mapper.Map<ParkingLotReadDto>(existing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateAsync for ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var lot = await _repo.GetByIdAsync(id);
                if (lot == null)
                {
                    _logger.LogWarning("Attempted to delete non-existent or already deleted parking lot ID {Id}", id);
                    return false;
                }

                await _repo.DeleteAsync(id);
                _logger.LogInformation("Deleted parking lot ID {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteAsync for ID {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ParkingLotReadDto>> SearchByDateRangeAsync(DateTime from, DateTime to)
        {
            try
            {
                var overlappingAllocations = await _parkingLotRepository
                    .Allocations
                    .Where(a => 
                                a.AllocatedFromDate <= to &&
                                a.AllocatedUptoDate >= from)
                    .Select(a => a.ParkingLotId)
                    .Distinct()
                    .ToListAsync();

                var availableLots = await _parkingLotRepository
                    .Lots
                    .Where(l => !overlappingAllocations.Contains(l.ParkingLotId))
                    .ToListAsync();

                _logger.LogInformation("Found {Count} available lots between {From} and {To}.", availableLots.Count, from, to);
                return _mapper.Map<IEnumerable<ParkingLotReadDto>>(availableLots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SearchByDateRangeAsync");
                throw;
            }
        }

        public async Task<string> SeedLotsAsync()
        {
            try
            {
                var all = await _repo.GetAllAsync();
                if (all.Any())
                {
                    _logger.LogInformation("Seed skipped: parking lots already exist.");
                    return "Lots already seeded.";
                }

                var lots = new List<ParkingLot>();
                for (char section = 'A'; section <= 'Z'; section++)
                {
                    for (int number = 1; number <= 10; number++)
                    {
                        lots.Add(new ParkingLot
                        {
                            LotNumber = $"{section}{number:D2}",
                            Location = section <= 'M' ? "Ground Floor" : "First Floor",
                        });
                    }
                }

                foreach (var lot in lots)
                {
                    await _repo.AddAsync(lot);
                }

                _logger.LogInformation("Seeded {Count} parking lots.", lots.Count);
                return $"Seeded {lots.Count} parking lots from A01 to Z10.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SeedLotsAsync");
                throw;
            }
        }
    }
}
