using BackendProject.Data;
using BackendProject.Model;

namespace BackendProject
{


    public class Seeding
    {
        private readonly AppDbContext _context;

        public Seeding(AppDbContext context)
        {
            _context = context;
        }

        public void Seed()
        {
            if (!_context.Users.Any())
            {
                _context.Users.AddRange(new User
                {
                    Email = "surya@gmail.com",
                    FullName = "Surya Anumalasetty",
                    MobileNumber = "7894561235",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Surya@143"),
                    Role = "Admin"
                },
                new User
                {
                    Email="jagadeesh@gmail.com",
                    FullName = "Jagadeesh Babu",
                    MobileNumber = "7894561230",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Surya@143"),
                    Role = "User"
                },
                new User
                {
                    Email = "kavyaaddanki@gmail.com",
                    FullName = "Kavya Addanki",
                    MobileNumber = "9638527410",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Surya@143"),
                    Role = "User"
                }

                );
                
            }


            if (!_context.ParkingLots.Any())
            {
                var lots = new List<ParkingLot>();
                for (char section = 'A'; section <= 'Z'; section++)
                {
                    for (int number = 1; number <= 10; number++)
                    {
                        lots.Add(new ParkingLot
                        {
                            LotNumber = $"{section}{number:D2}",
                            Location = section <= 'M' ? "Ground Floor" : "First Floor",
                        });
                    }
                }
                _context.ParkingLots.AddRange(lots);
            }
            if (!_context.Vehicles.Any())
            {
                _context.Vehicles.AddRange(new Vehicle
                {
                    Type = "Car",
                    NumberPlate = "Ap27Z4777",
                    Make = "Platinum",
                    Color = "Black",
                    UserId = 2
                },
                new Vehicle
                {
                    Type = "Bike",
                    NumberPlate = "Ap27Z41111",
                    Make = "Honda",
                    Color = "Red",
                    UserId = 3
                }
                );
            }
            if (!_context.ParkingAllocations.Any())
            {
                _context.ParkingAllocations.Add(new ParkingAllocation
                {
                    VehicleId = 1,
                    ParkingLotId = 1,
                    AllocatedFromDate = DateTime.Now,
                    AllocatedUptoDate = DateTime.Now.AddDays(5),
                }
                );
            }
            _context.SaveChanges();
        }
    }
}