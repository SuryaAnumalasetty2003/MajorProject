using BackendProject.Model;

namespace BackendProject.Repository
{
    public interface IParkingLotRepository
    {
        IQueryable<ParkingAllocation> Allocations { get; }
        IQueryable<ParkingLot> Lots { get; }
    }


}
