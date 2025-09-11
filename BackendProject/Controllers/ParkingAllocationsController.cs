using BackendProject.DTO;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParkingAllocationsController : ControllerBase
    {
        private readonly IParkingAllocationService _service;
        private readonly ILogger<ParkingAllocationsController> _logger;

        public ParkingAllocationsController(IParkingAllocationService service, ILogger<ParkingAllocationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                return Ok(await _service.GetAllAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all allocations");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                return result == null ? NotFound() : Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching allocation by id: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("by-vehicle/{vehicleId}")]
        public async Task<IActionResult> GetByVehicleId(int vehicleId)
        {
            try
            {
                return Ok(await _service.GetByVehicleIdAsync(vehicleId));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching allocations by vehicleId: {VehicleId}",vehicleId);
                return StatusCode(500, "Internal server error");
            }
        }
        [Authorize(Roles = "Admin,User")]
        [HttpPost]
        public async Task<IActionResult> Create(ParkingAllocationCreateDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return result == null
                    ? Conflict("Slot already booked")
                    : CreatedAtAction(nameof(GetById), new { id = result.AllocationId }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating parking allocation");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ParkingAllocationUpdateDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);
                return result == null
                    ? Conflict("Conflict or Not Found")
                    : Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating allocation id: {Id}",id);
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting allocation id: {Id}",id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
