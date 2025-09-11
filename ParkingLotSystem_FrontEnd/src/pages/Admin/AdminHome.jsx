import React from "react";

const AdminHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Welcome message with animation */}
        {user && (
          <h1 className="text-2xl font-bold text-center text-emerald-600 mb-4 animate-slidein">
            Welcome, {user.fullName} 👋
          </h1>
        )}

        <h2 className="text-xl font-bold text-center text-blue-700 mb-6">
          👤 Admin Dashboard
        </h2>

        {user ? (
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg font-semibold">{user.fullName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-lg font-semibold capitalize">{user.role}</p>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center">❌ No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
