// src/pages/AddAllocation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Cookies from "js-cookie";
const AddAllocation = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [allocationForm, setAllocationForm] = useState({
    fromDate: "",
    toDate: "",
    parkingLotId: "",
  });
  const [availableLots, setAvailableLots] = useState([]);
  const [allocError, setAllocError] = useState("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = Cookies.get("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !token) return;

    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`/Vehicles/by-user/${user.userId}`, { headers });
      setVehicles(res.data);
    } catch (err) {
      console.error("Error fetching vehicles", err);
    }
  };

  const handleChange = (e) => {
    setAllocationForm({ ...allocationForm, [e.target.name]: e.target.value });
  };

  const fetchAvailableLots = async () => {
    setAllocError("");
    const { fromDate, toDate } = allocationForm;
    if (!fromDate || !toDate) return;

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const res = await axios.get(`/ParkingLots/search?from=${fromDate}&to=${toDate}`, { headers });
      setAvailableLots(res.data);
    } catch (err) {
      console.error("Error fetching available lots", err);
      setAllocError("Failed to load available lots.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAllocError("");

    if (!vehicles.length) {
      setAllocError("Please register a vehicle first.");
      return;
    }

    if (!allocationForm.parkingLotId) {
      setAllocError("Please select a parking lot.");
      return;
    }

    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(
        "/ParkingAllocations",
        {
          vehicleId: vehicles[0].vehicleId,
          parkingLotId: parseInt(allocationForm.parkingLotId),
          allocatedFromDate: allocationForm.fromDate,
          allocatedUptoDate: allocationForm.toDate,
        },
        { headers }
      );

      navigate("/user/dashboard"); // or wherever the dashboard is
    } catch (err) {
      console.error("Error creating allocation", err);
      setAllocError("Error creating allocation.");
    }
  };

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-40">
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">Add Parking Allocation</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          name="fromDate"
          value={allocationForm.fromDate}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          type="date"
          name="toDate"
          value={allocationForm.toDate}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <button
          type="button"
          onClick={fetchAvailableLots}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Check Available Lots
        </button>

        {availableLots.length > 0 && (
          <select
            name="parkingLotId"
            value={allocationForm.parkingLotId}
            onChange={handleChange}
            className="w-full border p-2"
            required
          >
            <option value="">-- Select Available Lot --</option>
            {availableLots.map((lot) => (
              <option key={lot.parkingLotId} value={lot.parkingLotId}>
                {lot.lotNumber} - {lot.location}
              </option>
            ))}
          </select>
        )}

        {allocError && <p role="alert" className="text-red-600">{allocError}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Allocate Slot
        </button>
      </form>
    </div>
  </div>
);

};

export default AddAllocation;
