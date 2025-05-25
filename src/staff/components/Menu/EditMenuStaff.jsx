import React, { useEffect, useState, useCallback, useRef } from 'react';
import Nav from '../Nav';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function EditMenu() {
  const [itemData, setItemData] = useState({
    title: '',
    price: '',
    type: '',
    menuType: '',
    category: '',
    isAvailable: true // Default to true
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [imageChanged, setImageChanged] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { id } = useParams();
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

  // Function to directly toggle availability
  const handleToggleAvailability = async () => {
    if (toggleLoading) return;
    
    setToggleLoading(true);
    const loadingToast = toast.loading(`Updating availability...`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/toggle-availability/${id}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update availability');
      }
      
      const data = await response.json();
      
      // Update local state
      setItemData(prev => ({
        ...prev,
        isAvailable: data.isAvailable
      }));
      
      toast.dismiss(loadingToast);
      toast.success(data.message || 'Availability updated successfully');
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to update availability: ${error.message}`);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs separately
    let newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for price field - only allow valid numeric input
    if (name === 'price' && type !== 'checkbox') {
      // Allow empty string for clearing
      if (value === '') {
        newValue = '';
      } else {
        // Only allow numbers and one decimal point
        const numericRegex = /^\d*\.?\d{0,2}$/;
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
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

      setImage(file);
      setImageChanged(true);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        toast.success('Image updated successfully');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);

      // Clear image error if exists
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!itemData.title || !itemData.title.trim()) {
      newErrors.title = 'Dish name is required';
    } else if (itemData.title.trim().length < 2) {
      newErrors.title = 'Dish name must be at least 2 characters long';
    } else if (itemData.title.trim().length > 100) {
      newErrors.title = 'Dish name cannot exceed 100 characters';
    } else {
      const titleValue = itemData.title.trim();
      // Check for invalid patterns
      if (/^[-\s]+$/.test(titleValue)) {
        newErrors.title = 'Dish name cannot contain only dashes and spaces';
      } else if (/[-]{3,}/.test(titleValue)) {
        newErrors.title = 'Dish name cannot contain more than 2 consecutive dashes';
      } else if (/^[^a-zA-Z0-9]/.test(titleValue)) {
        newErrors.title = 'Dish name must start with a letter or number';
      } else if (!/^[a-zA-Z0-9][a-zA-Z0-9\s\-'&,.()]*[a-zA-Z0-9)]?$/.test(titleValue)) {
        newErrors.title = 'Dish name contains invalid characters. Only letters, numbers, spaces, single dash, apostrophe, &, comma, period, and parentheses are allowed';
      }
    }

    // Price validation
    if (!itemData.price || itemData.price.toString().trim() === '') {
      newErrors.price = 'Price is required';
    } else {
      const priceStr = itemData.price.toString().trim();
      const priceNum = parseFloat(priceStr);
      
      // Check if it's a valid number
      if (isNaN(priceNum) || priceStr === '' || priceStr === '.') {
        newErrors.price = 'Price must be a valid number';
      } else if (priceNum <= 0) {
        newErrors.price = 'Price must be greater than zero';
      } else if (priceNum > 99999) {
        newErrors.price = 'Price cannot exceed Rs. 99,999';
      } else if (!/^\d+(\.\d{1,2})?$/.test(priceStr)) {
        newErrors.price = 'Price must be a valid number with maximum 2 decimal places';
      } else if (priceStr.length === 1 && /^[a-zA-Z]$/.test(priceStr)) {
        newErrors.price = 'Price cannot be a single character';
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

    // Menu type validation
    if (!itemData.menuType) {
      newErrors.menuType = 'Menu type is required';
    } else {
      const validMenuTypes = ['normal', 'todays-special', 'best-seller'];
      if (!validMenuTypes.includes(itemData.menuType)) {
        newErrors.menuType = 'Please select a valid menu type';
      }
    }

    // Category validation
    if (!itemData.category) {
      newErrors.category = 'Category is required';
    } else if (categories.length > 0 && !categories.includes(itemData.category)) {
      newErrors.category = 'Please select a valid category';
    }

    // Image validation - only check if no existing image and no new image
    if (!imagePreview && !existingImage) {
      newErrors.image = 'Image is required';
    } else if (image instanceof File) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.type)) {
        newErrors.image = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
      } else if (image.size > 5 * 1024 * 1024) {
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
            title: 'Dish Name',
            price: 'Price',
            type: 'Food Type',
            menuType: 'Menu Type',
            category: 'Category',
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
    const loadingToast = toast.loading('Updating menu item...');
  
    try {
      const formData = new FormData();
      formData.append('title', itemData.title.trim());
      formData.append('price', parseFloat(itemData.price).toFixed(2));
      formData.append('type', itemData.type.toLowerCase());
      formData.append('menuType', itemData.menuType);
      formData.append('isAvailable', itemData.isAvailable);
      
      // Make sure category exists and is not undefined before appending
      if (itemData.category) {
        formData.append('category', itemData.category); 
        // Also add to categories field for compatibility
        formData.append('categories', itemData.category);
      } else {
        formData.append('category', ''); // Send empty string as fallback
        formData.append('categories', '');
      }
  
      if (imageChanged && image) {
        formData.append('image', image);
      }
  
      console.log('Submitting form data:', Object.fromEntries(formData));
  
      // Make sure API URL is correct
      const response = await fetch(`${API_BASE_URL}/api/staff/update-menu/${id}`, {
        method: 'PUT',
        body: formData,
      });
  
      toast.dismiss(loadingToast);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update menu: ${response.status}`);
      }
  
      toast.success('Menu item updated successfully!');
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error('Error updating menu item:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleGetSingleMenu = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching menu item with ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}/api/staff/get-single-menu/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu details');
      }

      const data = await response.json();
      console.log("Menu item data received:", data); // Debugging
      
      // Handle both scenarios: category or categories
      let categoryValue = '';
      
      if (data.category) {
        categoryValue = data.category;
      } else if (data.categories) {
        categoryValue = typeof data.categories === 'string' ? data.categories : 
                       (Array.isArray(data.categories) && data.categories.length > 0) ? 
                       data.categories[0] : '';
      }
      
      setItemData({
        title: data.title || '',
        price: data.price || '',
        type: (data.type || '').toLowerCase(),
        menuType: data.menuType || '',
        category: categoryValue,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true // Set with default if not specified
      });

      if (data.image) {
        setExistingImage(data.image);
        setImagePreview(`${API_BASE_URL}${data.image}`);
      }
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      toast.error('Failed to fetch menu details');
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success('Image removed');
  };

  const itemTypes = ['Vegetarian', 'Non-vegetarian', 'Drinks'];
  const menuTypes = ['normal', 'todays-special', 'best-seller'];

  useEffect(() => {
    // Fetch data when component mounts
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          handleGetSingleMenu()
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Error loading data. Please try again.");
      }
    };
    
    fetchData();
  }, [id, fetchCategories]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          <p className="mt-4 text-gray-600">Loading menu item...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>
          </div>

          {/* Clean Availability Status Card */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <span className={`w-3 h-3 rounded-full ${itemData.isAvailable ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                <span className={`font-medium ${itemData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {itemData.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={toggleLoading}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  toggleLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : itemData.isAvailable 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                } transition-colors duration-200`}
              >
                {toggleLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  `Mark as ${itemData.isAvailable ? 'Unavailable' : 'Available'}`
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Dish Name*
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleChange}
                  placeholder="Enter dish name (2-100 characters)"
                  maxLength="100"
                  className={`w-full p-2 border ${errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.title}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">{itemData.title.length}/100 characters</p>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs)*
                </label>
                <input
                  id="price"
                  type="text"
                  name="price"
                  value={itemData.price}
                  onChange={handleChange}
                  placeholder="Enter price (e.g., 150.50)"
                  inputMode="decimal"
                  className={`w-full p-2 border ${errors.price ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.price}</p>
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
                <label htmlFor="menuType" className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Type*
                </label>
                <select
                  id="menuType"
                  name="menuType"
                  value={itemData.menuType}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.menuType ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                >
                  <option value="" disabled>Select a type</option>
                  {menuTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type === 'normal' ? 'Normal' : type === 'todays-special' ? "Today's Special" : "Best Seller"}
                    </option>
                  ))}
                </select>
                {errors.menuType && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.menuType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={itemData.category}
                  onChange={handleChange}
                  className={`w-full p-2 border ${errors.category ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200`}
                  disabled={fetchLoading}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.category}</p>
                )}
                {fetchLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                )}
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Image*
                </label>
                <div className="flex items-center space-x-4">
                  <label className="bg-gray-700 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                    Upload Image
                    <input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-0 right-0 bg-gray-800 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">Accepted formats: JPEG, PNG, GIF, WebP (Max: 5MB)</p>
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.image}</p>
                )}
              </div>
              
              {/* Preview larger image */}
              {imagePreview && (
                <div className="md:col-span-2 mt-2">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Item preview" 
                      className={`w-full h-full object-contain ${!itemData.isAvailable ? 'filter grayscale' : ''}`}
                    />
                    
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

            <div className="pt-6">
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
                    UPDATING MENU...
                  </>
                ) : 'UPDATE MENU'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditMenu;