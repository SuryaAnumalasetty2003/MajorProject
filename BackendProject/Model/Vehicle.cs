using System.ComponentModel.DataAnnotations;

namespace BackendProject.Model
{
    public class Vehicle
    {

        [Key]
        public int VehicleId { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public string NumberPlate { get; set; }

        [Required]
        public string Make { get; set; }

        public string Color { get; set; }

        [Required]
        public int UserId { get; set; }

        // Navigation property for one-to-one
        public User User { get; set; }


        public ICollection<ParkingAllocation> Allocations { get; set; }
    }
}
