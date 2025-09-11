using System.ComponentModel.DataAnnotations;

namespace BackendProject.Model
{
    public class ParkingLot
    {   
        [Key]
        public int ParkingLotId { get; set; }

        [Required]
        public string LotNumber { get; set; } // e.g., A01, B01

        public string Location { get; set; }


        // Navigation property
        public ICollection<ParkingAllocation> Allocations { get; set; }
    }
}
