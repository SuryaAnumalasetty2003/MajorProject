import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../../api/axios";


const EditParkingLot = () => {
  const { id } = useParams();
  const [lotNumber, setLotNumber] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLot = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/parkinglots/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLotNumber(res.data.lotNumber);
        setLocation(res.data.location);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching lot:", err);
        setError("Failed to load parking lot.");
        setLoading(false);
      }
    };
    fetchLot();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/parkinglots/${id}`,
        { lotNumber, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/dashboard/parking-lots");
    } catch (err) {
      console.error("Error updating lot:", err);
      setError("Update failed.");
    }
  };

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Edit Parking Lot
      </h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Lot Number</label>
        <input
          type="text"
          value={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="e.g. A11"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Location</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Location</option>
          <option value="Ground Floor">Ground Floor</option>
          <option value="First Floor">First Floor</option>
          <option value="Second Floor">Second Floor</option>
        </select>
      </div>

      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Update Lot
      </button>

      <button
        onClick={() => navigate("/admin/dashboard/parking-lots")}
        className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
      >
        Back
      </button>
    </div>
  </div>
);

};

export default EditParkingLot;
