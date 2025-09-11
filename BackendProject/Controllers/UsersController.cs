using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BackendProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;
        private readonly IJwtService _jwtService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserService service,
            IJwtService jwtService,
            ILogger<UsersController> logger)
        {
            _service = service;
            _jwtService = jwtService;
            _logger = logger;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _service.GetAllAsync();
                _logger.LogInformation("Retrieved all users.");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching all users.");
                return StatusCode(500, "Internal server error");
            }
        }
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                var user = await _service.RegisterAsync(dto);

                if (user == null)
                    return StatusCode(500, "Internal server error");

                if (user.FullName == "DUPLICATE_EMAIL")
                    return BadRequest(new { message = "DUPLICATE_EMAIL" });

                if (user.FullName == "DUPLICATE_MOBILE")
                    return BadRequest(new { message = "DUPLICATE_MOBILE" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for {Email}", dto.Email);
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var contentType = Request.ContentType;
                Console.WriteLine($"Content-Type: {contentType}");
                var user = await _service.LoginAsync(dto);
                if (user == null)
                {
                    _logger.LogWarning("Invalid login attempt for email {Email}", dto.Email);
                    return Unauthorized("Invalid credentials");
                }

                var dbUser = await _service.GetByIdAsync(user.UserId);
                var token = _jwtService.GenerateToken(dbUser);

                _logger.LogInformation("User {Email} logged in successfully", dto.Email);
                return Ok(new { user, token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for email {Email}", dto.Email);
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
                if (!deleted)
                {
                    _logger.LogWarning("Attempt to delete non-existing or already deleted user ID {UserId}", id);
                    return NotFound();
                }

                _logger.LogInformation("User with ID {UserId} deleted successfully", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto dto)
        {
            try
            {
                var user = await _service.UpdateAsync(id, dto);
                if (user == null)
                {
                    _logger.LogWarning("Update failed. User ID {UserId} not found or deleted.", id);
                    return NotFound("User Not Found");
                }

                _logger.LogInformation("User with ID {UserId} updated successfully", id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID {UserId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
