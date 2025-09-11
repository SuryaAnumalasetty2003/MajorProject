namespace BackendProject.DTO
{
    public class ParkingLotReadDto
    {
        public int ParkingLotId { get; set; }
        public string LotNumber { get; set; }
        public string Location { get; set; }
        public bool IsOccupied { get; set; }
    }
}
