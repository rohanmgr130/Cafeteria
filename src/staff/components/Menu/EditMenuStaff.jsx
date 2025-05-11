
// import React, { useEffect, useState, useCallback } from 'react';
// import Nav from '../Nav';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// function EditMenu() {
//   const [itemData, setItemData] = useState({
//     title: '',
//     price: '',
//     type: '',
//     menuType: '',
//     category: ''
//   });
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [existingImage, setExistingImage] = useState('');
//   const [imageChanged, setImageChanged] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [fetchLoading, setFetchLoading] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false);

//   const navigate = useNavigate();
//   const { id } = useParams();
//   const API_BASE_URL = 'http://localhost:4000';

//   // Fetch categories with error handling and retry
//   const fetchCategories = useCallback(async (retry = true) => {
//     setFetchLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/category/get-all-category`);
//       const categoriesData = res.data.categories || [];
//       // Extract only category names for the dropdown
//       setCategories(categoriesData.map(category => 
//         typeof category === 'string' ? category : category.name
//       ));
//     } catch (err) {
//       console.error("Failed to load categories", err);
//       toast.error("Failed to load categories");
      
//       // Auto retry once after 2 seconds in case of network error
//       if (retry) {
//         setTimeout(() => fetchCategories(false), 2000);
//       }
//     } finally {
//       setFetchLoading(false);
//     }
//   }, [API_BASE_URL]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setItemData({
//       ...itemData,
//       [name]: value
//     });
//   };

//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setImage(file);
//       setImageChanged(true);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         toast.success('Image updated successfully');
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateForm = () => {
//     if (!itemData.title) {
//       toast.error('Please enter a dish name');
//       return false;
//     }
//     if (!itemData.price) {
//       toast.error('Please enter a price');
//       return false;
//     }
//     if (!itemData.type) {
//       toast.error('Please select a food type');
//       return false;
//     }
//     if (!itemData.menuType) {
//       toast.error('Please select a menu type');
//       return false;
//     }
//     if (!itemData.category) {
//       toast.error('Please select a category');
//       return false;
//     }
//     if (!imagePreview && !existingImage) {
//       toast.error('Please upload an image');
//       return false;
//     }
//     return true;
//   };

  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
      
//     if (!validateForm()) return;
  
//     setSubmitLoading(true);
//     const loadingToast = toast.loading('Updating menu item...');
  
//     try {
//       const formData = new FormData();
//       formData.append('title', itemData.title.trim());
//       formData.append('price', itemData.price);
//       formData.append('type', itemData.type);
//       formData.append('menuType', itemData.menuType);
      
//       // Make sure category exists and is not undefined before appending
//       if (itemData.category) {
//         formData.append('category', itemData.category); 
//       } else {
//         formData.append('category', ''); // Send empty string as fallback
//       }
  
//       if (imageChanged && image) {
//         formData.append('image', image);
//       }
  
//       // Make sure API URL is correct
//       const response = await fetch(`${API_BASE_URL}/api/staff/update-menu/${id}`, {
//         method: 'PUT',
//         body: formData,
//       });
  
//       toast.dismiss(loadingToast);
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `Failed to update menu: ${response.status}`);
//       }
  
//       toast.success('Menu item updated successfully!');
//       setTimeout(() => navigate(-1), 1000);
//     } catch (error) {
//       console.error('Error updating menu item:', error);
//       toast.error(`Failed to update menu item: ${error.message}`);
//     } finally {
//       setSubmitLoading(false);
//       toast.dismiss(loadingToast);
//     }
//   };

//   const handleGetSingleMenu = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/staff/get-single-menu/${id}`);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to fetch menu details');
//       }

//       const data = await response.json();
//       setItemData({
//         title: data.title || '',
//         price: data.price || '',
//         type: (data.type || '').toLowerCase(),
//         menuType: data.menuType || '',
//         category: data.category || ''
//       });

//       if (data.image) {
//         setExistingImage(data.image);
//         setImagePreview(`http://localhost:4000${data.image}`);
//       }
//     } catch (error) {
//       console.error('Error fetching menu details:', error.message);
//       toast.error('Failed to fetch menu details');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const itemTypes = ['Vegetarian', 'Non-vegetarian'];
//   const menuTypes = ['normal', 'todays-special'];

//   useEffect(() => {
//     Promise.all([
//       handleGetSingleMenu(),
//       fetchCategories()
//     ]);
//   }, [id, fetchCategories]);

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 items-center justify-center">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
//           <p className="mt-4 text-gray-600">Loading menu item...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <div className="fixed left-0 top-0 h-full">
//         <Nav />
//       </div>

//       <div className="flex-1 ml-16 md:ml-64 p-4">
//         <div className="max-w-3xl mx-auto">
//           <div className="p-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4 transition-colors duration-200"
//             >
//               Back
//             </button>
//             <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name*</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={itemData.title}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                   placeholder="Enter dish name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)*</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={itemData.price}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                   placeholder="Enter price"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Food Type*</label>
//                 <select
//                   name="type"
//                   value={itemData.type}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                 >
//                   <option value="" disabled>Select a type</option>
//                   {itemTypes.map((type, index) => (
//                     <option key={index} value={type.toLowerCase()}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type*</label>
//                 <select
//                   name="menuType"
//                   value={itemData.menuType}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                 >
//                   <option value="" disabled>Select a type</option>
//                   {menuTypes.map((type, index) => (
//                     <option key={index} value={type}>
//                       {type === 'normal' ? 'Normal' : "Today's Special"}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
//                 <select
//                   name="category"
//                   value={itemData.category}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
//                   disabled={fetchLoading}
//                 >
//                   <option value="" disabled>Select a category</option>
//                   {categories.map((category, index) => (
//                     <option key={index} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//                 {fetchLoading && (
//                   <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Food Image*</label>
//                 <div className="flex items-center space-x-4">
//                   <label className="bg-gray-700 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors duration-200">
//                     Upload Image
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       className="hidden"
//                     />
//                   </label>

//                   {imagePreview && (
//                     <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
//                       <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setImage(null);
//                           setImagePreview(null);
//                           if (existingImage) setImageChanged(true);
//                         }}
//                         className="absolute top-0 right-0 bg-gray-800 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Preview larger image */}
//               {imagePreview && (
//                 <div className="md:col-span-2 mt-2">
//                   <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
//                   <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
//                     <img 
//                       src={imagePreview} 
//                       alt="Item preview" 
//                       className="w-full h-full object-contain" 
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="pt-6">
//               <button
//                 type="submit"
//                 disabled={submitLoading}
//                 className={`w-full ${submitLoading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'} text-white py-3 px-4 rounded-md flex justify-center items-center transition-colors duration-200`}
//               >
//                 {submitLoading ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     UPDATING MENU...
//                   </>
//                 ) : 'UPDATE MENU'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditMenu;


import React, { useEffect, useState, useCallback } from 'react';
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
    category: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [imageChanged, setImageChanged] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImageChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        toast.success('Image updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!itemData.title) {
      toast.error('Please enter a dish name');
      return false;
    }
    if (!itemData.price) {
      toast.error('Please enter a price');
      return false;
    }
    if (!itemData.type) {
      toast.error('Please select a food type');
      return false;
    }
    if (!itemData.menuType) {
      toast.error('Please select a menu type');
      return false;
    }
    if (!itemData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (!imagePreview && !existingImage) {
      toast.error('Please upload an image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!validateForm()) return;
  
    setSubmitLoading(true);
    const loadingToast = toast.loading('Updating menu item...');
  
    try {
      const formData = new FormData();
      formData.append('title', itemData.title.trim());
      formData.append('price', itemData.price);
      formData.append('type', itemData.type);
      formData.append('menuType', itemData.menuType);
      
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
      toast.error(`Failed to update menu item: ${error.message}`);
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
        category: categoryValue
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

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name*</label>
                <input
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)*</label>
                <input
                  type="number"
                  name="price"
                  value={itemData.price}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Type*</label>
                <select
                  name="type"
                  value={itemData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="" disabled>Select a type</option>
                  {itemTypes.map((type, index) => (
                    <option key={index} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type*</label>
                <select
                  name="menuType"
                  value={itemData.menuType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                >
                  <option value="" disabled>Select a type</option>
                  {menuTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type === 'normal' ? 'Normal' : type === 'todays-special' ? "Today's Special" : "Best Seller"}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select
                  name="category"
                  value={itemData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  disabled={fetchLoading}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {fetchLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Image*</label>
                <div className="flex items-center space-x-4">
                  <label className="bg-gray-700 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                          if (existingImage) setImageChanged(true);
                        }}
                        className="absolute top-0 right-0 bg-gray-800 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Preview larger image */}
              {imagePreview && (
                <div className="md:col-span-2 mt-2">
                  <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Item preview" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
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