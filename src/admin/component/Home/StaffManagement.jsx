
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FaEye, FaEyeSlash, FaUserPlus, FaSearch, FaPencilAlt, FaTrashAlt,
  FaUserTie, FaFilter, FaTimes, FaSave, FaUserEdit, FaPhone, FaEnvelope,
  FaExclamationTriangle, FaCheckCircle, FaInfoCircle
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
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Valid staff types based on the backend model
  const staffTypes = ["chef", "waiter", "cashier", "manager", "cleaner", "bartender", "host", "kitchen_helper", "delivery"];

  // Enhanced notification with better styling and icons
  const showNotification = (message, type = "success", duration = 4000) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, duration);
  };

  // Comprehensive validation functions
  const validateField = (name, value, allFormData = formData) => {
    const errors = {};

    switch (name) {
      case 'fullname':
        if (!value || value.trim().length === 0) {
          errors.fullname = "Full name is required";
        } else if (value.trim().length < 2) {
          errors.fullname = "Full name must be at least 2 characters long";
        } else if (value.trim().length > 50) {
          errors.fullname = "Full name cannot exceed 50 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.fullname = "Full name should only contain letters and spaces";
        }
        break;

      case 'staffType':
        if (!value || value.trim().length === 0) {
          errors.staffType = "Staff type is required";
        } else if (!staffTypes.includes(value)) {
          errors.staffType = "Please select a valid staff type";
        }
        break;

      case 'contact':
        if (!value || value.trim().length === 0) {
          errors.contact = "Phone number is required";
        } else if (!/^\d{10}$/.test(value)) {
          errors.contact = "Phone number must be exactly 10 digits";
        } else if (value.startsWith('0')) {
          errors.contact = "Phone number should not start with 0";
        } else {
          // Check for duplicate phone numbers (excluding current staff if editing)
          const isDuplicate = staffList.some(staff => 
            staff.contact === value && staff._id !== allFormData.id
          );
          if (isDuplicate) {
            errors.contact = "This phone number is already registered";
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || value.trim().length === 0) {
          errors.email = "Email address is required";
        } else if (!emailRegex.test(value)) {
          errors.email = "Please enter a valid email address";
        } else if (value.length > 100) {
          errors.email = "Email address cannot exceed 100 characters";
        } else {
          // Check for duplicate emails (excluding current staff if editing)
          const isDuplicate = staffList.some(staff => 
            staff.email.toLowerCase() === value.toLowerCase() && staff._id !== allFormData.id
          );
          if (isDuplicate) {
            errors.email = "This email address is already registered";
          }
        }
        break;

      case 'password':
        // Only validate password if it's a new staff member or if password is provided for existing staff
        if (editIndex === null || (editIndex !== null && value.length > 0)) {
          if (!value || value.length === 0) {
            if (editIndex === null) {
              errors.password = "Password is required";
            }
          } else if (value.length < 6) {
            errors.password = "Password must be at least 6 characters long";
          } else if (value.length > 128) {
            errors.password = "Password cannot exceed 128 characters";
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
          }
        }
        break;

      default:
        break;
    }

    return errors;
  };

  // Validate all fields
  const validateAllFields = (formData) => {
    let allErrors = {};
    
    Object.keys(formData).forEach(field => {
      if (field !== 'id') {
        const fieldErrors = validateField(field, formData[field], formData);
        allErrors = { ...allErrors, ...fieldErrors };
      }
    });

    return allErrors;
  };

  // Real-time validation as user types
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validateField(fieldName, formData[fieldName]);
    setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
    
    // Clear error if field becomes valid
    if (Object.keys(fieldErrors).length === 0 && validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Format staff type for display
  const formatStaffType = (type) => {
    if (!type) return "";
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get token from local storage
  const getToken = () => localStorage.getItem('token');

  // API base URL - This is the correct base URL to work with our routes
  const API_URL = process.env.REACT_APP_API_BASE_URL

  // API service functions with enhanced error handling
  const staffService = {
    // Get all staff members
    getAllStaff: async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/staff/all`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error("Error fetching staff:", error);
        if (error.response?.status === 401) {
          showNotification("Session expired. Please login again.", "error");
        } else if (error.response?.status === 403) {
          showNotification("You don't have permission to view staff data.", "error");
        } else {
          showNotification("Failed to load staff data. Please check your connection.", "error");
        }
        throw error;
      }
    },

    // Get staff by type
    getStaffByType: async (type) => {
      try {
        const response = await axios.get(`${API_URL}/api/users/staff/${type}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error(`Error fetching ${type} staff:`, error);
        showNotification(`Failed to load ${formatStaffType(type)} staff data.`, "error");
        throw error;
      }
    },

    // Create new staff member
    createStaff: async (staffData) => {
      try {
        console.log("Creating staff with data:", staffData);
        const response = await axios.post(`${API_URL}/api/users/add-staff`, staffData, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error creating staff:", error);
        console.error("Response data:", error.response?.data);
        
        // Enhanced error handling
        if (error.response?.status === 409) {
          showNotification("Staff member with this email or phone already exists.", "error");
        } else if (error.response?.status === 400) {
          const errorMsg = error.response?.data?.message || "Invalid staff data provided.";
          showNotification(errorMsg, "error");
        } else if (error.response?.status === 401) {
          showNotification("Session expired. Please login again.", "error");
        } else {
          showNotification("Failed to create staff member. Please try again.", "error");
        }
        throw error;
      }
    },

    // Update staff member
    updateStaff: async (id, staffData) => {
      try {
        const response = await axios.put(`${API_URL}/api/users/${id}`, staffData, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error updating staff:", error);
        
        if (error.response?.status === 409) {
          showNotification("Another staff member already has this email or phone number.", "error");
        } else if (error.response?.status === 404) {
          showNotification("Staff member not found.", "error");
        } else if (error.response?.status === 400) {
          const errorMsg = error.response?.data?.message || "Invalid staff data provided.";
          showNotification(errorMsg, "error");
        } else {
          showNotification("Failed to update staff member. Please try again.", "error");
        }
        throw error;
      }
    },

    // Delete staff member
    deleteStaff: async (id) => {
      try {
        const response = await axios.delete(`${API_URL}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        return response.data;
      } catch (error) {
        console.error("Error deleting staff:", error);
        
        if (error.response?.status === 404) {
          showNotification("Staff member not found.", "error");
        } else {
          showNotification("Failed to delete staff member. Please try again.", "error");
        }
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

  // Enhanced input change handler with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for contact field
    if (name === "contact") {
      // Only allow digits and limit to 10 characters
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, contact: value });
        setPhoneError(false);
        
        // Real-time validation for contact
        if (touchedFields.contact) {
          const fieldErrors = validateField(name, value);
          setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
          if (Object.keys(fieldErrors).length === 0 && validationErrors.contact) {
            setValidationErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.contact;
              return newErrors;
            });
          }
        }
      } else if (value.length > 10) {
        setPhoneError(true);
        showNotification("Phone number cannot exceed 10 digits", "warning", 2000);
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Real-time validation for other fields (only if field has been touched)
      if (touchedFields[name]) {
        const fieldErrors = validateField(name, value);
        setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
        
        // Clear error if field becomes valid
        if (Object.keys(fieldErrors).length === 0 && validationErrors[name]) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

  // Enhanced form submission with comprehensive validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allFields = { fullname: true, staffType: true, contact: true, email: true, password: true };
    setTouchedFields(allFields);
    
    // Validate all fields
    const allErrors = validateAllFields(formData);
    setValidationErrors(allErrors);
    
    // Check if there are any validation errors
    if (Object.keys(allErrors).length > 0) {
      const errorMessages = Object.values(allErrors);
      showNotification(`Please fix the following errors: ${errorMessages[0]}`, "error", 5000);
      
      // Focus on the first field with error
      const firstErrorField = Object.keys(allErrors)[0];
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (fieldElement) {
        fieldElement.focus();
      }
      return;
    }

    // Additional business logic validations
    const { id, fullname, staffType, contact, email, password } = formData;

    // Final pre-submission validation
    if (!fullname.trim() || !staffType || !contact || !email) {
      showNotification("All fields are required!", "error");
      return;
    }

    if (editIndex === null && !password) {
      showNotification("Password is required for new staff members!", "error");
      return;
    }

    setFormSubmitting(true);
    
    try {
      if (editIndex !== null) {
        // Update staff
        const updateData = {
          fullname: fullname.trim(),
          staffType,
          contact,
          email: email.toLowerCase().trim(),
          role: "staff"
        };

        // Only include password if it's provided (for updates)
        if (password) {
          updateData.password = password;
        }

        await staffService.updateStaff(id, updateData);
        showNotification(`${fullname.trim()} has been updated successfully!`, "success");
      } else {
        // Add new staff
        const staffData = {
          fullname: fullname.trim(),
          staffType: staffType.trim(),
          contact,
          email: email.toLowerCase().trim(),
          password,
          role: "staff"
        };

        console.log("Submitting staff data:", staffData);
        await staffService.createStaff(staffData);
        showNotification(`${fullname.trim()} has been added to your team!`, "success");
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
      // Error is already handled in the service functions
    } finally {
      setFormSubmitting(false);
    }
  };

  // Enhanced form reset
  const resetForm = () => {
    setFormData({ id: null, fullname: "", staffType: "", contact: "", email: "", password: "" });
    setEditIndex(null);
    setPhoneError(false);
    setValidationErrors({});
    setTouchedFields({});
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
    // Reset validation states for editing
    setValidationErrors({});
    setTouchedFields({});
    setPhoneError(false);
  };

  // Enhanced delete handler with better confirmation
  const handleDelete = async (id, name) => {
    const isConfirmed = window.confirm(
      `⚠️ Delete Staff Member\n\nAre you sure you want to permanently delete "${name}"?\n\nThis action cannot be undone and will remove all associated data.`
    );
    
    if (!isConfirmed) return;

    try {
      await staffService.deleteStaff(id);
      showNotification(`${name} has been removed from your team.`, "success");

      // Refresh staff list after delete
      if (activeFilter === "All") {
        fetchAllStaff();
      } else {
        fetchStaffByType(activeFilter);
      }
    } catch (error) {
      // Error is already handled in the service function
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

  // Enhanced notification component with better icons and styling
  const renderNotification = () => {
    if (!notification.show) return null;

    const getNotificationIcon = () => {
      switch (notification.type) {
        case "error":
          return <FaExclamationTriangle className="w-5 h-5" />;
        case "success":
          return <FaCheckCircle className="w-5 h-5" />;
        case "warning":
          return <FaInfoCircle className="w-5 h-5" />;
        default:
          return <FaInfoCircle className="w-5 h-5" />;
      }
    };

    const getNotificationStyles = () => {
      switch (notification.type) {
        case "error":
          return "bg-red-50 text-red-800 border-l-4 border-red-500 shadow-red-100";
        case "success":
          return "bg-green-50 text-green-800 border-l-4 border-green-500 shadow-green-100";
        case "warning":
          return "bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500 shadow-yellow-100";
        default:
          return "bg-blue-50 text-blue-800 border-l-4 border-blue-500 shadow-blue-100";
      }
    };

    return (
      <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-start max-w-md ${getNotificationStyles()}`}>
        <div className="mr-3 mt-0.5">
          {getNotificationIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{notification.message}</p>
        </div>
        <button
          onClick={() => setNotification({ show: false, message: "", type: "" })}
          className="ml-3 text-current opacity-70 hover:opacity-100"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Enhanced input field component with validation display
  const renderInputField = ({ 
    label, 
    name, 
    type = "text", 
    placeholder, 
    icon: Icon, 
    required = false,
    children 
  }) => {
    const hasError = validationErrors[name] && touchedFields[name];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon className="text-gray-400" size={14} />
            </div>
          )}
          {children || (
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur(name)}
              placeholder={placeholder}
              className={`w-full ${Icon ? 'pl-9' : ''} px-3 py-2 bg-gray-50 border ${
                hasError 
                  ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                  : 'border-gray-300 focus:ring-gray-800'
              } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
            />
          )}
        </div>
        {hasError && (
          <div className="mt-1 flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-1" size={12} />
            <p className="text-red-500 text-xs">{validationErrors[name]}</p>
          </div>
        )}
      </div>
    );
  };

  return (
      <div className="flex min-h-screen">
        {/* Enhanced Notification */}
        {renderNotification()}

        {/* Main content area with proper margin for sidebar */}
        <div className="p-6 bg-gray-50 flex-1 ml-64">
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

            {/* Enhanced Form with Comprehensive Validation */}
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
                        {renderInputField({
                          label: "Full Name",
                          name: "fullname",
                          placeholder: "Enter staff name",
                          required: true
                        })}

                        {renderInputField({
                          label: "Staff Type",
                          name: "staffType",
                          required: true,
                          children: (
                            <select
                              name="staffType"
                              value={formData.staffType}
                              onChange={handleInputChange}
                              onBlur={() => handleFieldBlur('staffType')}
                              className={`w-full px-3 py-2 bg-gray-50 border ${
                                validationErrors.staffType && touchedFields.staffType
                                  ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                                  : 'border-gray-300 focus:ring-gray-800'
                              } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                            >
                              <option value="">Select Staff Type</option>
                              {staffTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {formatStaffType(type)}
                                  </option>
                              ))}
                            </select>
                          )
                        })}

                        {renderInputField({
                          label: "Phone Number",
                          name: "contact",
                          placeholder: "10-digit number",
                          icon: FaPhone,
                          required: true
                        })}
                      </div>

                      <div className="space-y-4">
                        {renderInputField({
                          label: "Email Address",
                          name: "email",
                          type: "email",
                          placeholder: "name@example.com",
                          icon: FaEnvelope,
                          required: true
                        })}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editIndex !== null ? "Password (leave blank to keep current)" : "Password"}
                            {editIndex === null && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={() => handleFieldBlur('password')}
                                placeholder={editIndex !== null ? "Enter new password (optional)" : "Enter password"}
                                className={`w-full px-3 py-2 bg-gray-50 border ${
                                  validationErrors.password && touchedFields.password
                                    ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                                    : 'border-gray-300 focus:ring-gray-800'
                                } rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                          </div>
                          {validationErrors.password && touchedFields.password && (
                            <div className="mt-1 flex items-center">
                              <FaExclamationTriangle className="text-red-500 mr-1" size={12} />
                              <p className="text-red-500 text-xs">{validationErrors.password}</p>
                            </div>
                          )}
                          {/* Password strength indicator */}
                          {formData.password && (
                            <div className="mt-2">
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="text-gray-600">Password strength:</span>
                                <div className="flex space-x-1">
                                  {(() => {
                                    const password = formData.password;
                                    const hasLower = /[a-z]/.test(password);
                                    const hasUpper = /[A-Z]/.test(password);
                                    const hasNumber = /\d/.test(password);
                                    const hasMinLength = password.length >= 6;
                                    const strength = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length;
                                    const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
                                    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
                                    
                                    return (
                                      <>
                                        {[1, 2, 3, 4].map(i => (
                                          <div
                                            key={i}
                                            className={`h-1 w-4 rounded ${
                                              i <= strength ? colors[strength - 1] : 'bg-gray-200'
                                            }`}
                                          />
                                        ))}
                                        <span className={`ml-2 ${strength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                                          {strength > 0 ? labels[strength - 1] : 'Too weak'}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                <p>Must contain: uppercase, lowercase, number, min 6 characters</p>
                              </div>
                            </div>
                          )}
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
                              disabled={formSubmitting || Object.keys(validationErrors).length > 0}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaSave className="mr-2" />
                            {formSubmitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {editIndex !== null ? "Updating..." : "Adding..."}
                              </>
                            ) : (
                              editIndex !== null ? "Update Staff" : "Add Staff"
                            )}
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