using BackendProject.DTO;
using BackendProject.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;


namespace BackendProject.Controllers.Tests
{
    [TestClass()]
    public class VehiclesControllerTests
    {
        private VehiclesController _controller;
        private Mock<IVehicleService> _mockService;
        private Mock<ILogger<VehiclesController>> _mockLogger;

        [TestInitialize]
        public void Setup()
        {
            _mockService = new Mock<IVehicleService>();
            _mockLogger = new Mock<ILogger<VehiclesController>>();
            _controller = new VehiclesController(_mockService.Object, _mockLogger.Object);
        }
        [TestMethod]
        public async Task GetAll_ReturnsOk_WithVehicleList()
        {
            var vehicles = new List<VehicleReadDto> { new VehicleReadDto { Make = "Toyota" } };
            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(vehicles);

            var result = await _controller.GetAll();

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(vehicles, okResult.Value);
        }
        [TestMethod]
        public async Task GetAll_ThrowsException_Returns500()
        {
            _mockService.Setup(s => s.GetAllAsync()).ThrowsAsync(new System.Exception("DB error"));

            var result = await _controller.GetAll();

            var statusResult = result as ObjectResult;
            Assert.IsNotNull(statusResult);
            Assert.AreEqual(500, statusResult.StatusCode);
        }
        [TestMethod]
        public async Task GetById_ReturnsOk_WhenVehicleExists()
        {
            var vehicle = new VehicleReadDto { VehicleId = 1, Make = "Honda" };
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(vehicle);

            var result = await _controller.GetById(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(vehicle, okResult.Value);
        }
        [TestMethod]
        public async Task GetById_ReturnsNotFound_WhenVehicleDoesNotExist()
        {
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((VehicleReadDto)null);

            var result = await _controller.GetById(1);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task GetByUserId_ReturnsVehicles()
        {
            var list = new List<VehicleReadDto> { new VehicleReadDto { Make = "Ford" } };
            _mockService.Setup(s => s.GetByUserIdAsync(1)).ReturnsAsync(list);

            var result = await _controller.GetByUserId(1);

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);
            Assert.AreEqual(200, okResult.StatusCode);
            Assert.AreEqual(list, okResult.Value);
        }
        [TestMethod]
        public async Task Search_ReturnsMatchingVehicles()
        {
            var resultList = new List<VehicleReadDto> { new VehicleReadDto { Make = "BMW" } };
            _mockService.Setup(s => s.SearchAsync("BMW")).ReturnsAsync(resultList);

            var result = await _controller.Search("BMW");

            var okResult = result as OkObjectResult;
            Assert.AreEqual(resultList, okResult.Value);
        }
        [TestMethod]
        public async Task Create_ReturnsCreatedAtAction()
        {
            var dto = new VehicleCreateDto { Make = "Tesla", UserId = 1 };
            var created = new VehicleReadDto { VehicleId = 100, Make = "Tesla" };

            _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

            var result = await _controller.Create(dto);

            var createdResult = result as CreatedAtActionResult;
            Assert.IsNotNull(createdResult);
            Assert.AreEqual("GetById", createdResult.ActionName);
            Assert.AreEqual(100, ((VehicleReadDto)createdResult.Value).VehicleId);
        }
        [TestMethod]
        public async Task Update_ReturnsOk_WhenSuccessful()
        {
            var updateDto = new VehicleUpdateDto { Make = "Updated" };
            var updated = new VehicleReadDto { VehicleId = 1, Make = "Updated" };

            _mockService.Setup(s => s.UpdateAsync(1, updateDto)).ReturnsAsync(updated);

            var result = await _controller.Update(1, updateDto);

            var okResult = result as OkObjectResult;
            Assert.AreEqual(updated, okResult.Value);
        }
        [TestMethod]
        public async Task Update_ReturnsNotFound_WhenVehicleMissing()
        {
            _mockService.Setup(s => s.UpdateAsync(1, It.IsAny<VehicleUpdateDto>())).ReturnsAsync((VehicleReadDto)null);

            var result = await _controller.Update(1, new VehicleUpdateDto());

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task Delete_ReturnsNoContent_WhenDeleted()
        {
            _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

            var result = await _controller.Delete(1);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));
        }
        [TestMethod]
        public async Task Delete_ReturnsNotFound_WhenVehicleDoesNotExist()
        {
            _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(false);

            var result = await _controller.Delete(1);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

    }
}