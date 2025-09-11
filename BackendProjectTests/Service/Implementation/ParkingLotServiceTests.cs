using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Implementation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace BackendProject.Service.Implementation.Tests
{
    [TestClass()]
    public class ParkingLotServiceTests
    {
        private Mock<IGenericRepository<ParkingLot>> _mockRepo;
        private Mock<IParkingLotRepository> _mockLotRepo;
        private Mock<IMapper> _mockMapper;
        private Mock<ILogger<ParkingLotService>> _mockLogger;

        private ParkingLotService _service;

        [TestInitialize]
        public void Setup()
        {
            _mockRepo = new Mock<IGenericRepository<ParkingLot>>();
            _mockLotRepo = new Mock<IParkingLotRepository>();
            _mockMapper = new Mock<IMapper>();
            _mockLogger = new Mock<ILogger<ParkingLotService>>();

            _service = new ParkingLotService(_mockRepo.Object, _mockMapper.Object, _mockLotRepo.Object, _mockLogger.Object);
        }
        [TestMethod]
        public async Task GetAllAsync_ShouldReturnMappedDtos_WithIsOccupiedSetCorrectly()
        {
            // Arrange
            var today = DateTime.Today;

            var lots = new List<ParkingLot>
        {
            new ParkingLot
            {
                ParkingLotId = 1,
                LotNumber = "A01",
                Location = "Ground",
                Allocations = new List<ParkingAllocation>
                {
                    new ParkingAllocation
                    {
                        AllocatedFromDate = today.AddDays(-1),
                        AllocatedUptoDate = today.AddDays(1)
                    }
                }
            },
            new ParkingLot
            {
                ParkingLotId = 2,
                LotNumber = "A02",
                Location = "Ground",
                Allocations = new List<ParkingAllocation>() // Empty
            }
        };

            _mockRepo.Setup(r => r.GetAllIncludingAsync(It.IsAny<Expression<Func<ParkingLot, object>>[]>()))
                     .ReturnsAsync(lots);

            _mockMapper.Setup(m => m.Map<ParkingLotReadDto>(It.Is<ParkingLot>(l => l.ParkingLotId == 1)))
                       .Returns(new ParkingLotReadDto { ParkingLotId = 1, LotNumber = "A01", Location = "Ground" });

            _mockMapper.Setup(m => m.Map<ParkingLotReadDto>(It.Is<ParkingLot>(l => l.ParkingLotId == 2)))
                       .Returns(new ParkingLotReadDto { ParkingLotId = 2, LotNumber = "A02", Location = "Ground" });

            // Act
            var result = (await _service.GetAllAsync()).ToList();

            // Assert
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual(1, result[0].ParkingLotId);
            Assert.IsTrue(result[0].IsOccupied);
            Assert.IsFalse(result[1].IsOccupied);
        }
        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnNull_WhenLotDoesNotExist()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((ParkingLot?)null);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.IsNull(result);
        }
        [TestMethod]
        public async Task GetByIdAsync_ShouldThrowException_WhenRepositoryThrows()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            await Assert.ThrowsExceptionAsync<Exception>(async () =>
            {
                await _service.GetByIdAsync(1);
            });
        }



        [TestMethod]
        public async Task CreateAsync_ShouldAddAndReturnCreatedDto()
        {
            var dto = new ParkingLotCreateDto { LotNumber = "B01" };
            var entity = new ParkingLot { ParkingLotId = 10, LotNumber = "B01" };

            _mockMapper.Setup(m => m.Map<ParkingLot>(dto)).Returns(entity);
            _mockRepo.Setup(r => r.AddAsync(entity)).ReturnsAsync(entity);
            _mockMapper.Setup(m => m.Map<ParkingLotReadDto>(entity)).Returns(new ParkingLotReadDto { ParkingLotId = 10 });

            var result = await _service.CreateAsync(dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(10, result.ParkingLotId);
        }
        [TestMethod]
        public async Task DeleteAsync_ShouldReturnTrue_WhenSuccessful()
        {
            var existing = new ParkingLot { ParkingLotId = 5 };
            _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(existing);
            _mockRepo.Setup(r => r.DeleteAsync(5)).Returns(Task.CompletedTask);

            var result = await _service.DeleteAsync(5);

            Assert.IsTrue(result);
        }
        [TestMethod]
        public async Task UpdateAsync_ReturnsNull_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((ParkingLot)null);

            var result = await _service.UpdateAsync(1, new ParkingLotUpdateDto());

            Assert.IsNull(result);
        }

        [TestMethod]
        public async Task UpdateAsync_UpdatesAndReturnsDto()
        {
            var existing = new ParkingLot { ParkingLotId = 1 };
            var dto = new ParkingLotUpdateDto { Location = "Updated" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existing);
            _mockMapper.Setup(m => m.Map(dto, existing));
            _mockRepo.Setup(r => r.UpdateAsync(existing)).Returns(Task.CompletedTask);
            _mockMapper.Setup(m => m.Map<ParkingLotReadDto>(existing)).Returns(new ParkingLotReadDto { ParkingLotId = 1 });

            var result = await _service.UpdateAsync(1, dto);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.ParkingLotId);
        }

        [TestMethod]
        public async Task DeleteAsync_ReturnsFalse_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((ParkingLot)null);

            var result = await _service.DeleteAsync(99);

            Assert.IsFalse(result);
        }

        [TestMethod]
        public async Task DeleteAsync_DeletesAndReturnsTrue()
        {
            var lot = new ParkingLot { ParkingLotId = 1 };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(lot);
            _mockRepo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);

            var result = await _service.DeleteAsync(1);

            Assert.IsTrue(result);
        }


        

    }


}
