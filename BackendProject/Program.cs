using BackendProject;
using BackendProject.Data;
using BackendProject.Repository;
using BackendProject.Service.Implementation;
using BackendProject.Service.Interface;
using BackendProject.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
Environment.SetEnvironmentVariable("USE_INMEMORY_DB", "true");
builder.Configuration.SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json", optional: false, reloadOnChange: false).AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true).AddEnvironmentVariables();
// Add services to the container.
Console.WriteLine(builder.Environment.EnvironmentName);
// Add services to the container.
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy => policy.WithOrigins("http://localhost:5173").AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

builder.Host.UseSerilog((context, services, configuration) => configuration

    .ReadFrom.Configuration(context.Configuration)

    .Enrich.FromLogContext()

);


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
if (Environment.GetEnvironmentVariable("USE_INMEMORY_DB") == "false")
{
    Console.WriteLine("Using InMemory Database");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("ParkingLotDB"));
}
else
{
    Console.WriteLine("Using SQL Server Database");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Using connection string: {connStr}");

builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IParkingLotService,ParkingLotService>();
builder.Services.AddScoped<IParkingAllocationService, ParkingAllocationService>();
builder.Services.AddScoped<IParkingLotRepository, ParkingLotRepository>();
builder.Services.AddScoped<IvehicleRepository, VehicleRepository>();


builder.Services.AddAutoMapper(typeof(Program));

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        var settings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = settings.Issuer,
            ValidAudience = settings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey))
        };
    });
builder.Services.AddAuthorization();
var app = builder.Build();
if (Environment.GetEnvironmentVariable("USE_INMEMORY_DB") == "false")
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var dbContext = services.GetRequiredService<AppDbContext>();
        var seeder = new Seeding(dbContext);
        seeder.Seed();
    }
}
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
