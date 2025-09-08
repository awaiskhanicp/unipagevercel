'use client';

import React, { useState } from "react";

const initialUsers = [
  {
    id: 1,
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    name: "Ali Raza",
    email: "ali@email.com",
    phone: "0300-1234567",
    role: "Admin",
    createdAt: "2024-06-01",
  },
  {
    id: 2,
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    name: "Sara Khan",
    email: "sara@email.com",
    phone: "0321-7654321",
    role: "Editor",
    createdAt: "2024-06-02",
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState({
    image: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        ...form,
      },
    ]);
    setForm({ image: "", name: "", email: "", phone: "", role: "", createdAt: new Date().toISOString().slice(0, 10) });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={form.image}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Image</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover mx-auto" />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                  <td className="py-3 px-4 text-gray-600">{user.role}</td>
                  <td className="py-3 px-4 text-gray-600">{user.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
