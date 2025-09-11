using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Implementation;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace BackendProjectTests.Service.Implementation
{
    [TestClass()]
    public class VehicleServiceTests
    {
        private Mock<IGenericRepository<Vehicle>> _mockRepo;
        private Mock<IvehicleRepository> _mockVehicleRepo;
        private Mock<IMapper> _mockMapper;
        private Mock<ILogger<VehicleService>> _mockLogger;
        private VehicleService _service;

        [TestInitialize]
        public void Setup()
        {
            _mockRepo = new Mock<IGenericRepository<Vehicle>>();
            _mockVehicleRepo = new Mock<IvehicleRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<VehicleService>>();
            _service = new VehicleService(_mockRepo.Object, _mockMapper.Object, _mockVehicleRepo.Object, _mockLogger.Object);
        }

        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnVehicle_WhenVehicleExists()
        {
            var vehicle = new Vehicle { VehicleId = 1, Make = "Toyota" };
            var vehicleDto = new VehicleReadDto { VehicleId = 1, Make = "Toyota" };

            _mockVehicleRepo.Setup(r => r.GetVehicleWithUserAsync(1)).ReturnsAsync(vehicle);
            _mockMapper.Setup(m => m.Map<VehicleReadDto>(vehicle)).Returns(vehicleDto);

            var result = await _service.GetByIdAsync(1);

            Assert.IsNotNull(result);
            Assert.AreEqual("Toyota", result.Make);
        }

        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnNull_WhenVehicleDoesNotExist()
        {
           _mockVehicleRepo.Setup(r => r.GetVehicleWithUserAsync(1)).ReturnsAsync((Vehicle)null);

            var result = await _service.GetByIdAsync(1);

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task GetByUserIdAsync_ShouldReturnVehicles_WhenUserHasVehicles()
        {
            var vehicles = new List<Vehicle> { new Vehicle { UserId = 1, Make = "Honda" } };
            var vehicleDtos = new List<VehicleReadDto> { new VehicleReadDto { Make = "Honda" } };

            _mockRepo.Setup(r => r.GetAllIncludingAsync(It.IsAny<Expression<Func<Vehicle, object>>[]>()))
         .ReturnsAsync(vehicles);

            _mockMapper.Setup(m => m.Map<IEnumerable<VehicleReadDto>>(It.IsAny<IEnumerable<Vehicle>>()))
                       .Returns(vehicleDtos);

            var result = await _service.GetByUserIdAsync(1);

            Assert.AreEqual(1, result.Count());
        }
        [TestMethod]
        public async Task GetByUserIdAsync_ShouldReturnEmpty_WhenUserHasNoVehicles()
        {
            
            var vehicles = new List<Vehicle>(); 
            var vehicleDtos = new List<VehicleReadDto>(); 

            _mockRepo.Setup(r => r.GetAllIncludingAsync(It.IsAny<Expression<Func<Vehicle, object>>[]>()))
                     .ReturnsAsync(vehicles);

            _mockMapper.Setup(m => m.Map<IEnumerable<VehicleReadDto>>(vehicles))
                       .Returns(vehicleDtos);

            // Act
            var result = await _service.GetByUserIdAsync(1);

            // Assert
            Assert.IsNotNull(result); 
            Assert.AreEqual(0, result.Count()); 
        }


        [TestMethod]
        public async Task CreateAsync_ShouldReturnVehicle_WhenValid()
        {
            var dto = new VehicleCreateDto { UserId = 1, Make = "Hyundai", NumberPlate = "ABC123" };
            var vehicle = new Vehicle { UserId = 1, Make = "Hyundai", NumberPlate = "ABC123" };
            var created = new Vehicle { VehicleId = 1, UserId = 1, Make = "Hyundai" };
            var readDto = new VehicleReadDto { VehicleId = 1, Make = "Hyundai" };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Vehicle>());
            _mockMapper.Setup(m => m.Map<Vehicle>(dto)).Returns(vehicle);
            _mockRepo.Setup(r => r.AddAsync(vehicle)).ReturnsAsync(created);
            _mockMapper.Setup(m => m.Map<VehicleReadDto>(created)).Returns(readDto);

            var result = await _service.CreateAsync(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.VehicleId);
        }

        [TestMethod]
        [ExpectedException(typeof(InvalidOperationException))]
        public async Task CreateAsync_ShouldThrowException_WhenUserHasVehicle()
        {
            var dto = new VehicleCreateDto { UserId = 1, Make = "Hyundai" };
            var existingVehicles = new List<Vehicle> { new Vehicle { UserId = 1 } };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(existingVehicles);

            await _service.CreateAsync(dto); // should throw
        }

        [TestMethod]
        public async Task DeleteAsync_ShouldReturnTrue_WhenVehicleExists()
        {
            var vehicle = new Vehicle { VehicleId = 1 };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);
            _mockRepo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);

            var result = await _service.DeleteAsync(1);

            Assert.IsTrue(result);
        }

        [TestMethod]
        public async Task DeleteAsync_ShouldReturnFalse_WhenVehicleNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Vehicle)null);

            var result = await _service.DeleteAsync(1);

            Assert.IsFalse(result);
        }

        [TestMethod]
        public async Task UpdateAsync_ShouldReturnUpdatedVehicle_WhenValid()
        {
            var dto = new VehicleUpdateDto { Make = "Nissan" };
            var vehicle = new Vehicle { VehicleId = 1, Make = "Old" };
            var readDto = new VehicleReadDto { VehicleId = 1, Make = "Nissan" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);
            _mockRepo.Setup(r => r.UpdateAsync(vehicle)).Returns(Task.CompletedTask);
            _mockMapper.Setup(m => m.Map<VehicleReadDto>(vehicle)).Returns(readDto);

            var result = await _service.UpdateAsync(1, dto);

            Assert.IsNotNull(result);
            Assert.AreEqual("Nissan", result.Make);
        }

        [TestMethod]
        public async Task UpdateAsync_ShouldReturnNull_WhenVehicleNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Vehicle)null);

            var result = await _service.UpdateAsync(1, new VehicleUpdateDto());

            Assert.IsNull(result);
        }
    }
}