import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://localhost:7020/api/Users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://localhost:7020/api/Users/${editUser.userId}`,
        editUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      setEditUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://localhost:7020/api/Users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (u.mobileNumber || "").includes(search)
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>

      <input
        className="border px-3 py-2 mb-4 w-full md:w-1/3 rounded"
        placeholder="Search by name or email or mobileNumber"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.userId || index} className="text-center border">
              <td className="p-2 border">{user.fullName || "N/A"}</td>
              <td className="p-2 border">{user.email || "N/A"}</td>
              <td className="p-2 border">{user.mobileNumber || "N/A"}</td>
              <td className="p-2 border">{user.role || "User"}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.userId)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editUser && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="mt-6 bg-gray-100 p-6 rounded shadow-md w-full max-w-2xl">
    <h3 className="text-xl font-semibold mb-4">Edit User</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          id="fullName"
          className="w-full border p-2 rounded"
          value={editUser.fullName}
          onChange={(e) =>
            setEditUser({ ...editUser, fullName: e.target.value })
          }
          placeholder="Full Name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border p-2 rounded"
          value={editUser.email}
          onChange={(e) =>
            setEditUser({ ...editUser, email: e.target.value })
          }
          placeholder="Email"
        />
      </div>

      <div>
        <label htmlFor="mobile" className="block text-sm font-medium mb-1">
          Mobile Number
        </label>
        <input
          id="mobile"
          className="w-full border p-2 rounded"
          value={editUser.mobileNumber}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[6-9][0-9]{0,9}$/.test(value) || value === "") {
              setEditUser({ ...editUser, mobileNumber: value });
            }
          }}
          placeholder="Mobile"
          maxLength={10}
        />
      </div>
    </div>

    <div className="mt-6 flex justify-end">
      <button
        onClick={handleUpdate}
        className="bg-green-600 text-white px-4 py-2 rounded mr-2"
      >
        Save
      </button>
      <button
        onClick={() => setEditUser(null)}
        className="bg-gray-400 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
</div>

      )}
    </div>
  );
};

export default ManageUsers;
