"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";

const EditAdmin = () => {
  const router = useRouter();
  const params = useParams();
  const adminId = params.id;

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  useEffect(() => {
    if (adminId) {
      fetchAdmin();
    }
  }, [adminId]);

  const fetchAdmin = async () => {
    try {
      const response = await fetch(`/api/internal/auth/users/admin/${adminId}`);
      const data = await response.json();
      
      if (data.success) {
        setAdmin(data.admin);
        setFormData({
          firstName: data.admin.first_name || "",
          lastName: data.admin.last_name || "",
          email: data.admin.email || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        });
      } else {
        alert("Failed to fetch admin data");
        router.push("/admin-register/list");
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
      alert("Error fetching admin data");
      router.push("/admin-register/list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    
    // If changing password, validate password fields
    if (formData.newPassword.trim()) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        alert("New password and confirm password do not match.");
        return;
      }
      
      if (formData.newPassword.length < 6) {
        alert("New password must be at least 6 characters long.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
      };

      // Only include password fields if changing password
      if (formData.newPassword.trim()) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }

      const response = await fetch(`/api/internal/auth/users/admin/${adminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('Update response:', data);
      
      if (response.ok && data.success) {
        alert("Admin Updated Successfully.");
        router.push("/admin-register/list");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#0B6D76]" />
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl w-full text-center">
          <p>Admin not found</p>
          <Link
            href="/admin-register/list"
            className="mt-4 inline-block bg-[#0B6D76] text-white px-6 py-2 rounded-xl hover:bg-[#085a61]"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 mb-6 sm:mb-8">
          <Link
            href="/admin-register/list"
            className="p-2 mb-2 sm:mb-0 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Admin Account</h1>
            <p className="text-gray-600 text-sm sm:text-base">Update administrator information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Leave blank if not changing password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Leave blank if not changing password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0B6D76] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? 'Updating...' : 'Update Admin'}</span>
            </button>
            <Link
              href="/admin-register/list"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdmin;
