import React, { useEffect, useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import axios from "../../../api/axios";

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem("token");
      // window.location.reload();
      const response = await axios.get("/parkingallocations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllocations(response.data);
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [location.key]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this allocation?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/parkingallocations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllocations();
    } catch (error) {
      console.error("Error deleting allocation:", error);
    }
  };

  const filtered = allocations.filter(
    (a) =>
      a.numberPlate.toLowerCase().includes(search.toLowerCase()) ||
      a.lotNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Parking Allocations</h1>
          <div className="flex gap-2">
            <button
            
              onClick={() => navigate("/admin/dashboard/allocations/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >Create Allocation</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by number plate or lot number"
          className="w-full border p-2 mb-4 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length > 0 ? (
            filtered.map((alloc) => (
              <div
                key={alloc.allocationId}
                className="bg-white border-l-4 border-indigo-500 shadow-md rounded p-4 space-y-2"
              >
                <div>
                  <strong className="text-gray-600">Number Plate:</strong>{" "}
                  <span
                    onClick={() => navigate(`/admin/dashboard/vehicles/${alloc.numberPlate}`)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {alloc.numberPlate}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Lot Number:</strong>{" "}
                  <span
                    onClick={() => navigate(`/admin/dashboard/parking-lots/${alloc.lotNumber}`)}
                    className="text-green-600 hover:underline cursor-pointer"
                  >
                    {alloc.lotNumber}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">From:</strong>{" "}
                  {alloc.allocatedFromDate}
                </div>
                <div>
                  <strong className="text-gray-600">To:</strong>{" "}
                  {alloc.allocatedUptoDate}
                </div>
                <div>
                  <strong className="text-gray-600">Days:</strong>{" "}
                  {alloc.allocatedDays}
                </div>

                {new Date(alloc.allocatedUptoDate) >= new Date() && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/dashboard/allocations/edit/${alloc.allocationId}`)
                      }
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(alloc.allocationId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No allocations found.
            </p>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Allocations;
