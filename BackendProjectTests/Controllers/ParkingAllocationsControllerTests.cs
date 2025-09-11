using BackendProject.Controllers;
using BackendProject.DTO;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackendProject.Controllers.Tests
{
    [TestClass()]
    public class ParkingAllocationsControllerTests
    {
        private Mock<IParkingAllocationService> _mockService;
        private Mock<ILogger<ParkingAllocationsController>> _mockLogger;
        private ParkingAllocationsController _controller;

        [TestInitialize]
        public void Setup()
        {
            _mockService = new Mock<IParkingAllocationService>();
            _mockLogger = new Mock<ILogger<ParkingAllocationsController>>();
            _controller = new ParkingAllocationsController(_mockService.Object, _mockLogger.Object);
        }

        [TestMethod]
        public async Task GetAll_ShouldReturnOkWithData()
        {
            // Arrange
            var data = new List<ParkingAllocationReadDto> { new ParkingAllocationReadDto { AllocationId = 1 } };
            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(data);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(data, okResult.Value);
        }

        [TestMethod]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            var dto = new ParkingAllocationReadDto { AllocationId = 1 };
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(dto);

            var result = await _controller.GetById(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(dto, okResult.Value);
        }

        [TestMethod]
        public async Task GetById_ShouldReturnNotFound_WhenNotFound()
        {
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((ParkingAllocationReadDto)null);

            var result = await _controller.GetById(1);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task GetByVehicleId_ShouldReturnOkWithData()
        {
            var data = new List<ParkingAllocationReadDto> { new ParkingAllocationReadDto { AllocationId = 2 } };
            _mockService.Setup(s => s.GetByVehicleIdAsync(1)).ReturnsAsync(data);

            var result = await _controller.GetByVehicleId(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(data, okResult.Value);
        }

        [TestMethod]
        public async Task Create_ShouldReturnCreated_WhenSuccessful()
        {
            var createDto = new ParkingAllocationCreateDto();
            var readDto = new ParkingAllocationReadDto { AllocationId = 5 };

            _mockService.Setup(s => s.CreateAsync(createDto)).ReturnsAsync(readDto);

            var result = await _controller.Create(createDto);

            var created = result as CreatedAtActionResult;
            Assert.IsNotNull(created);
            Assert.AreEqual(201, created.StatusCode);
            Assert.AreEqual(readDto, created.Value);
        }

        [TestMethod]
        public async Task Create_ShouldReturnConflict_WhenNullReturned()
        {
            var createDto = new ParkingAllocationCreateDto();

            _mockService.Setup(s => s.CreateAsync(createDto)).ReturnsAsync((ParkingAllocationReadDto)null);

            var result = await _controller.Create(createDto);

            var conflict = result as ConflictObjectResult;
            Assert.IsNotNull(conflict);
            Assert.AreEqual(409, conflict.StatusCode);
        }

        [TestMethod]
        public async Task Update_ShouldReturnOk_WhenSuccessful()
        {
            var updateDto = new ParkingAllocationUpdateDto();
            var resultDto = new ParkingAllocationReadDto { AllocationId = 7 };

            _mockService.Setup(s => s.UpdateAsync(7, updateDto)).ReturnsAsync(resultDto);

            var result = await _controller.Update(7, updateDto);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(resultDto, okResult.Value);
        }

        [TestMethod]
        public async Task Update_ShouldReturnConflict_WhenNull()
        {
            var updateDto = new ParkingAllocationUpdateDto();

            _mockService.Setup(s => s.UpdateAsync(8, updateDto)).ReturnsAsync((ParkingAllocationReadDto)null);

            var result = await _controller.Update(8, updateDto);

            var conflict = result as ConflictObjectResult;
            Assert.IsNotNull(conflict);
            Assert.AreEqual(409, conflict.StatusCode);
        }

        [TestMethod]
        public async Task Delete_ShouldReturnNoContent_WhenSuccessful()
        {
            _mockService.Setup(s => s.DeleteAsync(3)).ReturnsAsync(true);

            var result = await _controller.Delete(3);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));
        }

        [TestMethod]
        public async Task Delete_ShouldReturnNotFound_WhenNotFound()
        {
            _mockService.Setup(s => s.DeleteAsync(99)).ReturnsAsync(false);

            var result = await _controller.Delete(99);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    }
}