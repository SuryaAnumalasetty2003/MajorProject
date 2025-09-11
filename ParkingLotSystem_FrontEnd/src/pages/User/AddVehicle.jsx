import React, { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AddVehicle = () => {
  const [form, setForm] = useState({
    numberPlate: "",
    make: "",
    color: "",
    type: "",
    customType: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = Cookies.get("token");
    const storedUser = localStorage.getItem("user");

    if (!storedUser || !token) {
      setError("Please login again.");
      return;
    }

    const userId = JSON.parse(storedUser)?.userId;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const typeToSend = form.type === "Other" ? form.customType : form.type;

      const res = await axios.post(
        "/vehicles",
        { ...form, type: typeToSend, customType: undefined, userId },
        { headers }
      );

      navigate("/user/dashboard");
    } catch (err) {
      console.error("Vehicle create failed:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Server error while adding vehicle");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <h2 className="text-2xl font-semibold mb-4">Add Vehicle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="numberPlate"
            value={form.numberPlate}
            onChange={handleChange}
            placeholder="Number Plate"
            required
            className="w-full border p-2"
          />
          <input
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="Make"
            required
            className="w-full border p-2"
          />
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="Color"
            required
            className="w-full border p-2"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border p-2"
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Other">Other</option>
          </select>

          {form.type === "Other" && (
            <input
              name="customType"
              value={form.customType}
              onChange={handleChange}
              placeholder="Enter custom type"
              required
              className="w-full border p-2"
            />
          )}

          {error && <p className="text-red-600">{error}</p>}
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
