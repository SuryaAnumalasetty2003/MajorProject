import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const AddAllocationForm = () => {
  const navigate = useNavigate();

  const [allocations, setAllocations] = useState([]);
  const [form, setForm] = useState({
    numberPlate: "",
    parkingLotId: "",
    allocatedFromDate: "",
    allocatedUptoDate: "",
  });
  const [availableLots, setAvailableLots] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "allocatedFromDate" || e.target.name === "allocatedUptoDate") {
      setAvailableLots([]);
      setForm((prev) => ({ ...prev, parkingLotId: "" }));
    }
  };

  const fetchAvailableLots = async () => {
    const { allocatedFromDate, allocatedUptoDate } = form;

    if (!allocatedFromDate || !allocatedUptoDate) {
      setMessage("Please select both from and to dates.");
      return;
    }

    setMessage("");
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `/ParkingLots/search?from=${allocatedFromDate}&to=${allocatedUptoDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAvailableLots(res.data);
      } else {
        setMessage("No available parking lots found.");
        setAvailableLots([]);
      }
    } catch (err) {
      console.error("Error fetching available lots", err);
      setMessage("Failed to fetch available lots.");
    }

    setLoading(false);
  };

  const validateVehicleAvailability = (vehicle, allocationsData) => {
    let isPossible= !allocationsData.some(
      (alloc) =>
        alloc.numberPlate === vehicle &&
        new Date(alloc.allocatedFromDate) <= new Date(form.allocatedUptoDate) &&
        new Date(alloc.allocatedUptoDate) >= new Date(form.allocatedFromDate)
    );
    console.log(isPossible);
    return isPossible;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!form.parkingLotId) {
      setMessage("Please select an available lot.");
      setLoading(false);
      return;
    }

    try {
      const vehicleRes = await axios.get(
        `/Vehicles/search-by-plate?plate=${form.numberPlate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const vehicle = vehicleRes.data[0];
      if (!vehicle || !vehicle.vehicleId) {
        setMessage("Vehicle number not found.");
        setLoading(false);
        return;
      }

      const allocRes = await axios.get("/parkingallocations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allocationsData = allocRes.data;
      setAllocations(allocationsData); 
      const available = validateVehicleAvailability(vehicle.numberPlate, allocationsData);
      if (!available) {
        setMessage("This vehicle already has an active allocation in that date range.");
        setLoading(false);
        return;
      }

      const payload = {
        vehicleId: vehicle.vehicleId,
        parkingLotId: form.parkingLotId,
        allocatedFromDate: form.allocatedFromDate,
        allocatedUptoDate: form.allocatedUptoDate,
      };

      await axios.post("/parkingallocations", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Allocation created successfully.");
      setTimeout(() => navigate("/admin/dashboard/allocations"), 1500);
    } catch (err) {
      // console.error("Error creating allocation", err);
      setMessage("Failed to save allocation.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <h2 id="form-title" className="text-2xl font-bold mb-4 text-center">
          Add Allocations
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          type="button"
        >
          Back
        </button>

        {message && (
          <div
            role="alert"
            data-testid="message"
            className={`${message.includes("successfully") ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"} border p-3 rounded mb-4`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label htmlFor="numberPlate" className="sr-only">
            Vehicle Number
          </label>
          <input
            id="numberPlate"
            name="numberPlate"
            placeholder="Enter Vehicle Number"
            value={form.numberPlate}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-required="true"
          />

          <label htmlFor="allocatedFromDate" className="sr-only">
            Allocated From Date
          </label>
          <input
            id="allocatedFromDate"
            name="allocatedFromDate"
            type="date"
            value={form.allocatedFromDate}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split("T")[0]}
            aria-required="true"
          />

          <label htmlFor="allocatedUptoDate" className="sr-only">
            Allocated Upto Date
          </label>
          <input
            id="allocatedUptoDate"
            name="allocatedUptoDate"
            type="date"
            value={form.allocatedUptoDate}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={form.allocatedFromDate || new Date().toISOString().split("T")[0]}
            aria-required="true"
          />

          <button
            type="button"
            onClick={fetchAvailableLots}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Verify Available Lots
          </button>

          {availableLots.length > 0 && (
            <select
              name="parkingLotId"
              aria-label="Available Parking Lots"
              value={form.parkingLotId}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-required="true"
            >
              <option value="">Select Available Lot</option>
              {availableLots.map((lot) => (
                <option key={lot.parkingLotId} value={lot.parkingLotId}>
                  {lot.lotNumber} ({lot.location})
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >Add Allocation in Dashboard</button>
        </form>
      </div>
    </div>
  );
};

export default AddAllocationForm;
