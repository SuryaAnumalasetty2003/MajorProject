import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const EditAllocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    numberPlate: "",
    parkingLotId: "",
    allocatedFromDate: "",
    allocatedUptoDate: "",
  });

  const [lots, setLots] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAllocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (form.allocatedFromDate && form.allocatedUptoDate) {
      fetchLotsByDate(form.allocatedFromDate, form.allocatedUptoDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.allocatedFromDate, form.allocatedUptoDate]);

  const fetchAllocation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/parkingallocations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      setForm({
        numberPlate: data.numberPlate,
        parkingLotId: data.parkingLotId,
        allocatedFromDate: data.allocatedFromDate.split("T")[0],
        allocatedUptoDate: data.allocatedUptoDate.split("T")[0],
      });
    } catch (err) {
      console.error("Error loading allocation", err);
    }
  };

  const fetchLotsByDate = async (from, to) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/parkinglots/search?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLots(res.data);
    } catch (err) {
      console.error("Failed to fetch lots by date", err);
    }
  };

  const validateVehicleAvailability = async (vehicleId) => {
    const token = localStorage.getItem("token");
    const res = await axios.get("/parkingallocations", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const overlapping = res.data.find(
      (alloc) =>
        alloc.vehicleId === vehicleId &&
        alloc.allocationId !== parseInt(id, 10) &&
        new Date(alloc.allocatedFromDate) <= new Date(form.allocatedUptoDate) &&
        new Date(alloc.allocatedUptoDate) >= new Date(form.allocatedFromDate)
    );

    return !overlapping;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const vehicleRes = await axios.get(
        `/Vehicles/search-by-plate?plate=${form.numberPlate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const vehicle = vehicleRes.data;

      if (!vehicle || !vehicle[0]?.vehicleId) {
        setMessage("❌ Vehicle number not found in the system.");
        return;
      }

      const available = await validateVehicleAvailability(vehicle[0].vehicleId);
      if (!available) {
        setMessage(
          "❌ This vehicle already has an active allocation in this date range."
        );
        return;
      }

      const payload = {
        vehicleId: vehicle[0].vehicleId,
        parkingLotId: form.parkingLotId,
        allocatedFromDate: form.allocatedFromDate,
        allocatedUptoDate: form.allocatedUptoDate,
      };

      await axios.put(`/parkingallocations/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Allocation updated successfully!");

      // Skip delay in test environment for faster tests
      const delay = process.env.NODE_ENV === "test" ? 0 : 1500;
      setTimeout(() => navigate("/admin/dashboard/allocations"), delay);
    } catch (err) {
      console.error("Error updating allocation:", err);
      setMessage("❌ Failed to update allocation.");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <h2
          id="form-title"
          className="text-2xl font-semibold text-center mb-6"
        >
          Edit Allocation
        </h2>

        {message && (
          <div
            role="alert"
            className={`${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            } border p-3 rounded mb-4 text-sm`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="numberPlate" className="block mb-1 font-medium">
              Vehicle Number
            </label>
            <input
              type="text"
              id="numberPlate"
              name="numberPlate"
              value={form.numberPlate}
              onChange={handleChange}
              required
              disabled
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="allocatedFromDate" className="block mb-1 font-medium">
              From Date
            </label>
            <input
              type="date"
              id="allocatedFromDate"
              name="allocatedFromDate"
              value={form.allocatedFromDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="allocatedUptoDate" className="block mb-1 font-medium">
              Upto Date
            </label>
            <input
              type="date"
              id="allocatedUptoDate"
              name="allocatedUptoDate"
              value={form.allocatedUptoDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="parkingLotId" className="block mb-1 font-medium">
              Select Parking Lot
            </label>
            <select
              id="parkingLotId"
              name="parkingLotId"
              value={form.parkingLotId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded"
            >
              <option value="">-- Choose a Parking Lot --</option>
              {lots.map((lot) => (
                <option key={lot.parkingLotId} value={lot.parkingLotId}>
                  {lot.lotNumber} ({lot.location})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Update Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAllocationForm;
