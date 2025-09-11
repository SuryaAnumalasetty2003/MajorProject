# Use the official .NET 8 ASP.NET runtime image as a base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the official .NET 8 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY BackendProject.csproj ./
RUN dotnet restore ./BackendProject.csproj

# Copy everything else and build
COPY . ./
RUN dotnet publish ./BackendProject.csproj -c Release -o /app/publish

# Final stage: build runtime image
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "BackendProject.dll"]