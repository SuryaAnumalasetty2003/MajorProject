using System;
using AutoMapper;
using BackendProject.DTO;
using BackendProject.Model;

namespace BackendProject.Mapping
{
    public class MappingProfile: Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserReadDto>();
            CreateMap<RegisterDto, User>().ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

            CreateMap<Vehicle, VehicleReadDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));
            CreateMap<VehicleCreateDto, Vehicle>();
            CreateMap<VehicleUpdateDto, Vehicle>();
            CreateMap<ParkingLot, ParkingLotReadDto>();
            CreateMap<ParkingLotCreateDto, ParkingLot>();
            CreateMap<ParkingLotUpdateDto, ParkingLot>();

            CreateMap<ParkingAllocation, ParkingAllocationReadDto>()
     .ForMember(dest => dest.AllocatedFromDate,
         opt => opt.MapFrom(src => DateOnly.FromDateTime(src.AllocatedFromDate)))
     .ForMember(dest => dest.AllocatedUptoDate,
         opt => opt.MapFrom(src => DateOnly.FromDateTime(src.AllocatedUptoDate)))
     .ForMember(dest => dest.NumberPlate, opt => opt.MapFrom(src => src.Vehicle.NumberPlate))
     .ForMember(dest => dest.LotNumber, opt => opt.MapFrom(src => src.ParkingLot.LotNumber))
     .ForMember(dest => dest.LotLocation, opt => opt.MapFrom(src => src.ParkingLot.Location));

            CreateMap<ParkingAllocationCreateDto, ParkingAllocation>()
    .ForMember(dest => dest.AllocatedFromDate,
        opt => opt.MapFrom(src => src.AllocatedFromDate.ToDateTime(TimeOnly.MinValue)))
    .ForMember(dest => dest.AllocatedUptoDate,
        opt => opt.MapFrom(src => src.AllocatedUptoDate.ToDateTime(TimeOnly.MaxValue)));

            CreateMap<ParkingAllocationUpdateDto, ParkingAllocation>()
                .ForMember(dest => dest.AllocatedFromDate,
                    opt => opt.MapFrom(src => src.AllocatedFromDate.ToDateTime(TimeOnly.MinValue)))
                .ForMember(dest => dest.AllocatedUptoDate,
                    opt => opt.MapFrom(src => src.AllocatedUptoDate.ToDateTime(TimeOnly.MaxValue)));

        }
    }
}
