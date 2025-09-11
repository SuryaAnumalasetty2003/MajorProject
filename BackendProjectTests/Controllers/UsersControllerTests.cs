using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace BackendProject.Controllers.Tests
{
    
    [TestClass]
    public class UsersControllerTests
    {
        private Mock<IUserService> _mockService;
        private Mock<IJwtService> _mockJwt;
        //private Mock<IGenericRepository<User>> _mockUserRepo;
        private Mock<ILogger<UsersController>> _mockLogger;
        private UsersController _controller;
        [TestInitialize]
        public void Setup()
        {
            _mockService = new Mock<IUserService>();
            _mockJwt = new Mock<IJwtService>();
            _mockLogger = new Mock<ILogger<UsersController>>();
            _controller = new UsersController(_mockService.Object, _mockJwt.Object, _mockLogger.Object);
        }
        //[TestMethod()]
        [TestMethod()]
        public async Task GetAll_ShouldReturnOkWithUsersTrue()
        {
            //Arrange
            var users = new List<UserReadDto>
            {
                new UserReadDto { UserId = 1, FullName = "User 1" },
                new UserReadDto { UserId = 2, FullName = "User 2" }
            };

            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(users);
            //Act
            var result = await _controller.GetAll();
            //Assert
            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);
            Assert.AreEqual(200, ok.StatusCode);
        }
        [TestMethod]
        public async Task GetAll_ShouldReturnOkWithUsersFalse()
        {
            // Arrange
            _mockService.Setup(s => s.GetAllAsync()).ThrowsAsync(new Exception("Database failure"));

            // Act
            var result = await _controller.GetAll();

            // Assert
            var objectResult = result as ObjectResult;
            Assert.IsNotNull(objectResult);
            Assert.AreEqual(500, objectResult.StatusCode);
            Assert.AreEqual("Internal server error", objectResult.Value); // Assuming you return this message
        }

        [TestMethod]
        public async Task Register_ShouldReturnOk_WhenUserIsCreated()
        {
            //Arrange
            var dto = new RegisterDto { Email = "surya@gmail.com" };
            var resultUser = new UserReadDto { UserId = 1, Email = "surya@email.com", FullName = "Surya", MobileNumber = "8897745384" };

            _mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(resultUser);
            //Act
            var result = await _controller.Register(dto);
            //Arrange
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
        }
        [TestMethod]
        public async Task Register_ShouldReturnBadRequest_WhenEmailExists()
        {
            var dto = new RegisterDto { Email = "surya@gmail.com" };
            var resultUser = new UserReadDto { FullName = "DUPLICATE_EMAIL" };

            _mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(resultUser);

            var result = await _controller.Register(dto);

            var badResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badResult);
            Assert.AreEqual(400, badResult.StatusCode);
        }
        [TestMethod]
        public async Task Register_ShouldReturnBadRequest_WhenMobileNumberExists()
        {
            var dto = new RegisterDto { MobileNumber = "8897745384" };
            var resultUser = new UserReadDto { FullName = "DUPLICATE_MOBILE" };

            _mockService.Setup(s => s.RegisterAsync(dto)).ReturnsAsync(resultUser);

            var result = await _controller.Register(dto);

            var badResult = result as BadRequestObjectResult;
            Assert.IsNotNull(badResult);
            Assert.AreEqual(400, badResult.StatusCode);
        }

        [TestMethod]
        public async Task Login_ShouldReturnToken_WhenValidCredentials()
        {
            var dto = new LoginDto { Email = "user@mail.com", Password = "pass" };
            var userDto = new UserReadDto { UserId = 1, FullName = "User" };
            var user = new User { UserId = 1 };

            _mockService.Setup(s => s.LoginAsync(dto)).ReturnsAsync(userDto);
            _mockService.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockJwt.Setup(j => j.GenerateToken(user)).Returns("token123");
            var result = await _controller.Login(dto);

            var okResult = result as OkObjectResult;
            var tokenValue = okResult.Value.GetType().GetProperty("token")?.GetValue(okResult.Value, null);
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual("token123", tokenValue);
            //Assert.IsTrue(((dynamic)okResult.Value).token == "token123");
        }

        [TestMethod]
        public async Task Login_ShouldReturnUnauthorized_WhenInvalid()
        {
            var dto = new LoginDto { Email = "fake@mail.com", Password = "wrong" };

            _mockService.Setup(s => s.LoginAsync(dto)).ReturnsAsync((UserReadDto)null);

            var result = await _controller.Login(dto);

            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }
        [TestMethod]
        public async Task Delete_ShouldReturnNoContent_WhenSuccessful()
        {
            _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

            var result = await _controller.Delete(1);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));
        }

        [TestMethod]
        public async Task Delete_ShouldReturnNotFound_WhenUserNotExist()
        {
            _mockService.Setup(s => s.DeleteAsync(100)).ReturnsAsync(false);

            var result = await _controller.Delete(100);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task Update_ShouldReturnOk_WhenSuccessful()
        {
            var updateDto = new UserUpdateDto { FullName = "Updated" };
            var updatedUser = new UserReadDto { UserId = 1, FullName = "Updated" };

            _mockService.Setup(s => s.UpdateAsync(1, updateDto)).ReturnsAsync(updatedUser);

            var result = await _controller.Update(1, updateDto);

            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);
            Assert.AreEqual("Updated", ((UserReadDto)ok.Value).FullName);
        }
        [TestMethod]
        public async Task Update_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var updateDto = new UserUpdateDto { FullName = "Updated" };

            _mockService.Setup(s => s.UpdateAsync(1, updateDto)).ReturnsAsync((UserReadDto)null);

            // Act
            var result = await _controller.Update(1, updateDto);

            // Assert
            var notFound = result as NotFoundObjectResult;
            Assert.IsNotNull(notFound);
            Assert.AreEqual(404, notFound.StatusCode);
            Assert.AreEqual("User Not Found", notFound.Value);
        }



    }
}