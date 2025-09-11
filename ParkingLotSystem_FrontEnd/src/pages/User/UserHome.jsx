import React, { useEffect, useState } from "react";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user details from localStorage (set at login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">No user information available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md border">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 text-center">
        User Information
      </h2>
      <div className="space-y-3">
        <div>
          <p className="text-gray-500 text-sm">Full Name</p>
          <p className="text-lg font-medium">{user.fullName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Phone</p>
          <p className="text-lg font-medium">{user.phoneNumber}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Role</p>
          <p className="text-lg font-medium">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
