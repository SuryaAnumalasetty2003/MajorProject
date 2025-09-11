import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  List,
  SquareParking,
  LogOut,
  Truck,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { name: "Home", icon: <Home size={18} />, path: "homepage" },
    { name: "Manage Users", icon: <Users size={18} />, path: "manage-users" },
    { name: "View Allocations", icon: <List size={18} />, path: "allocations" },
    { name: "Add Parking Lot", icon: <SquareParking size={18} />, path: "parking-lots" },
    { name: "Manage Vehicles", icon: <Truck size={18} />, path: "vehicles" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-67 bg-black border-r p-5 shadow-lg hidden md:flex flex-col justify-between text-white">
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-8">Admin Panel</h2>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname.endsWith(item.path);
              return (
                <div
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition duration-150 ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-150"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
