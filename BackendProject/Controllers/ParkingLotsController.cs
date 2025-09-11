using BackendProject.DTO;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackendProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParkingLotsController : ControllerBase
    {
        private readonly IParkingLotService _service;
        private readonly ILogger<ParkingLotsController> _logger;

        public ParkingLotsController(IParkingLotService service, ILogger<ParkingLotsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var lots = await _service.GetAllAsync();
                return Ok(lots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all parking lots.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var lot = await _service.GetByIdAsync(id);
                return lot == null ? NotFound() : Ok(lot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving parking lot with ID: {Id}",id);
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(ParkingLotCreateDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.ParkingLotId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating parking lot.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ParkingLotUpdateDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating parking lot with ID: {Id}",id);
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin")]
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
                _logger.LogError(ex, "Error deleting parking lot with ID: {Id}",id);
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("seed")]
        public async Task<IActionResult> SeedLots()
        {
            try
            {
                var message = await _service.SeedLotsAsync();
                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding parking lots.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [Authorize(Roles = "Admin,User")]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            try
            {
                if (from == default || to == default || from > to)
                    return BadRequest("Invalid date range.");

                var result = await _service.SearchByDateRangeAsync(from, to);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching parking lots from {From} to {To}",from,to);
                return StatusCode(500, "Internal server error.");
            }
        }

    }
}
