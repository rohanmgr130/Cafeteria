// import React, { useEffect, useState } from 'react';
// import Nav from '../Nav';
// import { useNavigate, useParams } from 'react-router-dom';

// function EditMenu() {
//   const [itemData, setItemData] = useState({
//     title: '',
//     price: '',
//     type: '',
//     menuType: '',
//     categories: []
//   });
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [existingImage, setExistingImage] = useState(''); // Track the existing image URL
//   const [imageChanged, setImageChanged] = useState(false); // Track if the image was changed

//   const navigate = useNavigate();
//   const {id} = useParams();

//   // Function to clean category strings
//   const cleanCategoryString = (category) => {
//     if (typeof category === 'string') {
//       // Remove brackets, quotes, and extra characters
//       return category.replace(/[\[\]"']/g, '');
//     }
    
//     if (Array.isArray(category)) {
//       // If it's an array, return the first item without brackets
//       return category[0]?.toString().replace(/[\[\]"']/g, '') || '';
//     }
    
//     return String(category).replace(/[\[\]"']/g, '');
//   };

//   // Handle basic input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setItemData({
//       ...itemData,
//       [name]: value
//     });
//   };

//   // Handle category selection
//   const toggleCategory = (category) => {
//     const categoryLower = category.toLowerCase();
//     // Clean the category name
//     const cleanCategory = cleanCategoryString(categoryLower);
    
//     // Check if this category (or its clean version) is already selected
//     const isSelected = itemData.categories.some(cat => 
//       cleanCategoryString(cat) === cleanCategory
//     );
    
//     if (isSelected) {
//       // Remove category if already selected
//       setItemData({
//         ...itemData,
//         categories: itemData.categories.filter(cat => cleanCategoryString(cat) !== cleanCategory)
//       });
//     } else {
//       // Add category if not selected (as a clean string, not an array)
//       setItemData({
//         ...itemData,
//         categories: [...itemData.categories, cleanCategory]
//       });
//     }
//   };

//   // Handle image upload with preview
//   const handleImageUpload = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       setImage(file);
//       setImageChanged(true); // Mark that the image has been changed
      
//       // Create image preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation check for required fields
//     if (!itemData.title) {
//       alert('Please enter a dish name');
//       return;
//     }
    
//     if (!itemData.price) {
//       alert('Please enter a price');
//       return;
//     }
    
//     if (!itemData.type) {
//       alert('Please select a food type');
//       return;
//     }
    
//     if (!itemData.menuType) {
//       alert('Please select a menu type');
//       return;
//     }
    
//     if (itemData.categories.length === 0) {
//       alert('Please select at least one category');
//       return;
//     }
    
//     // Only require a new image if there's no existing image or the image has been changed
//     if (!imagePreview && !existingImage) {
//       alert('Please upload an image');
//       return;
//     }
    
//     // Create a FormData object to handle file uploads
//     const formData = new FormData();
//     formData.append('title', itemData.title);
//     formData.append('price', itemData.price);
//     formData.append('type', itemData.type);
//     formData.append('menuType', itemData.menuType);
    
//     // Clean categories before sending them
//     const cleanCategories = itemData.categories.map(cat => cleanCategoryString(cat));
//     formData.append('categories', JSON.stringify(cleanCategories));
    
//     // Only append image if a new one was selected
//     if (imageChanged && image) {
//       formData.append('image', image);
//     }

//     try {
//       // Send the update request
//       const response = await fetch(`http://localhost:4000/api/staff/update-menu/${id}`, {
//         method: 'PUT',
//         body: formData,
//         // Don't set Content-Type header when sending FormData
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to update menu: ${response.status} ${response.statusText}`);
//       }

//       // Show success message
//       alert('Menu item updated successfully!');
      
//       // Navigate back
//       navigate(-1);
//     } catch (error) {
//       console.error('Error updating menu item:', error.message);
//       alert(`Failed to update menu item: ${error.message}`);
//     }
//   };

//   const handleGetSingleMenu = async () => {
//     try {
//       const response = await fetch(`http://localhost:4000/api/staff/get-single-menu/${id}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
  
//       // Check if the response is successful
//       if (!response.ok) {
//         throw new Error(`Failed to fetch menu details: ${response.status} ${response.statusText}`);
//       }
  
//       const data = await response.json();
//       console.log("Received data:", data);
//       console.log("Categories before processing:", data.categories);
      
//       // Validate the structure of the response data
//       if (data && data.title && data.price && data.type) {
//         // Process categories, handling potential nested arrays
//         let processedCategories = [];
        
//         if (Array.isArray(data.categories)) {
//           // Clean each category
//           processedCategories = data.categories.map(cat => cleanCategoryString(cat));
//         }
        
//         console.log("Processed categories:", processedCategories);
        
//         setItemData({
//           title: data.title,
//           price: data.price,
//           type: data.type.toLowerCase(),
//           menuType: data.menuType || '', // Set menuType from API or default to empty
//           categories: processedCategories,
//         });
        
//         // Set the existing image URL if available
//         if (data.image) {
//           setExistingImage(data.image);
//           setImagePreview(data.image); // Use the existing image URL as the preview
//         }
//       } else {
//         console.error('Unexpected data structure from API:', data);
//       }
//     } catch (error) {
//       console.error('Error fetching menu details:', error.message);
//     }
//   };
  
//   // Categories to choose from with food menu names
//   const availableCategories = [
//     "Momo", 'Salads', 'Soups', 'Burgers', 'Pasta', 'Pizza', 
//     'Seafood', 'Main Courses', 'Desserts', 'Sandwiches',
//     'Vegan', 'Gluten-Free', 'Chowmein', 'Specials',
//     "Cold-drinks", "Hot-drinks"
//   ];

//   // Types of items
//   const itemTypes = ['Vegetarian', 'Non-vegetarian', 'Drinks', 'Breakfast'];
  
//   // Menu types
//   const menuTypes = ['normal', 'todays-special'];

//   useEffect(() => {
//     // Get menu details
//     handleGetSingleMenu();
//   }, [id]);

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Fixed Nav bar */}
//       <div className="fixed left-0 top-0 h-full">
//         <Nav />
//       </div>
      
//       {/* Main content with margin to accommodate fixed nav */}
//       <div className="flex-1 ml-16 md:ml-64 p-4">
//         <div className="max-w-3xl mx-auto">
//           <div className="p-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
//             >
//               Back
//             </button>
//             <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>
//           </div>
          
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Left column */}
//               <div className="space-y-4">
//                 {/* Title */}
//                 <div>
//                   <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Dish Name*</label>
//                   <input
//                     id="title"
//                     type="text"
//                     name="title"
//                     value={itemData.title}
//                     onChange={handleChange}
//                     placeholder="Enter dish name"
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
//                   />
//                 </div>
                
//                 {/* Price */}
//                 <div>
//                   <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)*</label>
//                   <input
//                     id="price"
//                     type="number"
//                     name="price"
//                     value={itemData.price}
//                     onChange={handleChange}
//                     placeholder="Enter price"
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
//                   />
//                 </div>
                
//                 {/* Type */}
//                 <div>
//                   <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Food Type*</label>
//                   <select
//                     id="type"
//                     name="type"
//                     value={itemData.type}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
//                   >
//                     <option value="" disabled>Select a type</option>
//                     {itemTypes.map((type, index) => (
//                       <option key={index} value={type.toLowerCase()}>{type}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 {/* Menu Type */}
//                 <div>
//                   <label htmlFor="menuType" className="block text-sm font-medium text-gray-700 mb-1">Menu Type*</label>
//                   <select
//                     id="menuType"
//                     name="menuType"
//                     value={itemData.menuType}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
//                   >
//                     <option value="" disabled>Select a type</option>
//                     {menuTypes.map((menuType, index) => (
//                       <option key={index} value={menuType}>
//                         {menuType === 'normal' ? 'Normal' : 'Today\'s Special'}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
                
//                 {/* Image Upload */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Food Image*</label>
//                   <div className="flex items-center space-x-4">
//                     <label className="flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-md cursor-pointer transition">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//                       </svg>
//                       Upload Image
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         className="hidden"
//                       />
//                     </label>
                    
//                     {imagePreview && (
//                       <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-300">
//                         {/* Use different rendering based on whether it's a new or existing image */}
//                         {imageChanged ? (
//                           <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
//                         ) : (
//                           <img src={existingImage} alt="Existing" className="h-full w-full object-cover" />
//                         )}
//                         <button 
//                           type="button" 
//                           onClick={() => {
//                             setImage(null);
//                             setImagePreview(null);
//                             // If there was an existing image and user removes the preview,
//                             // mark it as changed (to be removed)
//                             if (existingImage) {
//                               setImageChanged(true);
//                             }
//                           }}
//                           className="absolute top-0 right-0 bg-gray-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
//                         >
//                           ×
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Right column */}
//               <div>
//                 {/* Categories */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Menu Categories*</label>
//                   <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
                  
//                   <div className="h-64 overflow-y-auto p-2 border border-gray-300 rounded-md">
//                     <div className="grid grid-cols-2 gap-2">
//                       {availableCategories.map((category, index) => {
//                         // Clean comparison for checking if category is selected
//                         const isSelected = itemData.categories.some(cat => 
//                           cleanCategoryString(cat).toLowerCase() === category.toLowerCase()
//                         );
                        
//                         return (
//                           <div key={index} className="flex items-center">
//                             <input
//                               id={`category-${index}`}
//                               type="checkbox"
//                               className="h-4 w-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
//                               checked={isSelected}
//                               onChange={() => toggleCategory(category)}
//                             />
//                             <label htmlFor={`category-${index}`} className="ml-2 text-sm text-gray-700">
//                               {category}
//                             </label>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
                  
//                   {itemData.categories.length > 0 && (
//                     <div className="mt-2">
//                       <p className="text-xs font-medium text-gray-700 mb-1">Selected categories:</p>
//                       <div className="flex flex-wrap gap-1">
//                         {itemData.categories.map((category, index) => (
//                           <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
//                             {/* Display clean category without brackets */}
//                             {cleanCategoryString(category)}
//                             <button
//                               type="button"
//                               onClick={() => toggleCategory(category)}
//                               className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-600 hover:text-gray-900"
//                             >
//                               ×
//                             </button>
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             {/* Submit Button */}
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-md font-medium transition"
//               >
//                 UPDATE MENU
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditMenu;





// import React, { useEffect, useState } from 'react';
// import Nav from '../Nav';
// import { useNavigate, useParams } from 'react-router-dom';

// function EditMenu() {
//   const [itemData, setItemData] = useState({
//     title: '',
//     price: '',
//     type: '',
//     menuType: ''
//   });
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [existingImage, setExistingImage] = useState('');
//   const [imageChanged, setImageChanged] = useState(false);

//   const navigate = useNavigate();
//   const { id } = useParams();

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
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!itemData.title) return alert('Please enter a dish name');
//     if (!itemData.price) return alert('Please enter a price');
//     if (!itemData.type) return alert('Please select a food type');
//     if (!itemData.menuType) return alert('Please select a menu type');
//     if (!imagePreview && !existingImage) return alert('Please upload an image');

//     const formData = new FormData();
//     formData.append('title', itemData.title);
//     formData.append('price', itemData.price);
//     formData.append('type', itemData.type);
//     formData.append('menuType', itemData.menuType);

//     if (imageChanged && image) {
//       formData.append('image', image);
//     }

//     try {
//       const response = await fetch(`http://localhost:4000/api/staff/update-menu/${id}`, {
//         method: 'PUT',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to update menu: ${response.status} ${response.statusText}`);
//       }

//       alert('Menu item updated successfully!');
//       navigate(-1);
//     } catch (error) {
//       console.error('Error updating menu item:', error.message);
//       alert(`Failed to update menu item: ${error.message}`);
//     }
//   };

//   const handleGetSingleMenu = async () => {
//     try {
//       const response = await fetch(`http://localhost:4000/api/staff/get-single-menu/${id}`);
//       if (!response.ok) throw new Error('Failed to fetch menu details');

//       const data = await response.json();
//       setItemData({
//         title: data.title,
//         price: data.price,
//         type: data.type.toLowerCase(),
//         menuType: data.menuType || '',
//       });

//       if (data.image) {
//         setExistingImage(data.image);
//         setImagePreview(data.image);
//       }
//     } catch (error) {
//       console.error('Error fetching menu details:', error.message);
//     }
//   };

//   const itemTypes = ['Vegetarian', 'Non-vegetarian', ];
//   const menuTypes = ['normal', 'todays-special'];

//   useEffect(() => {
//     handleGetSingleMenu();
//   }, [id]);

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
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
//             >
//               Back
//             </button>
//             <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Menu Item</h1>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name*</label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={itemData.title}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)*</label>
//                   <input
//                     type="number"
//                     name="price"
//                     value={itemData.price}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Food Type*</label>
//                   <select
//                     name="type"
//                     value={itemData.type}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="" disabled>Select a type</option>
//                     {itemTypes.map((type, index) => (
//                       <option key={index} value={type.toLowerCase()}>{type}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Menu Type*</label>
//                   <select
//                     name="menuType"
//                     value={itemData.menuType}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   >
//                     <option value="" disabled>Select a type</option>
//                     {menuTypes.map((type, index) => (
//                       <option key={index} value={type}>
//                         {type === 'normal' ? 'Normal' : "Today's Special"}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Food Image*</label>
//                   <div className="flex items-center space-x-4">
//                     <label className="bg-gray-700 text-white px-3 py-2 rounded-md cursor-pointer hover:bg-gray-800">
//                       Upload Image
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         className="hidden"
//                       />
//                     </label>

//                     {imagePreview && (
//                       <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
//                         <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setImage(null);
//                             setImagePreview(null);
//                             if (existingImage) setImageChanged(true);
//                           }}
//                           className="absolute top-0 right-0 bg-gray-800 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center"
//                         >
//                           ×
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="pt-4">
//               <button
//                 type="submit"
//                 className="w-full bg-gray-800 text-white py-3 px-4 rounded-md hover:bg-gray-900"
//               >
//                 UPDATE MENU
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (!validateForm()) return;

  //   setSubmitLoading(true);
  //   const loadingToast = toast.loading('Updating menu item...');

  //   try {
  //     const formData = new FormData();
  //     formData.append('title', itemData.title.trim());
  //     formData.append('price', itemData.price);
  //     formData.append('type', itemData.type);
  //     formData.append('menuType', itemData.menuType);
  //     formData.append('category', itemData.category);

  //     if (imageChanged && image) {
  //       formData.append('image', image);
  //     }

  //     const response = await fetch(`${API_BASE_URL}/api/staff/update-menu/${id}`, {
  //       method: 'PUT',
  //       body: formData,
  //     });

  //     toast.dismiss(loadingToast);

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || `Failed to update menu: ${response.status}`);
  //     }

  //     toast.success('Menu item updated successfully!');
  //     setTimeout(() => navigate(-1), 1000);
  //   } catch (error) {
  //     console.error('Error updating menu item:', error.message);
  //     toast.error(`Failed to update menu item: ${error.message}`);
  //   } finally {
  //     setSubmitLoading(false);
  //     toast.dismiss(loadingToast);
  //   }
  // };

  
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
      } else {
        formData.append('category', ''); // Send empty string as fallback
      }
  
      if (imageChanged && image) {
        formData.append('image', image);
      }
  
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
      const response = await fetch(`${API_BASE_URL}/api/staff/get-single-menu/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu details');
      }

      const data = await response.json();
      setItemData({
        title: data.title || '',
        price: data.price || '',
        type: (data.type || '').toLowerCase(),
        menuType: data.menuType || '',
        category: data.category || ''
      });

      if (data.image) {
        setExistingImage(data.image);
        setImagePreview(`http://localhost:4000${data.image}`);
      }
    } catch (error) {
      console.error('Error fetching menu details:', error.message);
      toast.error('Failed to fetch menu details');
    } finally {
      setIsLoading(false);
    }
  };

  const itemTypes = ['Vegetarian', 'Non-vegetarian'];
  const menuTypes = ['normal', 'todays-special'];

  useEffect(() => {
    Promise.all([
      handleGetSingleMenu(),
      fetchCategories()
    ]);
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
                      {type === 'normal' ? 'Normal' : "Today's Special"}
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