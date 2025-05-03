import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaEye, FaEyeSlash, FaUserPlus, FaSearch, FaPencilAlt, FaTrashAlt,
  FaUserTie, FaFilter, FaTimes, FaSave, FaUserEdit, FaPhone, FaEnvelope
} from "react-icons/fa";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    fullname: "",
    staffType: "",
    contact: "",
    email: "",
    password: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Valid staff types based on the backend model
  const staffTypes = ["chef", "waiter", "cashier", "manager", "cleaner", "bartender", "host", "kitchen_helper", "delivery"];

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Format staff type for display
  const formatStaffType = (type) => {
    if (!type) return "";
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get token from local storage
  const getToken = () => localStorage.getItem('token');

  // API base URL - This is the correct base URL to work with our routes
  const API_URL = "http://localhost:4000/api";

  // API service functions
  const staffService = {
    // Get all staff members
    getAllStaff: async () => {
      try {
        const response = await axios.get(`${API_URL}/users/staff/all`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error("Error fetching staff:", error);
        throw error;
      }
    },

    // Get staff by type
    getStaffByType: async (type) => {
      try {
        const response = await axios.get(`${API_URL}/users/staff/${type}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error(`Error fetching ${type} staff:`, error);
        throw error;
      }
    },

    // Create new staff member
    createStaff: async (staffData) => {
      try {
        console.log("Creating staff with data:", staffData); // Debug log
        const response = await axios.post(`${API_URL}/users`, staffData, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error creating staff:", error);
        console.error("Response data:", error.response?.data); // Log the actual error from server
        throw error;
      }
    },

    // Update staff member
    updateStaff: async (id, staffData) => {
      try {
        const response = await axios.put(`${API_URL}/users/${id}`, staffData, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error updating staff:", error);
        throw error;
      }
    },

    // Delete staff member
    deleteStaff: async (id) => {
      try {
        const response = await axios.delete(`${API_URL}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error deleting staff:", error);
        throw error;
      }
    }
  };

  // Fetch all staff - wrapped in useCallback to avoid dependency warnings
  const fetchAllStaff = useCallback(async () => {
    try {
      const staffData = await staffService.getAllStaff();
      setStaffList(staffData);
    } catch (error) {
      showNotification("Failed to load staff data", "error");
      setStaffList([]);
    }
  }, []);

  // Fetch staff by type
  const fetchStaffByType = useCallback(async (type) => {
    if (type === "All") {
      fetchAllStaff();
      return;
    }

    try {
      const staffData = await staffService.getStaffByType(type);
      setStaffList(staffData);
    } catch (error) {
      showNotification(`Failed to load ${formatStaffType(type)} staff data`, "error");
      setStaffList([]);
    }
  }, [fetchAllStaff]);

  // Load staff data on component mount
  useEffect(() => {
    fetchAllStaff();
  }, [fetchAllStaff]);

  // Handle filter change
  useEffect(() => {
    if (activeFilter !== "All") {
      fetchStaffByType(activeFilter);
    } else {
      fetchAllStaff();
    }
  }, [activeFilter, fetchAllStaff, fetchStaffByType]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, contact: value });
        setPhoneError(false);
      } else if (value.length > 10) {
        setPhoneError(true);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, fullname, staffType, contact, email, password } = formData;

    if (!fullname || !staffType || !contact || !email || (!id && !password)) {
      showNotification("All fields are required!", "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Validate phone number
    if (contact.length !== 10 || !/^\d+$/.test(contact)) {
      showNotification("Phone number must be 10 digits", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editIndex !== null) {
        // Update staff
        const updateData = {
          fullname,
          staffType,
          contact,
          email,
          role: "staff"
        };

        // Only include password if it's provided (for updates)
        if (password) {
          updateData.password = password;
        }

        await staffService.updateStaff(id, updateData);
        showNotification("Staff updated successfully");
      } else {
        // Add new staff - Make sure staffType is included and valid
        const staffData = {
          fullname,
          staffType: staffType.trim(), // Ensure there's no whitespace
          contact,
          email,
          password,
          role: "staff" // Always set role to staff
        };

        console.log("Submitting staff data:", staffData); // Debug log
        await staffService.createStaff(staffData);
        showNotification("New staff added successfully");
      }

      // Refresh staff list after add or update
      if (activeFilter === "All") {
        fetchAllStaff();
      } else {
        fetchStaffByType(activeFilter);
      }

      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || "Operation failed. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Reset form after submit
  const resetForm = () => {
    setFormData({ id: null, fullname: "", staffType: "", contact: "", email: "", password: "" });
    setEditIndex(null);
    setPhoneError(false);
  };

  // Handle edit button
  const handleEdit = (index) => {
    const staff = staffList[index];
    setFormData({
      id: staff._id,
      fullname: staff.fullname,
      staffType: staff.staffType,
      contact: staff.contact,
      email: staff.email,
      password: "" // Clear password on edit for security
    });
    setEditIndex(index);
    setIsFormVisible(true);
  };

  // Handle delete button
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      await staffService.deleteStaff(id);
      showNotification("Staff deleted successfully");

      // Refresh staff list after delete
      if (activeFilter === "All") {
        fetchAllStaff();
      } else {
        fetchStaffByType(activeFilter);
      }
    } catch (error) {
      showNotification("Failed to delete staff", "error");
    }
  };

  // Filter staff based on search term and staff type filter
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch =
        staff.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatStaffType(staff.staffType)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.contact?.includes(searchTerm);

    return matchesSearch;
  });

  // Calculate counts for each staff type
  const staffTypeCountMap = {
    All: staffList.length,
    ...staffTypes.reduce((acc, type) => {
      acc[type] = Array.isArray(staffList) ?
          staffList.filter(staff => staff.staffType === type).length : 0;
      return acc;
    }, {})
  };

  // Get staff type badge color
  const getStaffTypeBadgeColor = (type) => {
    switch(type) {
      case "waiter": return "bg-blue-50 text-blue-800 border-blue-200";
      case "cashier": return "bg-purple-50 text-purple-800 border-purple-200";
      case "chef": return "bg-green-50 text-green-800 border-green-200";
      case "manager": return "bg-amber-50 text-amber-800 border-amber-200";
      case "bartender": return "bg-red-50 text-red-800 border-red-200";
      case "host": return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "cleaner": return "bg-gray-50 text-gray-800 border-gray-200";
      case "kitchen_helper": return "bg-lime-50 text-lime-800 border-lime-200";
      case "delivery": return "bg-cyan-50 text-cyan-800 border-cyan-200";
      default: return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  return (
      <div className="flex min-h-screen">
        {/* Main content area with proper margin for sidebar */}
        <div className="p-6 bg-gray-50 flex-1 ml-64">
          {/* Notification */}
          {notification.show && (
              <div className={`fixed top-5 right-5 z-50 p-3 rounded-md shadow-lg flex items-center ${
                  notification.type === "error" ? "bg-red-100 text-red-800 border-l-4 border-red-500" :
                      "bg-green-100 text-green-800 border-l-4 border-green-500"
              }`}>
                <div className="mr-3">
                  {notification.type === "error" ?
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg> :
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                  }
                </div>
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
          )}

          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaUserTie className="mr-2 text-gray-800" />
                  Staff Management
                </h1>
                <p className="text-gray-500 mt-1">Manage your restaurant staff members</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-grow">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search staff"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 bg-gray-50"
                  />
                  {searchTerm && (
                      <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes size={14} />
                      </button>
                  )}
                </div>

                <button
                    onClick={() => {
                      resetForm();
                      setIsFormVisible(!isFormVisible);
                    }}
                    className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                        isFormVisible
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                >
                  {isFormVisible ? <FaTimes className="mr-2" /> : <FaUserPlus className="mr-2" />}
                  {isFormVisible ? "Cancel" : "Add Staff"}
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                  onClick={() => setActiveFilter("All")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === "All"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                All ({staffTypeCountMap["All"]})
              </button>

              {staffTypes.map(type => (
                  <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeFilter === type
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {formatStaffType(type)} ({staffTypeCountMap[type] || 0})
                  </button>
              ))}
            </div>

            {/* Conditional Form Display */}
            {isFormVisible && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
                  <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {editIndex !== null ? <FaUserEdit className="mr-2" /> : <FaUserPlus className="mr-2" />}
                      <h2 className="font-medium">{editIndex !== null ? "Edit Staff Member" : "Add New Staff Member"}</h2>
                    </div>
                    {editIndex !== null && (
                        <div className="flex items-center">
                          <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">Editing {formData.fullname}</span>
                        </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                              type="text"
                              name="fullname"
                              value={formData.fullname}
                              onChange={handleInputChange}
                              placeholder="Enter staff name"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
                          <select
                              name="staffType"
                              value={formData.staffType}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"
                          >
                            <option value="">Select Staff Type</option>
                            {staffTypes.map((type) => (
                                <option key={type} value={type}>
                                  {formatStaffType(type)}
                                </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FaPhone className="text-gray-400" size={14} />
                            </div>
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                placeholder="10-digit number"
                                className={`w-full pl-9 px-3 py-2 bg-gray-50 border ${phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-800'} rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                            />
                          </div>
                          {phoneError && <p className="text-red-500 text-xs mt-1">Phone number should be 10 digits</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FaEnvelope className="text-gray-400" size={14} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="name@example.com"
                                className="w-full pl-9 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editIndex !== null ? "Password (leave blank to keep current)" : "Password"}
                          </label>
                          <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder={editIndex !== null ? "Enter new password (optional)" : "Enter password"}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:bg-white transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-4">
                          <button
                              type="button"
                              onClick={() => {
                                resetForm();
                                setIsFormVisible(false);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mr-3"
                          >
                            Cancel
                          </button>
                          <button
                              type="submit"
                              disabled={formSubmitting}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-70"
                          >
                            <FaSave className="mr-2" />
                            {formSubmitting ? "Saving..." : (editIndex !== null ? "Update" : "Save")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
            )}

            {/* Staff Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center">
                <div className="flex items-center">
                  <FaUserTie className="mr-2" />
                  <h2 className="font-medium">Staff Directory</h2>
                </div>
                <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1">
                  <FaFilter className="mr-2 text-gray-300" size={12} />
                  <span className="text-sm">{activeFilter === "All" ? "All Staff" : formatStaffType(activeFilter)}</span>
                  <span className="ml-2 bg-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {filteredStaff.length}
                </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {filteredStaff.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-6 rounded-full mb-4">
                        <FaUserTie size={36} className="text-gray-400" />
                      </div>
                      <h3 className="text-gray-800 font-medium mb-1">
                        {searchTerm || activeFilter !== "All" ? "No matching staff found" : "No staff members yet"}
                      </h3>
                      <p className="text-gray-500 text-sm max-w-md mb-4">
                        {searchTerm || activeFilter !== "All"
                            ? "Try adjusting your search or filter criteria to find what you're looking for."
                            : "Start by adding your first staff member to manage your restaurant team."}
                      </p>
                      {(searchTerm || activeFilter !== "All") && (
                          <div className="flex space-x-3">
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-sm text-gray-800 hover:text-gray-600 underline"
                                >
                                  Clear search
                                </button>
                            )}
                            {activeFilter !== "All" && (
                                <button
                                    onClick={() => setActiveFilter('All')}
                                    className="text-sm text-gray-800 hover:text-gray-600 underline"
                                >
                                  Show all staff
                                </button>
                            )}
                          </div>
                      )}
                    </div>
                ) : (
                    <table className="w-full">
                      <thead>
                      <tr className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3 text-left font-medium">Name</th>
                        <th className="px-6 py-3 text-left font-medium">Staff Type</th>
                        <th className="px-6 py-3 text-left font-medium">Contact</th>
                        <th className="px-6 py-3 text-center font-medium">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredStaff.map((staff, index) => (
                          <tr key={staff._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="bg-gray-800 rounded-full h-9 w-9 flex items-center justify-center text-white mr-3">
                                  {staff.fullname?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'N/A'}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">{staff.fullname}</div>
                                  <div className="text-gray-500 text-xs">{staff.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                          <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getStaffTypeBadgeColor(staff.staffType)}`}>
                            {formatStaffType(staff.staffType)}
                          </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-gray-500 text-sm">
                                <FaPhone className="mr-2" size={14} />
                                {staff.contact}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center space-x-2">
                                <button
                                    onClick={() => handleEdit(index)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="Edit"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(staff._id, staff.fullname)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                  <FaTrashAlt size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default StaffManagement;
