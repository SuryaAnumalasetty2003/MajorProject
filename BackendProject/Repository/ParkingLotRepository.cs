using BackendProject.Data;
using BackendProject.Model;
using Microsoft.EntityFrameworkCore;

namespace BackendProject.Repository
{
    public class ParkingLotRepository : IParkingLotRepository
    {
        private readonly AppDbContext _context;

        public ParkingLotRepository(AppDbContext context)
        {
            _context = context;
        }

        public IQueryable<ParkingAllocation> Allocations => _context.ParkingAllocations;
        public IQueryable<ParkingLot> Lots => _context.ParkingLots;
    }


}
