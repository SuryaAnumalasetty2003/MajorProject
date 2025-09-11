import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const ParkingLotDetail = () => {
  const { lotNumber } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLotDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/parkinglots", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const lot = res.data.find(
          (l) => l.lotNumber.toLowerCase() === lotNumber.toLowerCase()
        );
        setDetails(lot);
      } catch (err) {
        console.error("Failed to load lot details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLotDetails();
  }, [lotNumber]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 text-lg">Loading details...</div>
    );
  if (!details)
    return (
      <div className="p-6 text-center text-red-600 text-lg">Parking lot not found.</div>
    );

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={() => navigate(-1)}
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Parking Lot Details
        </h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Lot Number:</span>{" "}
            {details.lotNumber}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {details.location}
          </p>
          <p>
            <span className="font-semibold">Occupied:</span>{" "}
            {details.isOccupied ? (
              <span className="text-red-600 font-semibold">Yes</span>
            ) : (
              <span className="text-green-600 font-semibold">No</span>
            )}
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkingLotDetail;
