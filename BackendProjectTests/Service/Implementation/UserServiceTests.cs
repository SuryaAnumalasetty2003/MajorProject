using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Implementation;
using BackendProject.Service.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
namespace BackendProjectTests.Service.Implementation
{
    [TestClass]
    public class UserServiceTests
    {
        private Mock<IGenericRepository<User>> _mockRepo;
        private Mock<IMapper> _mockMapper;
        private Mock<ILogger<UserService>> _mockLogger;
        private UserService _service;

        [TestInitialize]
        public void Setup()
        {
            _mockRepo = new Mock<IGenericRepository<User>>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<UserService>>();
            _service = new UserService(_mockRepo.Object, _mockMapper.Object, _mockLogger.Object);
        }

        [TestMethod]
        public async Task GetAllAsync_ShouldReturnUsers_WhenUsersExistTrue()
        {
            //Arrange
            var users = new List<User>
            {
                new User { UserId = 1, FullName = "Jagadeesh" },
                new User { UserId = 2, FullName = "Surya" }
            };

            var userDtos = new List<UserReadDto>
            {
                new UserReadDto { UserId = 1, FullName = "Jagadeesh" },
                new UserReadDto { UserId = 2, FullName = "Surya" }
            };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(users);
            _mockMapper.Setup(m => m.Map<IEnumerable<UserReadDto>>(It.IsAny<IEnumerable<User>>())).Returns(userDtos);

            //Act
            var result = (await _service.GetAllAsync()).ToList();
            //Assert
            Assert.AreEqual(users.Count(), result.Count(),"Users and Dtos count Should match");

        }
        [TestMethod]
        public async Task GetAllAsync_ShouldReturnUsers_WhenUsersExistFalse()
        {
            //Arrange
            var users = new List<User>
            {
                new User { UserId = 1, FullName = "Jagadeesh" },
            };

            var userDtos = new List<UserReadDto>
            {
                new UserReadDto { UserId = 1, FullName = "Jagadeesh" },
                new UserReadDto { UserId = 2, FullName = "Surya" }
            };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(users);
            _mockMapper.Setup(m => m.Map<IEnumerable<UserReadDto>>(It.IsAny<IEnumerable<User>>())).Returns(userDtos);

            //Act
            var result = (await _service.GetAllAsync()).ToList();
            //Assert
            Assert.AreNotEqual(users.Count(), result.Count(), "Users and Dtos count Should match");
            
        }
        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnUser_WhenUserExistsTrue()
        {
            var user = new User { UserId = 1, FullName = "Jagadeesh" };
            var dto = new UserReadDto { UserId = 1, FullName = "Jagadeesh" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockMapper.Setup(m => m.Map<UserReadDto>(user)).Returns(dto);

            var result = await _service.GetByIdAsync(1);

            Assert.IsNotNull(result);
            Assert.AreEqual("Jagadeesh", result.FullName);
        }

        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnUser_WhenUserExistsFalse()
        {
            var user = new User { UserId = 1, FullName = "Jagadeesh" };
            var dto = new UserReadDto { UserId = 1, FullName = "Jagadeesh" };

            _mockRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync((User)null);
            _mockMapper.Setup(m => m.Map<UserReadDto>(user)).Returns(dto);

            var result = await _service.GetByIdAsync(2);
            Assert.IsNull(result);

        }


        [TestMethod]
        public async Task RegisterAsync_ShouldReturnCreatedUserTrue()
        {
            //Arrange
            var dto = new RegisterDto { FullName = "Surya", Email = "surya@mail.com", Password = "Surya@123" };
            var user = new User { FullName = "Surya", Email = "surya@mail.com" };
            var createdUser = new User { UserId = 10, FullName = "Surya", Email = "surya@mail.com" };
            var userDto = new UserReadDto { UserId = 10, FullName = "Surya" };

            _mockMapper.Setup(m => m.Map<User>(dto)).Returns(user);
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ReturnsAsync(createdUser);
            _mockMapper.Setup(m => m.Map<UserReadDto>(createdUser)).Returns(userDto);
            //Act
            var result = await _service.RegisterAsync(dto);

            //Assert
            Assert.IsNotNull(result);

            Assert.AreEqual(10, result.UserId);
        }

        [TestMethod]
        public async Task RegisterAsync_ShouldReturnCreatedUserFalse()
        {
            //Arrange
            var dto = new RegisterDto { FullName = "Surya", Email = "surya@mail.com", Password = "Surya@123" };
            var user = new User { FullName = "Surya", Email = "surya@mail.com" };
            var createdUser = new User { UserId = 10, FullName = "Surya", Email = "surya@mail.com" };
            var userDto = new UserReadDto { UserId = 10, FullName = "Surya" };

            _mockMapper.Setup(m => m.Map<User>(dto)).Returns(user);
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ReturnsAsync(createdUser);
            _mockMapper.Setup(m => m.Map<UserReadDto>(createdUser)).Returns(userDto);
            //Act
            var result = await _service.RegisterAsync(dto);
            //Assert
            Assert.IsNotNull(result);
            Assert.AreNotEqual(99, result.UserId);
        }

        [TestMethod]
        public async Task LoginAsync_ShouldReturnUser_WhenValidCredentialsTrue()
        {
            //Arrange
            var dto = new LoginDto { Email = "surya@email.com", Password = "Surya@123" };
            var users = new List<User>
            {
                new User { Email = "surya@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Surya@123")}
            };
            var userDto = new UserReadDto { Email = "surya@mail.com" };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(users);
            _mockMapper.Setup(m => m.Map<UserReadDto>(It.IsAny<User>())).Returns(userDto);
            //Act
            var result = await _service.LoginAsync(dto);
            //Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("surya@mail.com", result.Email);
        }
        [TestMethod]
        public async Task LoginAsync_ShouldReturnUser_WhenValidCredentialsFalse()
        {
            //Arrange
            var dto = new LoginDto { Email = "surya@mail.com", Password = "Surya@123" };
            var users = new List<User>{};
            var userDto = new UserReadDto { Email = "surya@mail.com" };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(users);
            _mockMapper.Setup(m => m.Map<UserReadDto>(It.IsAny<User>())).Returns(userDto);
            //Act
            var result = await _service.LoginAsync(dto);
            //Assert
            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task DeleteAsync_ShouldReturnTrue_WhenUserIsDeletedTrue()
        {
            //Arrange
            var user = new User { UserId = 1 };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockRepo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);
            //Act
            var result = await _service.DeleteAsync(1);
            //Assert
            Assert.IsTrue(result);
        }
        [TestMethod]
        public async Task DeleteAsync_ShouldReturnTrue_WhenUserIsDeletedFalse()
        {
            //Arrange
            var user = new User {};
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((User)null);
            _mockRepo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);
            //Act
            var result = await _service.DeleteAsync(1);
            //Assert
            Assert.IsFalse(result);
        }

        [TestMethod]
        public async Task UpdateAsync_ShouldReturnUpdatedUserTrue()
        {
            //Arrange
            var user = new User { UserId = 1, FullName = "Surya" };
            var dto = new UserUpdateDto { FullName = "Surya Kiran", MobileNumber = "8897745384", Email = "Surya@mail.com" };
            var updatedDto = new UserReadDto { UserId = 1, FullName = "Surya Kiran" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockRepo.Setup(r => r.UpdateAsync(user)).Returns(Task.CompletedTask);
            _mockMapper.Setup(m => m.Map<UserReadDto>(user)).Returns(updatedDto);
            //Act
            var result = await _service.UpdateAsync(1, dto);
            //Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Surya Kiran", result.FullName);
        }

        [TestMethod]
        public async Task UpdateAsync_ShouldReturnUpdatedUserFalsee()
        {
            //Arrage
            var user = new User { UserId = 1, FullName = "Surya" };
            var dto = new UserUpdateDto { FullName = "Surya Kiran", MobileNumber = "8897745384", Email = "Surya@mail.com" };
            var updatedDto = new UserReadDto { UserId = 1, FullName = "Surya Kiran" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockRepo.Setup(r => r.UpdateAsync(user)).Returns(Task.CompletedTask);
            _mockMapper.Setup(m => m.Map<UserReadDto>(user)).Returns(updatedDto);
            //Act
            var result = await _service.UpdateAsync(1, dto);
            //Assert
            Assert.IsNotNull(result);
            Assert.AreNotEqual("Surya", result.FullName);
        }

        [TestMethod]
        public async Task RegisterAsync_ShouldReturnDuplicateEmail_WhenEmailAlreadyExists()
        {
            // Arrange
            var dto = new RegisterDto { Email = "surya@email.com", Password = "pass123" };
            var ex = new DbUpdateException("Conflict", new Exception("IX_Users_Email"));

            _mockMapper.Setup(m => m.Map<User>(It.IsAny<RegisterDto>())).Returns(new User());
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ThrowsAsync(ex);

            // Act
            var result = await _service.RegisterAsync(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("DUPLICATE_EMAIL", result.FullName);
        }

        [TestMethod]
        public async Task RegisterAsync_ShouldReturnDuplicateMobile_WhenMobileAlreadyExists()
        {
            // Arrange
            var dto = new RegisterDto
            {
                Email = "new@email.com",
                Password = "pass123",
                MobileNumber = "9999999999"
            };

            // Simulate DB exception with mobile conflict
            var innerException = new Exception("IX_Users_Mobile");
            var dbUpdateException = new DbUpdateException("Conflict", innerException);

            _mockMapper.Setup(m => m.Map<User>(It.IsAny<RegisterDto>())).Returns(new User());
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ThrowsAsync(dbUpdateException);

            // Act
            var result = await _service.RegisterAsync(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("DUPLICATE_MOBILE", result.FullName);
        }



    }
}
