using BackendProject.Controllers;
using BackendProject.DTO;
using BackendProject.Service.Interface;
using Castle.Core.Logging;
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
    public class ParkingLotsControllerTests
    {
        private Mock<IParkingLotService> _mockService;
        private Mock<ILogger<ParkingLotsController>> _mockLogger;
        private ParkingLotsController _controller;
        [TestInitialize]
        public void setup()
        { 
            _mockService= new Mock<IParkingLotService>();
            _mockLogger= new Mock<ILogger<ParkingLotsController>>();
            _controller = new ParkingLotsController(_mockService.Object, _mockLogger.Object);
        }

        [TestMethod]
        public async Task GetAll_ShouldReturnOk_WithParkingLots()
        {
            var data = new List<ParkingLotReadDto> { new ParkingLotReadDto { ParkingLotId = 1, LotNumber = "A01" } };
            _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(data);

            var result = await _controller.GetAll() as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.StatusCode);
        }
        [TestMethod]
        public async Task GetAll_ShouldReturn500_OnException()
        {
            _mockService.Setup(s => s.GetAllAsync()).ThrowsAsync(new Exception("DB error"));

            var result = await _controller.GetAll() as ObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(500, result.StatusCode);
        }
        [TestMethod]
        public async Task GetById_ShouldReturnOk_WhenFound()
        {
            var lot = new ParkingLotReadDto { ParkingLotId = 1, LotNumber = "A01" };
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(lot);

            var result = await _controller.GetById(1) as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.StatusCode);
        }
        [TestMethod]
        public async Task GetById_ShouldReturnNotFound_WhenMissing()
        {
            _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync((ParkingLotReadDto)null);

            var result = await _controller.GetById(1);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task Create_ShouldReturnCreated_WhenSuccess()
        {
            var dto = new ParkingLotCreateDto { LotNumber = "B01", Location = "Block B" };
            var created = new ParkingLotReadDto { ParkingLotId = 1, LotNumber = "B01" };

            _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

            var result = await _controller.Create(dto) as CreatedAtActionResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(201, result.StatusCode);
        }
        [TestMethod]
        public async Task Create_ShouldReturn500_OnException()
        {
            var dto = new ParkingLotCreateDto();
            _mockService.Setup(s => s.CreateAsync(dto)).ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.Create(dto) as ObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(500, result.StatusCode);
        }
        [TestMethod]
        public async Task Update_ShouldReturnOk_WhenSuccess()
        {
            var dto = new ParkingLotUpdateDto { Location = "New" };
            var updated = new ParkingLotReadDto { ParkingLotId = 1, Location = "New" };

            _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

            var result = await _controller.Update(1, dto) as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.StatusCode);
        }
        [TestMethod]
        public async Task Update_ShouldReturnNotFound_WhenMissing()
        {
            var dto = new ParkingLotUpdateDto();
            _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync((ParkingLotReadDto)null);

            var result = await _controller.Update(1, dto);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task Delete_ShouldReturnNoContent_WhenDeleted()
        {
            _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(true);

            var result = await _controller.Delete(1);

            Assert.IsInstanceOfType(result, typeof(NoContentResult));
        }
        [TestMethod]
        public async Task Delete_ShouldReturnNotFound_WhenMissing()
        {
            _mockService.Setup(s => s.DeleteAsync(1)).ReturnsAsync(false);

            var result = await _controller.Delete(1);

            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }
        [TestMethod]
        public async Task Search_ShouldReturnOk_WhenValid()
        {
            var from = DateTime.Today;
            var to = DateTime.Today.AddDays(2);

            _mockService.Setup(s => s.SearchByDateRangeAsync(from, to))
                .ReturnsAsync(new List<ParkingLotReadDto>());

            var result = await _controller.Search(from, to) as OkObjectResult;

            Assert.IsNotNull(result);
            Assert.AreEqual(200, result.StatusCode);
        }
        [TestMethod]
        public async Task Search_ShouldReturnBadRequest_WhenInvalidDates()
        {
            var result = await _controller.Search(DateTime.Today, DateTime.Today.AddDays(-1));

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }
    }
}