using System.ComponentModel.DataAnnotations;

namespace BackendProject.Model
{
    public class ParkingAllocation
    {

        [Key]
        public int AllocationId { get; set; }

        [Required]
        public int VehicleId { get; set; }

        [Required]
        public int ParkingLotId { get; set; }

        [Required]
        public DateTime AllocatedFromDate { get; set; }

        [Required]
        public DateTime AllocatedUptoDate { get; set; }

        public int AllocatedDays => (AllocatedUptoDate - AllocatedFromDate).Days+1;

        // Navigation properties
        public Vehicle Vehicle { get; set; }
        public ParkingLot ParkingLot { get; set; }
    }
}
