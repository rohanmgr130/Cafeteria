
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Nav from '../Nav';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

function CreateItem() {
  const [itemData, setItemData] = useState({
    title: '',
    price: '',
    type: '',
    menuType: '',
    category: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:4000';

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
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: value
    });

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
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        toast.success('Image uploaded successfully');
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
    if (!itemData.title.trim()) newErrors.title = 'Dish name is required';
    if (!itemData.price) newErrors.price = 'Price is required';
    else if (parseFloat(itemData.price) <= 0) newErrors.price = 'Price must be greater than zero';
    if (!itemData.type) newErrors.type = 'Food type is required';
    if (!itemData.menuType) newErrors.menuType = 'Menu type is required';
    if (!itemData.category) newErrors.category = 'Category is required';
    if (!itemData.image) newErrors.image = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const errorFields = Object.keys(errors)
        .map(field => field.charAt(0).toUpperCase() + field.slice(1))
        .join(', ');
      toast.error(`Please complete required fields: ${errorFields}`);
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitLoading(true);
    const loadingToast = toast.loading('Adding menu item...');

    try {
      const formData = new FormData();
      formData.append('title', itemData.title.trim());
      formData.append('price', itemData.price);
      formData.append('type', itemData.type);
      formData.append('menuType', itemData.menuType);
      
      // Fix: Changed 'category' to 'categories' to match backend naming
      // Make sure itemData.category is never undefined
      if (itemData.category) {
        formData.append('categories', itemData.category);
      } else {
        formData.append('categories', ''); // Default empty string if no category selected
      }
      
      formData.append('image', itemData.image);

      // Make sure the URL path is correct - including /api prefix
      const response = await fetch(`${API_BASE_URL}/api/staff/add-menu-items`, {
        method: 'POST',
        body: formData
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success(`${itemData.title} added successfully to the menu!`, {
          icon: '✅',
          duration: 4000
        });
        setTimeout(() => navigate('/user-menu'), 1000);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to add menu item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error(`An error occurred: ${error.message || 'Unknown error'}`);
      toast.dismiss(loadingToast);
    } finally {
      setSubmitLoading(false);
    }
  };

  const itemTypes = ['Vegetarian', 'Non-vegetarian'];
  const menuTypes = ['normal', 'todays-special'];

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
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
            >
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Menu Item</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter dish name"
                  className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 error-message">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs)*
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={itemData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className={`w-full p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
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
                  className={`w-full p-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md`}
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
                  className={`w-full p-2 border ${errors.menuType ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                >
                  <option value="" disabled>Select a type</option>
                  {menuTypes.map((menuType, index) => (
                    <option key={index} value={menuType}>
                      {menuType === 'normal' ? 'Normal' : 'Today\'s Special'}
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
                  className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md`}
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
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`w-full p-2 border ${errors.image ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1 error-message">{errors.image}</p>
                  )}

                  {imagePreview && (
                    <div className="mt-2">
                      <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Item preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          ×
                        </button>
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
                className={`w-full ${submitLoading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} text-white py-3 px-4 rounded-md flex justify-center items-center transition-colors duration-200`}
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ADDING MENU ITEM...
                  </>
                ) : 'ADD MENU ITEM'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateItem;