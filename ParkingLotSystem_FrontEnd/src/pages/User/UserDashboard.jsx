import React, { useEffect, useState } from "react";
import { useLocation,Link, Outlet, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Cookies from "js-cookie";
const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editVehicleForm, setEditVehicleForm] = useState(null);
  const [vehicleError, setVehicleError] = useState("");
const location=useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, [location]);

  const fetchUserData = async () => {
    const token = Cookies.get("token");
    const storedUser = localStorage.getItem("user");
    if (!storedUser || !token) return;

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const vehicleRes = await axios.get(`/Vehicles/by-user/${parsedUser.userId}`, { headers });
      setVehicles(vehicleRes.data);

      const parkingRes = await axios.get("/ParkingLots", { headers });
      setParkingLots(parkingRes.data);
      console.log(parkingRes)

      if (vehicleRes.data.length > 0) {
        const allocRes = await axios.get(`/ParkingAllocations/by-vehicle/${vehicleRes.data[0].vehicleId}`, { headers });
        console.log(allocRes);
        
        const mapped = allocRes.data.map((a) => {
          const lot = parkingRes.data.find((p) => p.parkingLotId === a.allocationId);
          
          return {
            ...a,
            lotNumber: a.lotNumber || "N/A",
            lotLocation: a.lotLocation || "Unknown",
          };
        });

        setAllocations(mapped);
      }
    } catch (err) {
      console.error("Error loading dashboard", err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token")
    localStorage.removeItem("user");
    navigate("/");
  };

  const startEditVehicle = () => {
    setEditVehicleForm({ ...vehicles[0] });
    setIsEditingVehicle(true);
  };

  const handleEditChange = (e) => {
    setEditVehicleForm({ ...editVehicleForm, [e.target.name]: e.target.value });
  };

  const handleUpdateVehicle = async () => {
    setVehicleError("");
    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.put(`/Vehicles/${editVehicleForm.vehicleId}`, editVehicleForm, { headers });
      setVehicles([res.data]);
      setIsEditingVehicle(false);
    } catch (err) {
      setVehicleError("Failed to update vehicle.");
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-red-600 text-center">Please login again.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user.fullName}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <section className="bg-white rounded shadow-md p-6 space-y-2 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700">👤 Your Details</h2>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {user.mobileNumber}</p>
      </section>

      {/* Vehicle Info */}
      <div className="bg-white shadow p-6 rounded mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Your Vehicle</h2>

        {vehicles.length === 0 ? (
          <div className="text-gray-600 space-y-3">
            <p>No vehicle registered.</p>
            <Link to="/user/dashboard/add-vehicle">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Register Vehicle
              </button>
            </Link>
          </div>
        ) : isEditingVehicle ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Number Plate</label>
              <input
                name="numberPlate"
                value={editVehicleForm.numberPlate}
                onChange={handleEditChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={editVehicleForm.type}
                onChange={handleEditChange}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">-- Select Type --</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Other">Other</option>
              </select>

              {editVehicleForm.type === "Other" && (
                <input
                  type="text"
                  name="type"
                  value={editVehicleForm.typeCustom || ""}
                  onChange={(e) =>
                    setEditVehicleForm({
                      ...editVehicleForm,
                      type: e.target.value,
                      typeCustom: e.target.value,
                    })
                  }
                  placeholder="Enter custom vehicle type"
                  className="w-full border border-gray-300 p-2 rounded mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                name="make"
                value={editVehicleForm.make}
                onChange={handleEditChange}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="Bike/Car Model"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                name="color"
                value={editVehicleForm.color}
                onChange={handleEditChange}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            {vehicleError && <p className="text-red-600">{vehicleError}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleUpdateVehicle}
                className="bg-blue-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingVehicle(false)}
                className="bg-gray-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="text-gray-800 text-lg">
              <p>
                <strong>{vehicles[0].numberPlate}</strong> – {vehicles[0].make} ({vehicles[0].color}) [{vehicles[0].type}]
              </p>
            </div>
            <button
              onClick={startEditVehicle}
              className="text-blue-600 hover:underline mt-2 sm:mt-0"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Add Allocation */}
      <section className="bg-white rounded shadow-md p-6 border border-gray-200 flex items-center justify-between">
        <h2 className="text-l font-semibold text-gray-700">Add Parking Allocation</h2>
        <Link to="/user/dashboard/add-allocation">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">
            Add Allocation
          </button>
        </Link>
      </section>

      {/* Allocation List */}
      <section className="bg-white rounded shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Allocations</h2>
        {allocations.length === 0 ? (
          <p className="text-gray-500">No allocations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b">Lot Number</th>
                  <th className="px-4 py-2 border-b">Location</th>
                  <th className="px-4 py-2 border-b">From</th>
                  <th className="px-4 py-2 border-b">To</th>
                  <th className="px-4 py-2 border-b">Days</th>
                  <th className="px-4 py-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => {
                  const now = new Date();
                  const startDate = new Date(a.allocatedFromDate);
                  const endDate = new Date(a.allocatedUptoDate);

                  let statusLabel = "";
                  let statusClass = "";

                  if (now < startDate) {
                    statusLabel = "Not Started";
                    statusClass = "text-blue-600 font-semibold";
                  } else if (now > endDate) {
                    statusLabel = "Expired";
                    statusClass = "text-red-600 font-semibold";
                  } else {
                    statusLabel = "Active";
                    statusClass = "text-green-600 font-semibold";
                  }

                  return (
                    <tr key={a.allocationId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{a.lotNumber}</td>
                      <td className="px-4 py-2 border-b">{a.lotLocation}</td>
                      <td className="px-4 py-2 border-b">{a.allocatedFromDate}</td>
                      <td className="px-4 py-2 border-b">{a.allocatedUptoDate}</td>
                      <td className="px-4 py-2 border-b text-center">{a.allocatedDays}</td>
                      <td className={`px-4 py-2 border-b ${statusClass}`}>{statusLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>


      <Outlet />
    </div>
  );
};

export default UserDashboard;
