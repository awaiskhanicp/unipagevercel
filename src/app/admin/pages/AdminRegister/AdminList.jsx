"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import Pagination from "../../components/Pagination";
import AdvancedFilter from "../../components/AdvancedFilter";
import Swal from "sweetalert2";

const AdminList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 admins per page
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Filter effect - only apply when search term exists
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAdmins(admins);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = admins.filter(
        (admin) =>
          (admin.first_name?.toLowerCase() || '').includes(term) ||
          (admin.last_name?.toLowerCase() || '').includes(term) ||
          (admin.email?.toLowerCase() || '').includes(term) ||
          (admin.user_type?.toLowerCase() || '').includes(term)
      );
      setFilteredAdmins(filtered);
      console.log('🔍 AdminList: Search Filter Applied:', {
        searchTerm,
        totalAdmins: admins.length,
        filteredCount: filtered.length
      });
    }
  }, [searchTerm, admins]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setSearchTerm(newFilters.search);
    // Reset to first page when filters change
    if (newFilters.search !== searchTerm) {
      setCurrentPage(1);
    }
  };

  // Fetch admins function
  const fetchAdmins = async () => {
    try {
      const response = await fetch(`/api/internal/auth/users/admin?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        const adminData = (data.users || []).map(admin => ({
          ...admin,
          permissions: []
        }));
        
        console.log('✅ AdminList: API Response:', {
          success: data.success,
          usersCount: adminData.length,
          totalItems: data.meta?.totalItems,
          totalPages: data.meta?.totalPages,
          currentPage,
          itemsPerPage
        });
        
        setAdmins(adminData);
        // Only set filtered admins if there's no search term
        if (!searchTerm) {
          setFilteredAdmins(adminData);
        }
        
        const totalItems = data.meta?.totalItems || 0;
        const totalPages = data.meta?.totalPages || Math.ceil(totalItems / itemsPerPage) || 1;
        
        setTotalItems(totalItems);
        setTotalPages(totalPages);
        
        console.log('✅ AdminList: State Updated:', {
          totalItems,
          totalPages,
          adminsCount: adminData.length
        });
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const permissionOptions = [
    "View Dashboard",
    "Manage Users",
    "Edit Content",
    "Delete Records",
    "Manage Settings",
    "View Reports",
    "Assign Roles",
    "Access Logs"
  ];

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditForm({
      firstName: admin.first_name || "",
      lastName: admin.last_name || "",
      email: admin.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    });
    setShowEditModal(true);
  };

  const togglePermission = (perm) => {
    if (!selectedAdmin) return;
    const updatedPermissions = selectedAdmin.permissions?.includes(perm)
      ? selectedAdmin.permissions.filter((p) => p !== perm)
      : [...(selectedAdmin.permissions || []), perm];

    setSelectedAdmin({ ...selectedAdmin, permissions: updatedPermissions });
  };

  // Toggle user status (activate/deactivate)
  const toggleUserStatus = async (admin) => {
    const newStatus = !admin.is_active;
    const action = newStatus ? 'activate' : 'deactivate';
    

    
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${action} ${admin.first_name} ${admin.last_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0B6D76',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {

        const response = await fetch(`/api/internal/auth/users/admin/${admin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_active: newStatus
          }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          // Update the admin in the local state
          const updatedAdmins = admins.map((a) =>
            a.id === admin.id ? { ...a, is_active: newStatus } : a
          );

          setAdmins(updatedAdmins);
          
          // Update filtered admins if they exist
          if (filteredAdmins.length > 0) {
            const updatedFiltered = filteredAdmins.map((a) =>
              a.id === admin.id ? { ...a, is_active: newStatus } : a
            );
            setFilteredAdmins(updatedFiltered);
          }
          
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Admin ${action}d successfully.`,
            confirmButtonColor: '#0B6D76',
            confirmButtonText: 'OK'
          });
        } else {
          throw new Error(data.message || `Failed to ${action} admin`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || `Failed to ${action} admin`,
        confirmButtonColor: '#0B6D76',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
              Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please fill in all required fields.',
          confirmButtonColor: '#0B6D76'
        });
      return;
    }
    
    // If changing password, validate password fields
    if (editForm.newPassword.trim()) {
      if (editForm.newPassword !== editForm.confirmNewPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'New password and confirm password do not match.',
          confirmButtonColor: '#0B6D76'
        });
        return;
      }
      
      if (editForm.newPassword.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'New password must be at least 6 characters long.',
          confirmButtonColor: '#0B6D76'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        first_name: editForm.firstName.trim(),
        last_name: editForm.lastName.trim(),
        email: editForm.email.trim(),
      };

      // Only include password fields if changing password
      if (editForm.newPassword.trim()) {
        updateData.current_password = editForm.currentPassword;
        updateData.new_password = editForm.newPassword;
      }

      const response = await fetch(`/api/internal/auth/users/admin/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the admin in the local state
        const updatedAdmins = admins.map((admin) =>
          admin.id === editingAdmin.id 
            ? { 
                ...admin, 
                first_name: editForm.firstName.trim(),
                last_name: editForm.lastName.trim(),
                email: editForm.email.trim()
              }
            : admin
        );

        setAdmins(updatedAdmins);
        
        // Update filtered admins as well
        const updatedFiltered = filteredAdmins.map((admin) =>
          admin.id === editingAdmin.id 
            ? { 
                ...admin, 
                first_name: editForm.firstName.trim(),
                last_name: editForm.lastName.trim(),
                email: editForm.email.trim()
              }
            : admin
        );
        setFilteredAdmins(updatedFiltered);
        
        setShowEditModal(false);
        setEditingAdmin(null);
        setEditForm({
          firstName: "",
          lastName: "",
          email: "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: ""
        });
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Admin Updated Successfully.',
          confirmButtonColor: '#0B6D76'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || "Update failed",
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (error) {
      console.error('Error updating admin:', error);
              Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Network error. Please try again.',
          confirmButtonColor: '#0B6D76'
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const savePermissions = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch(`/api/internal/auth/users/admin/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: selectedAdmin.permissions || []
        })
      });

      const data = await response.json();

      if (data?.success) {
        // Since permissions can't be stored in the database yet, just show a message
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: 'Permissions update not implemented yet - metadata field does not exist',
          confirmButtonColor: '#0B6D76'
        });
        setShowPermissions(false);
        setSelectedAdmin(null);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
              Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update permissions',
          confirmButtonColor: '#0B6D76'
        });
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/internal/auth/users/admin/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        const updated = admins.filter((admin) => admin.id !== id);
        setAdmins(updated);
        
        // Update filtered admins as well
        const updatedFiltered = filteredAdmins.filter((admin) => admin.id !== id);
        setFilteredAdmins(updatedFiltered);
        
        // Refresh the list to ensure pagination is correct
        if (admins.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Admin Deleted Successfully',
          confirmButtonColor: '#0B6D76'
        });
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete admin',
        confirmButtonColor: '#0B6D76'
      });
    }
  };

  // Remove unused pagination calculation since API handles pagination
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + Math.min(itemsPerPage, filteredAdmins.length);
  // const paginatedAdminsForDisplay = filteredAdmins.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-4xl w-full text-center">
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Admin Users</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage administrator accounts and permissions</p>
          </div>
          <Link
            href="/admin-register/create"
            className="bg-[#0B6D76] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#085a61] transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span>Add Admin</span>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <AdvancedFilter
            onFilterChange={handleFilterChange}
            searchPlaceholder="Search admins by name, email, or user type..."
            showDateFilters={true}
            showSearchButton={true}
            className="mb-4"
          />
          

        </div>

        {/* Table */}
        {filteredAdmins.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm ? 'No admin users found matching your search.' : 'No admin users found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">User Type</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Created At</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">Permissions</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{admin.first_name} {admin.last_name}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">{admin.email}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap capitalize text-sm">{admin.user_type}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {admin.permissions?.length > 0 ? (
                        <ul className="text-xs text-gray-700 list-disc list-inside">
                          {admin.permissions.slice(0, 2).map((perm, idx) => (
                            <li key={idx}>{perm}</li>
                          ))}
                          {admin.permissions.length > 2 && (
                            <li className="text-gray-500">+{admin.permissions.length - 2} more</li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No permissions</p>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(admin)}
                          className={`p-2 rounded-lg transition-colors ${
                            admin.is_active 
                              ? 'text-orange-600 hover:bg-orange-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={admin.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {admin.is_active ? <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          onClick={() => {
                            Swal.fire({
                              title: 'Are you sure?',
                              text: "You won't be able to revert this!",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#0B6D76',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, delete it!'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(admin.id);
                              }
                            });
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        {/* <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowPermissions(true);
                          }}
                          className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition-colors"
                          title="Manage Permissions"
                        >
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}



        {/* Pagination Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p>Showing {filteredAdmins.length} of {totalItems} admins | Page {currentPage} of {totalPages}</p>
        </div>

        {/* Pagination */}
        {(totalPages > 1 || totalItems > itemsPerPage) && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            startIndex={(currentPage - 1) * itemsPerPage}
            endIndex={Math.min(currentPage * itemsPerPage, totalItems)}
          />
        )}

        {/* Permissions Modal */}
        {showPermissions && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Set Permissions for {selectedAdmin.first_name} {selectedAdmin.last_name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {permissionOptions.map((perm) => (
                  <label key={perm} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAdmin.permissions?.includes(perm) || false}
                      onChange={() => togglePermission(perm)}
                      className="rounded text-[#0B6D76] focus:ring-[#0B6D76]"
                    />
                    <span className="text-sm sm:text-base">{perm}</span>
                  </label>
                ))}
              </div>
              {(!selectedAdmin.permissions || selectedAdmin.permissions.length === 0) && (
                <p className="text-red-500 mt-4 text-xs sm:text-sm">No permissions selected</p>
              )}
              <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 gap-2">
                <button 
                  onClick={() => setShowPermissions(false)} 
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={savePermissions} 
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && editingAdmin && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingAdmin(null);
              setEditForm({
                firstName: "",
                lastName: "",
                email: "",
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
              });
              setShowPassword(false);
              setShowNewPassword(false);
            }}
          >
            <div 
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Admin: {editingAdmin.first_name} {editingAdmin.last_name}
                </h2>
                                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAdmin(null);
                      setEditForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: ""
                      });
                      setShowPassword(false);
                      setShowNewPassword(false);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
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
                      value={editForm.lastName}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Change Password (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={editForm.currentPassword}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                          placeholder="Leave blank if not changing password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? "👁️" : "👁️‍🗨️"}
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
                          value={editForm.newPassword}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                          placeholder="Leave blank if not changing password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showNewPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={editForm.confirmNewPassword}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B6D76] focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAdmin(null);
                      setEditForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: ""
                      });
                      setShowPassword(false);
                      setShowNewPassword(false);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#0B6D76] text-white rounded-lg hover:bg-[#085a61] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminList;