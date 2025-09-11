using System.ComponentModel.DataAnnotations;

namespace BackendProject.Model
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Role { get; set; } = "User";
        [Required]
        [Phone]
        public string MobileNumber { get;set; }
        // One-to-One relationship
        public Vehicle Vehicle { get; set; }

    }
}
