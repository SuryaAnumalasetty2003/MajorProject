import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import Dashboard from "./pages/Dashboard";
import Allocations from "./pages/Admin/ParkingAllocations/Allocations";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserDashboard from "./pages/User/UserDashboard";
import ParkingLots from "./pages/Admin/ParkingLots/ParkingLots";
import ParkingLotDetail from "./pages/Admin/ParkingLots/ParkingLotDetail";
import EditParkingLot from "./pages/Admin/ParkingLots/EditParkingLot";
import AllocationForm from "./pages/Admin/ParkingAllocations/AllocationForm";
import EditAllocationForm from "./pages/Admin/ParkingAllocations/EditAllocationForm";
import VehicleList from "./pages/Admin/Vehicles/VehicleList";
// import VehicleForm from "./pages/Admin/Vehicles/VehicleForm";
import VehicleDetails from "./pages/Admin/Vehicles/VehicleDetails";
import AddVehicle from "./pages/User/AddVehicle";
import AddAllocation from "./pages/User/AddAllocation";
import ManageUsers from "./pages/Admin/ManageUsers";
import UserProtectedRoute from "./pages/UserProtectedRoute";
import AdminProtectedRoute from "./pages/AdminProtectedRoute";
import AdminHome from "./pages/Admin/AdminHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />

            <Route path="homepage" element={<AdminHome />} />

            <Route path="manage-users" element={<ManageUsers />} />

            <Route
              path="/admin/dashboard/allocations"
              element={<Allocations />}
            >
              <Route path="new" element={<AllocationForm />} />
              <Route path="edit/:id" element={<EditAllocationForm />} />
            </Route>

            <Route path="parking-lots" element={<ParkingLots />}>
              <Route path="edit/:id" element={<EditParkingLot />} />
            </Route>
            <Route path="parking-lots/:lotNumber" element={<ParkingLotDetail />}
            />

            <Route path="vehicles" element={<VehicleList />} />
            <Route path="vehicles/:numberPlate" element={<VehicleDetails />} />
          </Route>
        </Route>

        <Route element={<UserProtectedRoute />}>
          <Route path="/user/dashboard" element={<UserDashboard />}>
            <Route path="add-allocation" element={<AddAllocation />} />
            <Route path="add-vehicle" element={<AddVehicle />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
