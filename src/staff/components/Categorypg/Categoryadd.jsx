import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Categoryadd() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        e.target.value = null;
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        e.target.value = null;
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', description: '', image: null });
    setImagePreview(null);
    setEditMode(false);
    setCurrentCategoryId(null);
  };

  // Submit form with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Additional validations
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    // For new categories, image is required
    if (!editMode && !formData.image) {
      toast.error('Please select an image for the category');
      return;
    }

    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      let res;
      if (editMode) {
        res = await axios.put(`${API_BASE_URL}/api/category/${currentCategoryId}`, data);
      } else {
        res = await axios.post(API_BASE_URL, data);
      }
      
      toast.success(res.data.message || `Category ${editMode ? 'updated' : 'added'} successfully!`);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} category`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories with error handling and retry
  const fetchCategories = useCallback(async (retry = true) => {
    setFetchLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/category/get-all-category`);
      setCategories(res.data.categories || []);
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

  // Edit category
  const editCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: null // We don't set the actual file here
    });
    setImagePreview(`${API_BASE_URL}/${category.image}`);
    setEditMode(true);
    setCurrentCategoryId(category._id);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Delete category with confirmation
  const deleteCategory = async (id, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (err) {
        console.error("Delete failed", err);
        toast.error(err.response?.data?.message || "Delete failed");
      }
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // FIXED: Updated CategoryCard component with improved text visibility
  const CategoryCard = ({ category }) => (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
      <div className="relative aspect-w-16 aspect-h-9 h-64">
        <img
          src={`${API_BASE_URL}${category.image}`}
          alt={category.name}
          className="h-full w-full object-cover transform group-hover:scale-110 transition-all duration-700 ease-in-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
        {/* Changed gradient overlay to improve text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
        
        {/* Changed text color to white for better visibility */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-semibold mb-1 group-hover:text-white transition-colors duration-300">{category.name}</h3>
          <p className="text-sm text-gray-100 line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300">{category.description || 'No description provided'}</p>
        </div>
      </div>
      
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 transform translate-y-1 group-hover:translate-y-0">
        <div className="flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              editCategory(category);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-gray-600 hover:text-white transition-colors duration-300"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCategory(category._id, category.name);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-red-600 hover:text-white transition-colors duration-300"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-b-4 border-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Category Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">Create, update, and manage your product categories</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <button 
                onClick={() => fetchCategories()}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                disabled={fetchLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Categories
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editMode ? 'Edit Category' : 'Add New Category'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editMode ? 'Update the selected category' : 'Create a new product category'}
                </p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter category name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-gray-500 focus:b-gray-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Enter category description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Image {!editMode && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`mt-1 relative border-2 border-dashed rounded-lg px-6 pt-5 pb-6 text-center ${imagePreview ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gray-400'} transition-colors duration-300`}>
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-gray-600 hover:text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileChange}
                              required={!editMode}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover" 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                      {editMode && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {editMode ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>{editMode ? 'Update Category' : 'Create Category'}</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Categories List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 sm:mb-0">
                  All Categories
                </h2>
                <div className="w-full sm:w-auto relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm transition duration-150 ease-in-out"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {fetchLoading ? (
                  <div className="flex justify-center items-center py-32">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 border-t-gray-500 h-12 w-12 animate-spin"></div>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {searchQuery ? 'No categories match your search' : 'No categories yet'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      {searchQuery ? 'Try adjusting your search terms or clearing filters.' : 'Get started by creating your first category using the form.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredCategories.map(cat => (
                        <CategoryCard key={cat._id} category={cat} />
                      ))}
                    </div>
                    
                    {categories.length > 0 && (
                      <div className="mt-6 text-sm text-gray-500 flex justify-between items-center pt-4 border-t border-gray-200">
                        <span>
                          {searchQuery 
                            ? `Showing ${filteredCategories.length} of ${categories.length} categories` 
                            : `${categories.length} total ${categories.length === 1 ? 'category' : 'categories'}`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Categoryadd;