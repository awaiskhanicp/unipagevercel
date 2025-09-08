

"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, X, Trash2, Loader2 } from "lucide-react";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/internal/blog-categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setMessage({ type: "error", text: "Failed to fetch categories" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error fetching categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (!data.slug.trim()) {
      newErrors.slug = "Slug is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim('-'); // Remove leading/trailing hyphens
  };

  const handleNameChange = (name, isEdit = false) => {
    const slug = generateSlug(name);
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, name, slug }));
    } else {
      setFormData(prev => ({ ...prev, name, slug }));
    }
  };

  const toggleActive = async (id) => {
    try {
      const category = categories.find(cat => cat.id === id);
      const newStatus = !category.is_active;
      
      const response = await fetch(`/api/internal/blog-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: newStatus
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCategories(prev =>
          prev.map(cat =>
            cat.id === id ? { ...cat, is_active: newStatus } : cat
          )
        );
        setMessage({ type: "success", text: "Category status updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update status" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error updating category status" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (validateForm(formData)) {
      try {
        setSubmitting(true);
        
        const response = await fetch('/api/internal/blog-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            is_active: true,
            sort_order: categories.length + 1
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setFormData({ name: "", slug: "", description: "" });
          setShowAddForm(false);
          setMessage({ type: "success", text: "Category added successfully!" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
          // Refresh the categories list
          fetchCategories();
        } else {
          setMessage({ type: "error", text: result.message || "Failed to add category" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error adding category" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (validateForm(editFormData)) {
      try {
        setSubmitting(true);
        
        const response = await fetch(`/api/internal/blog-categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editFormData.name.trim(),
            slug: editFormData.slug.trim(),
            description: editFormData.description.trim()
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setShowEditForm(false);
          setSelectedCategory(null);
          setMessage({ type: "success", text: "Category updated successfully!" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
          // Refresh the categories list
          fetchCategories();
        } else {
          setMessage({ type: "error", text: result.error || "Failed to update category" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error updating category" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const openEditForm = (cat) => {
    setSelectedCategory(cat);
    setEditFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description
    });
    setShowEditForm(true);
    setErrors({});
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setFormData({ name: "", slug: "", description: "" });
    setErrors({});
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setSelectedCategory(null);
    setErrors({});
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(`/api/internal/blog-categories/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        
        if (result.success) {
          setMessage({ type: "success", text: "Category deleted successfully!" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
          // Refresh the categories list
          fetchCategories();
        } else {
          setMessage({ type: "error", text: result.error || "Failed to delete category" });
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
      } catch (error) {
        setMessage({ type: "error", text: "Error deleting category" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category List</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === "success" 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

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
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-gray-500 text-lg mt-2">Loading categories...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <p className="text-gray-500 text-lg">No categories found.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{cat.name}</td>
                    <td className="py-3 px-4 text-gray-600">{cat.slug}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{cat.description}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={cat.is_active}
                        onChange={() => toggleActive(cat.id)}
                        className="w-5 h-5 accent-green-600"
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openEditForm(cat)}
                        className="p-2 rounded hover:bg-gray-100"
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 rounded hover:bg-gray-100 ml-2"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Popup */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Category</h2>
              <button
                onClick={closeAddForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category slug"
                  required
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Popup */}
      {showEditForm && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Category</h2>
              <button
                onClick={closeEditForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={editFormData.slug}
                  onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter category slug"
                  required
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;