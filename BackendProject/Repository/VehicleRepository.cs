using BackendProject.Data;
using BackendProject.Model;
using Microsoft.EntityFrameworkCore;

namespace BackendProject.Repository
{
    public class VehicleRepository : IvehicleRepository
    {
        private readonly AppDbContext _context;
        public VehicleRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Vehicle> GetVehicleWithUserAsync(int id)
        {
            return await _context.Vehicles
                .Include(v => v.User)
                .FirstOrDefaultAsync(v => v.VehicleId == id);
        }

    }
}
