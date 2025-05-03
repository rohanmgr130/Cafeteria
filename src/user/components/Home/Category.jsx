import React from 'react';
// import { ChevronRight } from 'lucide-react';

const Category = () => {
  const categories = [
    { 
      name: "Pizza", 
      image: "https://i.pinimg.com/736x/4d/10/8f/4d108f153c9a72d14460079bd5cc353b.jpg" 
    },
    { 
      name: "Lunch", 
      image: "https://i.pinimg.com/736x/af/7d/b0/af7db0d5b72f944a6ef562933e12e287.jpg" 
    },
    { 
      name: "Burger", 
      image: "https://i.pinimg.com/1200x/78/e2/6b/78e26b1bf582014eb19bf782c6932467.jpg" 
    },
    { 
      name: "Noodles", 
      image: "https://i.pinimg.com/736x/64/04/29/640429122e5e0e955b368a4420277ff9.jpg" 
    },
    { 
      name: "Momo", 
      image: "https://i.pinimg.com/736x/ac/96/5d/ac965d02d51ac855678bf37e4216af71.jpg" 
    },
    { 
      name: "Drinks", 
      image: "https://i.pinimg.com/736x/52/1a/c8/521ac8c6b6c203df938fcc414f1de56c.jpg" 
    },
    { 
      name: "Breakfast", 
      image: "https://i.pinimg.com/736x/d2/c8/bb/d2c8bb0dcdc5977f7d53f02211c663ea.jpg" 
    },
    { 
      name: "Katti Roll", 
      image: "https://i.pinimg.com/736x/cb/f8/cd/cbf8cd7273a569c4d96d4b6eb12d211d.jpg" 
    }
  ];

  return (
    <div className="max-full flex flex-col justify-center items-center mx-auto p-6  bg-grey-50 mt-12">
      {/* Header Section */}
      <div className="flex max-w-7xl w-full justify-between items-center mb-8 ">
        <h1 className="text-3xl font-bold text-gray-800">
          Categories
        </h1>
        
        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors">
          <span className="font-medium underline">See All</span>
          {/* <ChevronRight className="w-5 h-5" /> */}
        </button>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="relative group">
            {/* Circle Container */}
            <div className="aspect-square relative overflow-hidden rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-105 cursor-pointer">
              {/* Category Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Hover Overlay with Name */}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-semibold text-center px-4 py-2">
                  {category.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import { ChevronRight } from 'lucide-react';

// const Category = () => {
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // Fetch categories from the backend
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch('http://localhost:4000/api/categories', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
//         }

//         const data = await response.json();
        
//         // Clean the category names if needed
//         const cleanedData = data.map(category => ({
//           ...category,
//           name: cleanCategoryString(category.name)
//         }));
        
//         setCategories(cleanedData);
//       } catch (error) {
//         console.error('Error fetching categories:', error.message);
//         setError('Failed to load categories. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

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
  
//   // Handle category click
//   const handleCategoryClick = (categoryName) => {
//     // Navigate to menu page with category filter
//     navigate(`/menu?category=${encodeURIComponent(categoryName)}`);
//   };

//   // Handle "See All" click
//   const handleSeeAllClick = () => {
//     navigate('/menu');
//   };

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="max-full flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="max-full flex justify-center items-center h-64">
//         <div className="text-center text-red-500">{error}</div>
//       </div>
//     );
//   }

//   // Show empty state if no categories are available
//   if (categories.length === 0) {
//     return (
//       <div className="max-full flex justify-center items-center h-64">
//         <div className="text-center text-gray-500">No categories available</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-full flex flex-col justify-center items-center mx-auto p-6 bg-grey-50">
//       {/* Header Section */}
//       <div className="flex max-w-7xl w-full justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Categories
//         </h1>
        
//         <button 
//           onClick={handleSeeAllClick}
//           className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
//         >
//           <span className="font-medium underline">See All</span>
//           {/* <ChevronRight className="w-5 h-5" /> */}
//         </button>
//       </div>

//       {/* Category Grid */}
//       <div className="max-w-7xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
//         {categories.map((category) => (
//           <div 
//             key={category._id}
//             className="relative group" 
//             onClick={() => handleCategoryClick(category.name)}
//           >
//             {/* Circle Container */}
//             <div className="aspect-square relative overflow-hidden rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-105 cursor-pointer">
//               {/* Category Image */}
//               <img
//                 src={category.image}
//                 alt={category.name}
//                 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/150?text=Category';
//                 }}
//               />
              
//               {/* Hover Overlay with Name */}
//               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 
//                             group-hover:opacity-100 transition-opacity duration-300">
//                 <span className="text-white text-lg font-semibold text-center px-4 py-2">
//                   {category.name}
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Category;