import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(res.data);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prev) => prev.filter((v) => v.vehicleId !== id));
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const filtered = vehicles.filter((v) =>
    v.numberPlate.toLowerCase().includes(search.toLowerCase()) ||
    v.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Vehicles</h2>
      </div>

      <input
        type="text"
        placeholder="Search by Number Plate or Owner"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 p-2 mb-4 rounded"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Number Plate</th>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((v) => (
                <tr key={v.vehicleId} className="text-center">
                  <td className="p-2 border">{v.numberPlate}</td>
                  <td className="p-2 border">{v.userName || "N/A"}</td>
                  <td className="p-2 border space-x-3">
                    <button
                      onClick={() => navigate(`/admin/dashboard/vehicles/${v.numberPlate}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(v.vehicleId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-gray-500 text-center">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleList;
