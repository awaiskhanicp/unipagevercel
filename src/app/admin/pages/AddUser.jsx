'use client'; // Add only if you're using App Router

import React, { useState } from "react";
import { useUserList } from "./UserContext";

const initialForm = {
  image: "",
  name: "",
  email: "",
  phone: "",
  role: "User",
};

const AddUser = ({ onSuccess }) => {
  const { addUser } = useUserList();
  const [form, setForm] = useState(initialForm);
  const [toastMsg, setToastMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.role) return;

    addUser(form);
    setToastMsg("✅ User has been added successfully.");
    setTimeout(() => setToastMsg(""), 3000); // Reset toast
    setForm(initialForm);
    onSuccess?.();
  };

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
          {toastMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
