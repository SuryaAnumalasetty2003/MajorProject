using BackendProject.Model;
using Microsoft.EntityFrameworkCore;


namespace BackendProject.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
}

        public DbSet<User> Users { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<ParkingLot> ParkingLots { get; set; }
        public DbSet<ParkingAllocation> ParkingAllocations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique Email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique()
            .HasDatabaseName("IX_Users_Email");
            modelBuilder.Entity<User>()
                .HasIndex(u => u.MobileNumber)
                .IsUnique()
                .HasDatabaseName("IX_Users_Mobile");

            // User ↔ Vehicle (One-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Vehicle)
                .WithOne(v => v.User)
                .HasForeignKey<Vehicle>(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique Number Plate
            modelBuilder.Entity<Vehicle>()
                .HasIndex(v => v.NumberPlate)
                .IsUnique();

            // Vehicle → Allocations (One-to-Many)
            modelBuilder.Entity<ParkingAllocation>()
                .HasOne(a => a.Vehicle)
                .WithMany(v => v.Allocations)
                .HasForeignKey(a => a.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            // ParkingLot → Allocations (One-to-Many)
            modelBuilder.Entity<ParkingAllocation>()
                .HasOne(a => a.ParkingLot)
                .WithMany(p => p.Allocations)
                .HasForeignKey(a => a.ParkingLotId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique LotNumber
            modelBuilder.Entity<ParkingLot>()
                .HasIndex(p => p.LotNumber)
                .IsUnique();

            modelBuilder.Entity<ParkingAllocation>(entity =>
            {
                entity.Property(e => e.AllocatedFromDate)
                      .HasColumnType("date");

                entity.Property(e => e.AllocatedUptoDate)
                      .HasColumnType("date");
            });
        }
    }
}
