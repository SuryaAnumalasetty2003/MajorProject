import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";
import { FaArrowLeft } from "react-icons/fa";
const VehicleDetails = () => {
  const { numberPlate } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/vehicles/search-by-plate?plate=${numberPlate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setVehicle(res.data[0]);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      }
    };
    fetchVehicle();
  }, [numberPlate]);

  if (!vehicle) {
    return <div className="p-6">Loading...</div>;
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center px-2 sm:px-4">
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 transition-all duration-300 hover:shadow-2xl overflow-x-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        🚗 Vehicle Details
      </h2>

      <table className="w-full border-collapse">
        <tbody>
          {[
            ["Number Plate", vehicle.numberPlate],
            ["Owner Name", vehicle.userName],
            ["Type", vehicle.type],
            ["Model", vehicle.make],
            ["Color", vehicle.color],
          ].map(([label, value]) => (
            <tr
              key={label}
              className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-gray-600 w-1/2">{label}</td>
              <td className="py-3 px-4 text-gray-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-5 py-2 rounded transition"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>
    </div>
  </div>
);

};

export default VehicleDetails;
