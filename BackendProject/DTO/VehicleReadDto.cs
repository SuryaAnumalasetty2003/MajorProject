namespace BackendProject.DTO
{
    public class VehicleReadDto
    {
        public int VehicleId { get; set; }
        public string Type { get; set; }
        public string NumberPlate { get; set; }
        public string Make { get; set; }
        public string Color { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
    }
}
