"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useArticleContext } from "../ArticleContext";

const CategoryList = () => {
  const { categories, setCategories } = useArticleContext();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const toggleActive = (id) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Category List</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 rounded-l-xl">Name</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Slug</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Active</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="py-3 px-4 text-gray-600">{cat.slug}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{cat.description}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={cat.isActive}
                      onChange={() => toggleActive(cat.id)}
                      className="w-5 h-5 accent-green-600"
                    />
                  </td>
                  <td className="py-3 px-4 text-gray-600">{cat.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className="p-2 rounded hover:bg-gray-100"
                    >
                      <Pencil className="w-5 h-5 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found.</p>
          </div>
        )}

        {selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Edit Category</h2>
              <p><strong>Name:</strong> {selectedCategory.name}</p>
              <p><strong>Slug:</strong> {selectedCategory.slug}</p>
              <p><strong>Description:</strong> {selectedCategory.description}</p>
              <p><strong>Status:</strong> {selectedCategory.isActive ? "Active" : "Inactive"}</p>
              <p><strong>Created At:</strong> {selectedCategory.createdAt}</p>
              <p className="text-sm text-gray-500 mt-3">Edit form functionality can be implemented here.</p>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
