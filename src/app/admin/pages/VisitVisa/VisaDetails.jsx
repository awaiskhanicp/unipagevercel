"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

const dummyCountries = [
  { id: 1, name: "Pakistan" },
  { id: 2, name: "United Kingdom" },
  { id: 3, name: "Canada" },
];

const initialDetails = [
  {
    id: 1,
    country: "Pakistan",
    type: "Tourist",
    description: "Tourist visa for Pakistan.",
    createdAt: "2024-06-20",
  },
  {
    id: 2,
    country: "Canada",
    type: "Student",
    description: "Student visa for Canada.",
    createdAt: "2024-06-22",
  },
];

const VisaDetails = () => {
  const [details, setDetails] = useState(initialDetails);
  const [form, setForm] = useState({ country: "", type: "", description: "" });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.country || !form.type || !form.description) return;

    const now = new Date().toISOString().slice(0, 10);

    if (editId) {
      setDetails((prev) =>
        prev.map((d) => (d.id === editId ? { ...d, ...form } : d))
      );
      setEditId(null);
    } else {
      setDetails((prev) => [
        ...prev,
        {
          id: prev.length ? prev[prev.length - 1].id + 1 : 1,
          ...form,
          createdAt: now,
        },
      ]);
    }
    setForm({ country: "", type: "", description: "" });
  };

  const handleEdit = (detail) => {
    setEditId(detail.id);
    setForm({
      country: detail.country,
      type: detail.type,
      description: detail.description,
    });
  };

  const handleDelete = (id) => {
    setDetails((prev) => prev.filter((d) => d.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({ country: "", type: "", description: "" });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Visa Details</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 bg-white p-6 rounded-xl shadow mb-8 items-end"
      >
        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-[180px]"
          required
        >
          <option value="">Select Country</option>
          {dummyCountries.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="type"
          placeholder="Visa Title"
          value={form.type}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-[180px]"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border px-3 py-2 rounded flex-1 min-w-[200px]"
          rows={2}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">
                  Title
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Description
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Country
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                  Created At
                </th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {details.map((detail) => (
                <tr
                  key={detail.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {detail.type}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {detail.description}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{detail.country}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {detail.createdAt}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(detail)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(detail.id)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {details.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No visa details found.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaDetails;
