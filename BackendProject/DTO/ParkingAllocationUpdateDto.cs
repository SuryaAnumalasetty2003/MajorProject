using System.ComponentModel.DataAnnotations;

namespace BackendProject.DTO
{
    public class ParkingAllocationUpdateDto
    {
        public int ParkingLotId { get; set; }
        //[DataType(DataType.Date)]
        public DateOnly AllocatedFromDate { get; set; }
        //[DataType(DataType.Date)]
        public DateOnly AllocatedUptoDate { get; set; }
    }
}
