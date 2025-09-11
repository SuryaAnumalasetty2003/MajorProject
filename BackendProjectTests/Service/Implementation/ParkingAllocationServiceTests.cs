using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;
using BackendProject.Repository;
using BackendProject.Service.Implementation;
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
    public class ParkingAllocationServiceTests
    {
        private Mock<IGenericRepository<ParkingAllocation>> _mockRepo;
        private Mock<IMapper> _mockMapper;
        private ParkingAllocationService _service;

        [TestInitialize]
        public void Setup()
        {
            _mockRepo = new Mock<IGenericRepository<ParkingAllocation>>();
            _mockMapper = new Mock<IMapper>();
            _service = new ParkingAllocationService(_mockRepo.Object, _mockMapper.Object);
        }
        [TestMethod]
        public async Task GetAllAsync_ShouldReturnMappedAllocations()
        {
            var allocations = new List<ParkingAllocation>
    {
        new ParkingAllocation { AllocationId = 1 },
        new ParkingAllocation { AllocationId = 2 }
    };

            var dtoList = new List<ParkingAllocationReadDto>
    {
        new ParkingAllocationReadDto { AllocationId = 1 },
        new ParkingAllocationReadDto { AllocationId = 2 }
    };

            _mockRepo.Setup(r => r.GetAllIncludingAsync(It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                     .ReturnsAsync(allocations);

            _mockMapper.Setup(m => m.Map<IEnumerable<ParkingAllocationReadDto>>(allocations))
                       .Returns(dtoList);

            var result = await _service.GetAllAsync();

            Assert.IsNotNull(result);
            Assert.AreEqual(2, result.Count());
        }
        [TestMethod]
        public async Task GetByIdAsync_ShouldReturnNull_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetByIdIncludingAsync(1, It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                     .ReturnsAsync((ParkingAllocation)null);

            var result = await _service.GetByIdAsync(1);

            Assert.IsNull(result);
        }
        [TestMethod]
        public async Task DeleteAsync_ShouldReturnTrue_WhenEntityExists()
        {
            var allocation = new ParkingAllocation { AllocationId = 1 };

            _mockRepo.Setup(r => r.GetByIdIncludingAsync(1, It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                     .ReturnsAsync(allocation);

            _mockRepo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);

            var result = await _service.DeleteAsync(1);

            Assert.IsTrue(result);
        }
        [TestMethod]
        public async Task DeleteAsync_ShouldReturnFalse_WhenEntityDoesNotExist()
        {
            _mockRepo.Setup(r => r.GetByIdIncludingAsync(1, It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                     .ReturnsAsync((ParkingAllocation)null);

            var result = await _service.DeleteAsync(1);

            Assert.IsFalse(result);
        }
        [TestMethod]
        public async Task CreateAsync_ShouldCreateAllocation_WhenValidData()
        {
            var createDto = new ParkingAllocationCreateDto
            {
                VehicleId = 1,
                ParkingLotId = 2,
                AllocatedFromDate = DateOnly.FromDateTime(DateTime.Today),
                AllocatedUptoDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1))
            };

            var entity = new ParkingAllocation
            {
                AllocationId = 1,
                VehicleId = 1,
                ParkingLotId = 2,
                AllocatedFromDate = DateTime.Today,
                AllocatedUptoDate = DateTime.Today.AddDays(1)
            };

            _mockMapper.Setup(m => m.Map<ParkingAllocation>(createDto)).Returns(entity);

            _mockRepo
                .SetupSequence(r => r.GetAllIncludingAsync(It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                .ReturnsAsync(new List<ParkingAllocation>())         // first call
                .ReturnsAsync(new List<ParkingAllocation> { entity });// second call

            _mockRepo.Setup(r => r.AddAsync(entity)).ReturnsAsync(entity); // ✅ Correct


            _mockMapper.Setup(m => m.Map<ParkingAllocationReadDto>(entity))
                .Returns(new ParkingAllocationReadDto { AllocationId = 1 });

            var result = await _service.CreateAsync(createDto);

            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.AllocationId);
        }


        [TestMethod]
        [ExpectedException(typeof(Exception), "DB Error")]
        public async Task CreateAsync_ShouldThrowException_WhenRepositoryFails()
        {
            // Arrange
            var createDto = new ParkingAllocationCreateDto
            {
                VehicleId = 1,
                ParkingLotId = 2,
                AllocatedFromDate = DateOnly.FromDateTime(DateTime.Today),
                AllocatedUptoDate = DateOnly.FromDateTime(DateTime.Today.AddDays(1))
            };

            var entity = new ParkingAllocation { AllocationId = 1 };

            _mockMapper.Setup(m => m.Map<ParkingAllocation>(createDto)).Returns(entity);
            _mockRepo.Setup(r => r.AddAsync(entity)).Throws(new Exception("DB Error"));

            // Act
            await _service.CreateAsync(createDto);

            // Assert handled by ExpectedException
        }

        [TestMethod]
        public async Task UpdateAsync_ShouldReturnTrue_WhenEntityExists()
        {
            // Arrange
            var updateDto = new ParkingAllocationUpdateDto
            {
                ParkingLotId = 5,
                AllocatedFromDate = DateOnly.FromDateTime(DateTime.Today),
                AllocatedUptoDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3))
            };

            var existing = new ParkingAllocation
            {
                AllocationId = 1,
                ParkingLotId = 2,
                AllocatedFromDate = DateOnly.FromDateTime(DateTime.Today).ToDateTime(TimeOnly.MinValue),
                AllocatedUptoDate = DateOnly.FromDateTime(DateTime.Today.AddDays(3)).ToDateTime(TimeOnly.MinValue)
            };

            _mockRepo
                .Setup(r => r.GetByIdIncludingAsync(1, It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                .ReturnsAsync(existing);

            _mockMapper
                .Setup(m => m.Map(updateDto, existing))
                .Returns(existing);

            _mockRepo
                .Setup(r => r.UpdateAsync(existing))
                .Returns(Task.CompletedTask);

            _mockMapper
                .Setup(m => m.Map<ParkingAllocationReadDto>(existing))
                .Returns(new ParkingAllocationReadDto { AllocationId = 1 });

            // Act
            var result = await _service.UpdateAsync(1, updateDto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.AllocationId); 
        }



        [TestMethod]
        public async Task UpdateAsync_ShouldReturnFalse_WhenEntityDoesNotExist()
        {
            // Arrange
            var updateDto = new ParkingAllocationUpdateDto { };

            _mockRepo
                .Setup(r => r.GetByIdIncludingAsync(1, It.IsAny<Expression<Func<ParkingAllocation, object>>[]>()))
                .ReturnsAsync((ParkingAllocation)null);

            // Act
            var result = await _service.UpdateAsync(1, updateDto);

            // Assert
            Assert.IsNull(result);
        }

    }
}