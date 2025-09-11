using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BackendProject.DTO
{
    public class ParkingAllocationReadDto
    {
        public int AllocationId { get; set; }
        public string NumberPlate { get; set; }
  
        public string LotNumber { get; set; }
        public string LotLocation { get; set; }

        public DateOnly AllocatedFromDate { get; set; }

        public DateOnly AllocatedUptoDate { get; set; }
        public int AllocatedDays { get; set; }
    }
}
