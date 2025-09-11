using BackendProject.DTO;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehiclesController : ControllerBase
    {
        private readonly IVehicleService _service;
        private readonly ILogger<VehiclesController> _logger;

        public VehiclesController(IVehicleService service, ILogger<VehiclesController> logger)
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
                var vehicles = await _service.GetAllAsync();
                _logger.LogInformation("Retrieved all Vehicles");
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all vehicles");
                return StatusCode(500, "An error occurred while fetching vehicles.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var vehicle = await _service.GetByIdAsync(id);
                if (vehicle == null)
                {
                    _logger.LogWarning("Vehicle with ID {VehicleId} not found.", id);
                    return NotFound();
                }
                _logger.LogInformation("Fetched Vehicle with ID {VehicleId}", id);
                return Ok(vehicle);
                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicle with ID {Id}", id);
                return StatusCode(500, "An error occurred while fetching the vehicle.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            try
            {
                var vehicles = await _service.GetByUserIdAsync(userId);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching vehicles for user ID {UserId}", userId);
                return StatusCode(500, "An error occurred while fetching the user's vehicles.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("search")]
        public async Task<IActionResult> Search(string name)
        {
            try
            {
                var vehicles = await _service.SearchAsync(name);
                return Ok(vehicles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching for vehicles by name {Name}", name);
                return StatusCode(500, "An error occurred while searching for vehicles.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("search-by-plate")]
        public async Task<IActionResult> SearchByNumberPlate([FromQuery] string plate)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(plate))
                    return BadRequest("Number plate query is required");

                var result = await _service.SearchByNumberPlateAsync(plate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching by number plate {Plate}", plate);
                return StatusCode(500, "An error occurred while searching by number plate.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPost]
        public async Task<IActionResult> Create(VehicleCreateDto dto)
        {
            try
            {
                var vehicle = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = vehicle.VehicleId }, vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating vehicle for user ID {UserId}", dto.UserId);
                return StatusCode(500, "An error occurred while creating the vehicle.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, VehicleUpdateDto dto)
        {
            try
            {
                var vehicle = await _service.UpdateAsync(id, dto);
                return vehicle == null ? NotFound() : Ok(vehicle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating vehicle with ID {Id}", id);
                return StatusCode(500, "An error occurred while updating the vehicle.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                return result ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting vehicle with ID {Id}", id);
                return StatusCode(500, "An error occurred while deleting the vehicle.");
            }
        }
    }
}
