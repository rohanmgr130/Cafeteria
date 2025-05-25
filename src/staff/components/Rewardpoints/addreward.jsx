// AddReward.js - Add new reward item component (like CreateItem.js)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Nav from '../Nav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function AddReward() {
  const [itemData, setItemData] = useState({
    title: '',
    rewardPoints: '',
    type: '',
    categories: '',
    image: '',
    isAvailable: true // Default to available
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  // Fetch categories with error handling and retry
  const fetchCategories = useCallback(async (retry = true) => {
    setFetchLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/get-all-category`);
      const categoriesData = res.data.categories || [];
      // Extract only category names for the dropdown
      setCategories(categoriesData.map(category => 
        typeof category === 'string' ? category : category.name
      ));
    } catch (err) {
      console.error("Failed to load categories", err);
      toast.error("Failed to load categories");
      
      // Auto retry once after 2 seconds in case of network error
      if (retry) {
        setTimeout(() => fetchCategories(false), 2000);
      }
    } finally {
      setFetchLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs separately
    let newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for rewardPoints field - only allow valid numeric input
    if (name === 'rewardPoints' && type !== 'checkbox') {
      // Allow empty string for clearing
      if (value === '') {
        newValue = '';
      } else {
        // Only allow positive integers
        const numericRegex = /^\d+$/;
        if (!numericRegex.test(value)) {
          return; // Don't update state if invalid input
        }
        newValue = value;
      }
    }
    
    setItemData({
      ...itemData,
      [name]: newValue
    });

    // Clear specific field error when user starts typing/selecting
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        toast.success('Image uploaded successfully');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);

      setItemData({
        ...itemData,
        image: file
      });

      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setItemData({
      ...itemData,
      image: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success('Image removed');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!itemData.title || !itemData.title.trim()) {
      newErrors.title = 'Reward item name is required';
    } else if (itemData.title.trim().length < 2) {
      newErrors.title = 'Reward item name must be at least 2 characters long';
    } else if (itemData.title.trim().length > 100) {
      newErrors.title = 'Reward item name cannot exceed 100 characters';
    } else {
      const titleValue = itemData.title.trim();
      // Check for invalid patterns
      if (/^[-\s]+$/.test(titleValue)) {
        newErrors.title = 'Reward item name cannot contain only dashes and spaces';
      } else if (/[-]{3,}/.test(titleValue)) {
        newErrors.title = 'Reward item name cannot contain more than 2 consecutive dashes';
      } else if (/^[^a-zA-Z0-9]/.test(titleValue)) {
        newErrors.title = 'Reward item name must start with a letter or number';
      } else if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-'&,.()]*[a-zA-Z0-9)]?$/.test(titleValue)) {
        newErrors.title = 'Reward item name contains invalid characters. Only letters, numbers, spaces, single dash, apostrophe, &, comma, period, and parentheses are allowed';
      }
    }

    // Reward points validation
    if (!itemData.rewardPoints || itemData.rewardPoints.trim() === '') {
      newErrors.rewardPoints = 'Reward points is required';
    } else {
      const pointsStr = itemData.rewardPoints.toString().trim();
      const pointsNum = parseInt(pointsStr);
      
      // Check if it's a valid number
      if (isNaN(pointsNum) || pointsStr === '') {
        newErrors.rewardPoints = 'Reward points must be a valid number';
      } else if (pointsNum <= 0) {
        newErrors.rewardPoints = 'Reward points must be greater than zero';
      } else if (pointsNum > 99999) {
        newErrors.rewardPoints = 'Reward points cannot exceed 99,999';
      } else if (!/^\d+$/.test(pointsStr)) {
        newErrors.rewardPoints = 'Reward points must be a whole number';
      }
    }

    // Type validation
    if (!itemData.type) {
      newErrors.type = 'Food type is required';
    } else {
      const validTypes = ['vegetarian', 'non-vegetarian', 'drinks'];
      if (!validTypes.includes(itemData.type.toLowerCase())) {
        newErrors.type = 'Please select a valid food type';
      }
    }

    // Category validation
    if (!itemData.categories) {
      newErrors.categories = 'Category is required';
    } else if (categories.length > 0 && !categories.includes(itemData.categories)) {
      newErrors.categories = 'Please select a valid category';
    }

    // Image validation
    if (!itemData.image) {
      newErrors.image = 'Image is required';
    } else if (itemData.image instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(itemData.image.type)) {
        newErrors.image = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
      } else if (itemData.image.size > 5 * 1024 * 1024) {
        newErrors.image = 'Image size should be less than 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorFields = Object.keys(errors)
        .map(field => {
          const fieldNames = {
            title: 'Reward Item Name',
            rewardPoints: 'Reward Points',
            type: 'Food Type',
            categories: 'Category',
            image: 'Image'
          };
          return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
        })
        .join(', ');
      
      toast.error(`Please fix the following errors: ${errorFields}`);
      
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitLoading(true);
    const loadingToast = toast.loading('Adding reward item...');

    try {
      const formData = new FormData();
      formData.append('title', itemData.title.trim());
      formData.append('rewardPoints', parseInt(itemData.rewardPoints));
      formData.append('type', itemData.type.toLowerCase());
      formData.append('categories', itemData.categories);
      formData.append('image', itemData.image);
      // Add availability status
      formData.append('isAvailable', itemData.isAvailable);

      // Make sure the URL path is correct - using your backend route
      const response = await fetch(`${API_BASE_URL}/api/reward-point/add-reward-item`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData, let browser set it
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const responseData = await response.json();
        toast.success(`${itemData.title.trim()} added successfully to reward items!`, {
          icon: '✅',
          duration: 4000
        });
        
        // Reset form
        setItemData({
          title: '',
          rewardPoints: '',
          type: '',
          categories: '',
          image: '',
          isAvailable: true
        });
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        setTimeout(() => navigate('/staff-rewardpoints'), 1000);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Unknown error occurred';
        toast.error(`Failed to add reward item: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding reward item:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
      toast.dismiss(loadingToast);
    } finally {
      setSubmitLoading(false);
    }
  };

  const itemTypes = ['Vegetarian', 'Non-vegetarian', 'Drinks'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full">
        <Nav />
      </div>

      <div className="flex-1 ml-16 md:ml-64 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4 transition-colors duration-200"
            >
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Reward Item</h1>
          </div>

          {/* Clean Availability Card */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${itemData.isAvailable ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                <span className={`font-medium ${itemData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {itemData.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setItemData({ ...itemData, isAvailable: !itemData.isAvailable })}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  itemData.isAvailable 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } transition-colors duration-200`}
              >
                Mark as {itemData.isAvailable ? 'Unavailable' : 'Available'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Item Name*
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleChange}
                  placeholder="Enter reward item name (2-100 characters)"
                  maxLength="100"
                  className={`w-full p-2 border ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.title}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">{itemData.title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="rewardPoints" className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Points*
                </label>
                <input
                  id="rewardPoints"
                  type="text"
                  name="rewardPoints"
                  value={itemData.rewardPoints}
                  onChange={handleChange}
                  placeholder="Enter reward points (e.g., 100)"
                  inputMode="numeric"
                  className={`w-full p-2 border ${errors.rewardPoints ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                />
                {errors.rewardPoints && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.rewardPoints}</p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Type*
                </label>
                <select
                  id="type"
                  name="type"
                  value={itemData.type}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                >
                  <option value="" disabled>Select a type</option>
                  {itemTypes.map((type, index) => (
                    <option key={index} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.type}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="categories"
                  name="categories"
                  value={itemData.categories}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.categories ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                  disabled={fetchLoading}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.categories && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.categories}</p>
                )}
                {fetchLoading && (
                  <p className="text-gray-500 text-xs mt-1">Loading categories...</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Image*
                </label>
                <div className="flex flex-col space-y-2">
                  <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className={`w-full p-2 border ${errors.image ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                  />
                  <p className="text-gray-400 text-xs">Accepted formats: JPEG, PNG, GIF, WebP (Max: 5MB)</p>
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.image}</p>
                  )}

                  {imagePreview && (
                    <div className="mt-2">
                      <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Item preview"
                          className={`w-full h-full object-contain ${!itemData.isAvailable ? 'filter grayscale' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                          title="Remove image"
                        >
                          ×
                        </button>
                        
                        {/* Simple badge for unavailable items */}
                        {!itemData.isAvailable && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white py-1 px-3 rounded-bl-md text-sm font-medium">
                            Not Available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full ${submitLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'} text-white py-3 px-4 rounded-md flex justify-center items-center transition-colors duration-200 font-medium`}
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ADDING REWARD ITEM...
                  </>
                ) : 'ADD REWARD ITEM'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddReward;