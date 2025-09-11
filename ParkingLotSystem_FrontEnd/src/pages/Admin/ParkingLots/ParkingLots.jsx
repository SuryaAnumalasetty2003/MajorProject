import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import axios from "../../../api/axios";

const ParkingLots = () => {
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [location, setLocation] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success or error
  const navigate = useNavigate();
  const locationpage = useLocation();

  useEffect(() => {
    fetchLots();
  }, [locationpage]);

  const fetchLots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/parkinglots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLots(response.data);
    } catch (error) {
      console.error("Error fetching parking lots:", error);
      showAlert("Failed to fetch parking lots.", "error");
    }
  };

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(""), 3000);
  };

  const handleAddLot = async () => {
    if (!lotNumber.trim() || !location.trim()) {
      showAlert("Please enter both lot number and location.", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/parkinglots",
        { lotNumber, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLotNumber("");
      setLocation("");
      showAlert("Parking lot added successfully!", "success");
      fetchLots();
    } catch (error) {
      console.error("Error adding parking lot:", error);
      showAlert("Failed to add parking lot.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this parking lot?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/parkinglots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("Parking lot deleted successfully!", "success");
      fetchLots();
    } catch (error) {
      console.error("Error deleting lot:", error);
      showAlert("Failed to delete parking lot.", "error");
    }
  };
  const filtered = lots.filter((lot) =>
    lot.lotNumber.toLowerCase().includes(search.toLowerCase())
  );
  // Sort by first character (letter), then numeric part
  const sorted = [...filtered].sort((a, b) => {
    const [aLetter, aNum] = [a.lotNumber[0], parseInt(a.lotNumber.slice(1))];
    const [bLetter, bNum] = [b.lotNumber[0], parseInt(b.lotNumber.slice(1))];

    if (aLetter < bLetter) return -1;
    if (aLetter > bLetter) return 1;
    return aNum - bNum;
  });

 return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="bg-white shadow-md rounded p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Parking Lots</h1>

        {alertMessage && (
          <div
            className={`${
              alertType === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            } p-3 rounded mb-4 text-sm sm:text-base`}
            role="alert"
          >
            {alertMessage}
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search by lot number"
          className="w-full border p-2 mb-4 rounded text-sm sm:text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search Parking Lots by Lot Number"
        />

        {/* Add Lot Form */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <input
            type="text"
            placeholder="Lot Number (e.g., A11)"
            className="border p-2 rounded w-full sm:w-1/3 text-sm sm:text-base"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            aria-label="Lot Number"
          />
          <select
            className="border p-2 rounded w-full sm:w-1/3 text-sm sm:text-base"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
          >
            <option value="">Select Location</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="First Floor">First Floor</option>
            <option value="Second Floor">Second Floor</option>
          </select>
          <button
            onClick={handleAddLot}
            disabled={!lotNumber.trim() || !location.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            aria-disabled={!lotNumber.trim() || !location.trim()}
          >
            Add Lot
          </button>
        </div>

        {/* Lot Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.length > 0 ? (
            sorted.map((lot) => (
              <div
                key={lot.parkingLotId}
                className={`rounded shadow p-4 cursor-pointer transition duration-300 border-2 ${
                  lot.isOccupied
                    ? "bg-red-100 border-red-400"
                    : "bg-green-100 border-green-400"
                }`}
                onClick={() =>
                  navigate(`/admin/dashboard/parking-lots/${lot.lotNumber}`)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/admin/dashboard/parking-lots/${lot.lotNumber}`);
                  }
                }}
                aria-label={`Parking lot ${lot.lotNumber} at ${
                  lot.location
                }, currently ${lot.isOccupied ? "occupied" : "available"}`}
              >
                <h2 className="text-lg sm:text-xl font-bold text-indigo-600">
                  {lot.lotNumber}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">{lot.location}</p>
                <p
                  className={`font-semibold text-sm sm:text-base ${
                    lot.isOccupied ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {lot.isOccupied ? "Occupied" : "Available"}
                </p>

                {/* Action Buttons */}
                <div className="mt-3 flex flex-col sm:flex-row sm:space-x-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/admin/dashboard/parking-lots/edit/${lot.parkingLotId}`
                      );
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm sm:text-base"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(lot.parkingLotId);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No parking lots found.
            </p>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ParkingLots;
